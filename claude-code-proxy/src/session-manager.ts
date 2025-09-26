import { spawn, ChildProcess } from 'child_process';

import { v4 as uuidv4 } from 'uuid';

import { ClaudeCodeSession } from './types';

export class ClaudeCodeSessionManager {
  private sessions = new Map<string, ClaudeCodeSession>();
  private sessionTimeout = 30 * 60 * 1000; // 30 minutes

  constructor() {
    // Cleanup expired sessions every 5 minutes
    setInterval(() => this.cleanupExpiredSessions(), 5 * 60 * 1000);
  }

  async getOrCreateSession(sessionId?: string): Promise<ClaudeCodeSession> {
    // For --print mode, we don't need persistent sessions
    // Just return a dummy session object for compatibility
    return {
      id: sessionId || 'default',
      process: null as any,
      inputStream: null as any,
      isAlive: true,
      lastUsed: new Date(),
    };
  }

  private async createSession(sessionId: string): Promise<ClaudeCodeSession> {
    return new Promise((resolve, reject) => {
      try {
        // Determine Claude executable path
        const claudeCommand = process.env.CLAUDE_CODE_COMMAND || 'claude';

        // Parse command and args if it's a custom command
        const [command, ...args] = claudeCommand.split(' ');

        // Spawn Claude process in print mode for programmatic access
        const claudeProcess = spawn(
          command,
          args.length > 0 ? args : ['--print'],
          {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: {
              ...process.env,
              // Ensure Claude runs in non-TTY mode for programmatic access
              NO_COLOR: '1',
              TERM: 'dumb',
              // Fix encoding issues
              CHCP: '65001', // UTF-8 on Windows
            },
            shell: process.platform === 'win32', // Use shell on Windows
          },
        );

        if (!claudeProcess.stdin || !claudeProcess.stdout) {
          throw new Error('Failed to create process streams');
        }

        const session: ClaudeCodeSession = {
          id: sessionId,
          process: claudeProcess,
          inputStream: claudeProcess.stdin,
          isAlive: true,
          lastUsed: new Date(),
        };

        // Handle process events
        claudeProcess.on('error', (error: Error) => {
          console.error(
            `Claude Code process error for session ${sessionId}:`,
            error,
          );
          session.isAlive = false;
          reject(error);
        });

        claudeProcess.on('exit', (code: number | null) => {
          console.log(
            `Claude Code process exited for session ${sessionId} with code:`,
            code,
          );
          session.isAlive = false;
        });

        // Wait a moment for process to initialize
        setTimeout(() => {
          resolve(session);
        }, 1000);
      } catch (error) {
        console.error(
          `Failed to create Claude Code session ${sessionId}:`,
          error,
        );
        reject(error);
      }
    });
  }

  async sendPrompt(sessionId: string, prompt: string): Promise<string> {
    // For --print mode, spawn a new Claude process for each prompt
    return new Promise((resolve, reject) => {
      const claudeCommand = process.env.CLAUDE_CODE_COMMAND || 'claude';

      const [command, ...args] = claudeCommand.split(' ');

      console.log(
        `[Request ${sessionId}] Sending prompt:`,
        prompt.substring(0, 100),
      );

      // Spawn Claude in print mode for this single request
      const claudeProcess = spawn(
        command,
        args.length > 0 ? args : ['--print'],
        {
          stdio: ['pipe', 'pipe', 'pipe'],
          env: {
            ...process.env,
            NO_COLOR: '1',
            TERM: 'dumb',
            CHCP: '65001', // UTF-8 on Windows
          },
          shell: process.platform === 'win32',
        },
      );

      if (!claudeProcess.stdin || !claudeProcess.stdout) {
        reject(new Error('Failed to create process streams'));
        return;
      }

      let responseBuffer = '';
      let errorBuffer = '';

      // Collect stdout
      claudeProcess.stdout.on('data', (data: Buffer) => {
        responseBuffer += data.toString();
      });

      // Collect stderr
      claudeProcess.stderr?.on('data', (data: Buffer) => {
        errorBuffer += data.toString();
      });

      // Handle process completion
      claudeProcess.on('close', (code: number | null) => {
        console.log(`[Request ${sessionId}] Process exited with code:`, code);

        if (code === 0 && responseBuffer.trim()) {
          const parsedResponse = this.parseClaudeResponse(responseBuffer);
          console.log(
            `[Request ${sessionId}] Response:`,
            parsedResponse.substring(0, 100),
          );
          resolve(parsedResponse);
        } else {
          console.error(`[Request ${sessionId}] Error:`, errorBuffer);
          reject(
            new Error(
              `Claude process failed with code ${code}: ${errorBuffer}`,
            ),
          );
        }
      });

      // Handle process errors
      claudeProcess.on('error', (error: Error) => {
        console.error(`[Request ${sessionId}] Process error:`, error);
        reject(error);
      });

      // Send the prompt and close stdin
      try {
        claudeProcess.stdin.write(prompt);
        claudeProcess.stdin.end(); // Close stdin to signal end of input
      } catch (error) {
        reject(error);
      }
    });
  }

  private isResponseComplete(responseBuffer: string): boolean {
    // Check for common response completion indicators
    const completionIndicators = [
      'Human:', // Claude Code waiting for next input
      '\nuser:', // Alternative format
      '> ', // Command prompt
    ];

    return completionIndicators.some(indicator =>
      responseBuffer.toLowerCase().includes(indicator.toLowerCase()),
    );
  }

  private parseClaudeResponse(rawResponse: string): string {
    // Extract useful response from Claude Code interactive output
    let response = rawResponse;

    // Remove common Claude Code interactive prefixes/suffixes
    response = response
      .replace(/^.*?(?:assistant|claude):\s*/i, '') // Remove assistant prefix
      .replace(/^.*?human:\s*/gi, '') // Remove human prefix
      .replace(/\n\s*human:\s*$/i, '') // Remove trailing human prompt
      .replace(/\n\s*>\s*$/i, '') // Remove command prompt
      .replace(/^\s*\n+/, '') // Remove leading newlines
      .replace(/\n\s*$/, '') // Remove trailing newlines
      .trim();

    // If response is empty or too short, try to extract meaningful content
    if (!response || response.length < 3) {
      // Try to find the actual response content
      const lines = rawResponse.split('\n');
      const meaningfulLines = lines.filter(
        line =>
          line.trim() &&
          !line.toLowerCase().includes('human:') &&
          !line.toLowerCase().includes('user:') &&
          !line.includes('>'),
      );

      if (meaningfulLines.length > 0) {
        response = meaningfulLines.join('\n').trim();
      } else {
        response = rawResponse.trim();
      }
    }

    return response || 'No response received';
  }

  private isSessionAlive(session: ClaudeCodeSession): boolean {
    return (
      session.isAlive &&
      session.process &&
      !session.process.killed &&
      new Date().getTime() - session.lastUsed.getTime() < this.sessionTimeout
    );
  }

  private cleanupExpiredSessions(): void {
    const now = new Date();

    for (const [sessionId, session] of this.sessions.entries()) {
      if (
        !this.isSessionAlive(session) ||
        now.getTime() - session.lastUsed.getTime() > this.sessionTimeout
      ) {
        console.log(`Cleaning up expired session: ${sessionId}`);

        if (session.process && !session.process.killed) {
          session.process.kill();
        }

        this.sessions.delete(sessionId);
      }
    }
  }

  async closeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      if (session.process && !session.process.killed) {
        session.process.kill();
      }
      this.sessions.delete(sessionId);
      console.log(`Closed session: ${sessionId}`);
    }
  }

  async closeAllSessions(): Promise<void> {
    for (const [sessionId] of this.sessions.entries()) {
      await this.closeSession(sessionId);
    }
    console.log('All sessions closed');
  }
}
