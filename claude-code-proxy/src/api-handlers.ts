import { Request, Response } from 'express';

import { ClaudeCodeSessionManager } from './session-manager';
import {
  OllamaGenerateRequest,
  OllamaGenerateResponse,
  OllamaTagsResponse,
  OllamaChatRequest,
  OllamaChatResponse,
  AnthropicRequest,
  AnthropicResponse,
} from './types';

export class ApiHandlers {
  constructor(private sessionManager: ClaudeCodeSessionManager) {}

  async generateHandler(req: Request, res: Response): Promise<void> {
    try {
      const request: OllamaGenerateRequest = req.body;
      const { model, prompt, stream = true, system } = request;

      console.log(`Generate request - Model: ${model}, Stream: ${stream}`);
      console.log(`Prompt: ${prompt.substring(0, 100)}...`);

      // Combine system message with prompt if provided
      const fullPrompt = system ? `${system}\n\n${prompt}` : prompt;

      // Get response from Claude Code
      const sessionId = (req.headers['x-session-id'] as string) || 'default';
      const response = await this.sessionManager.sendPrompt(
        sessionId,
        fullPrompt,
      );

      if (stream) {
        // Send streaming response (NDJSON format)
        res.setHeader('Content-Type', 'application/x-ndjson');

        // Simulate streaming by chunking the response
        const chunks = this.chunkResponse(response);

        for (let i = 0; i < chunks.length; i++) {
          const isLast = i === chunks.length - 1;

          const streamResponse: OllamaGenerateResponse = {
            model: model || 'claude-code:latest',
            created_at: new Date().toISOString(),
            response: chunks[i],
            done: isLast,
            ...(isLast && {
              total_duration: 1000000000, // 1 second in nanoseconds
              load_duration: 100000000,
              prompt_eval_count: this.estimateTokenCount(fullPrompt),
              prompt_eval_duration: 200000000,
              eval_count: this.estimateTokenCount(response),
              eval_duration: 800000000,
            }),
          };

          res.write(JSON.stringify(streamResponse) + '\n');

          // Add small delay to simulate streaming
          if (!isLast) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }

        res.end();
      } else {
        // Send single response
        const generateResponse: OllamaGenerateResponse = {
          model: model || 'claude-code:latest',
          created_at: new Date().toISOString(),
          response,
          done: true,
          total_duration: 1000000000,
          load_duration: 100000000,
          prompt_eval_count: this.estimateTokenCount(fullPrompt),
          prompt_eval_duration: 200000000,
          eval_count: this.estimateTokenCount(response),
          eval_duration: 800000000,
        };

        res.json(generateResponse);
      }
    } catch (error) {
      console.error('Generate handler error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async chatHandler(req: Request, res: Response): Promise<void> {
    try {
      const request: OllamaChatRequest = req.body;
      const { model, messages, stream = false, options } = request;

      console.log(
        `Chat request - Model: ${model}, Stream: ${stream}, Messages: ${messages ? messages.length : 0}`,
      );

      // Convert chat messages to a single prompt with strict JSON formatting instructions
      let fullPrompt = '';

      if (messages && Array.isArray(messages)) {
        for (const message of messages) {
          switch (message.role) {
            case 'system':
              fullPrompt += `System: ${message.content}\n\n`;
              break;
            case 'user':
              fullPrompt += `${message.content}\n\n`;
              break;
            case 'assistant':
              fullPrompt += `Assistant: ${message.content}\n\n`;
              break;
          }
        }
      }

      // Add strict formatting instructions
      fullPrompt =
        fullPrompt.trim() +
        `\n\nIMPORTANT: You MUST respond with ONLY valid JSON in one of these exact formats:

For existing category:
{"type": "existing", "categoryId": "uuid-here"}

For new category:
{"type": "new", "newCategory": {"name": "Category Name", "groupName": "Group Name", "groupIsNew": false}}

For rule creation:
{"type": "rule", "categoryId": "uuid-here", "ruleName": "Rule Name"}

Do NOT include any explanations, markdown formatting, or conversational text. ONLY return the JSON object.
Na hora que for processar a transação para me retornar o json, saiba que estamos no contexto brasileiro, as categorias não
devem ser em inglês e sim em português, mesmo as que já existem, ignore elas se forem em inglês, também entenda exatamente a descrição da transação para colocar ela na melhor categoria possivel
se essa categoria nao existis, mais tarde irei entrar em contato para criar uma categoria nova, entenda que tudo é no contexto brasileiro`;

      console.log(`Converted prompt: ${fullPrompt.substring(0, 200)}...`);

      // Get response from Claude Code
      const sessionId = (req.headers['x-session-id'] as string) || 'default';
      const rawResponse = await this.sessionManager.sendPrompt(
        sessionId,
        fullPrompt,
      );

      // Extract JSON from response (handle markdown wrapping)
      let cleanedResponse = rawResponse;

      // Remove markdown code blocks if present
      if (rawResponse.includes('```json')) {
        const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          cleanedResponse = jsonMatch[1].trim();
        }
      } else if (rawResponse.includes('```')) {
        const jsonMatch = rawResponse.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          cleanedResponse = jsonMatch[1].trim();
        }
      }

      // Try to find JSON object if not already extracted
      if (!cleanedResponse.startsWith('{')) {
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanedResponse = jsonMatch[0];
        }
      }

      // Normal mode: validate JSON
      try {
        JSON.parse(cleanedResponse);
      } catch (jsonError) {
        console.error('Invalid JSON response:', cleanedResponse);
        console.error('Original response:', rawResponse);
        // Fallback to original response if JSON extraction fails
        cleanedResponse = rawResponse;
      }

      console.log(`Cleaned response: ${cleanedResponse.substring(0, 200)}...`);

      if (stream) {
        // Send streaming response (NDJSON format)
        res.setHeader('Content-Type', 'application/x-ndjson');

        // For streaming, send the cleaned response in chunks
        const chunks = this.chunkResponse(cleanedResponse);

        for (let i = 0; i < chunks.length; i++) {
          const isLast = i === chunks.length - 1;

          const streamResponse: OllamaChatResponse = {
            model: model || 'claude-code:latest',
            created_at: new Date().toISOString(),
            message: {
              role: 'assistant',
              content: chunks[i],
            },
            done: isLast,
            ...(isLast && {
              total_duration: 1000000000, // 1 second in nanoseconds
              load_duration: 100000000,
              prompt_eval_count: this.estimateTokenCount(fullPrompt),
              prompt_eval_duration: 200000000,
              eval_count: this.estimateTokenCount(cleanedResponse),
              eval_duration: 800000000,
            }),
          };

          res.write(JSON.stringify(streamResponse) + '\n');

          // Add small delay to simulate streaming
          if (!isLast) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }

        res.end();
      } else {
        // Send single response with cleaned JSON
        const chatResponse: OllamaChatResponse = {
          model: model || 'claude-code:latest',
          created_at: new Date().toISOString(),
          message: {
            role: 'assistant',
            content: cleanedResponse,
          },
          done: true,
          total_duration: 1000000000,
          load_duration: 100000000,
          prompt_eval_count: this.estimateTokenCount(fullPrompt),
          prompt_eval_duration: 200000000,
          eval_count: this.estimateTokenCount(cleanedResponse),
          eval_duration: 800000000,
        };

        res.json(chatResponse);
      }
    } catch (error) {
      console.error('Chat handler error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async anthropicHandler(req: Request, res: Response): Promise<void> {
    try {
      const request: AnthropicRequest = req.body;
      const {
        model,
        messages,
        max_tokens,
        temperature,
        stream = false,
      } = request;

      console.log(
        `Anthropic request - Model: ${model}, Stream: ${stream}, Messages: ${messages ? messages.length : 0}`,
      );

      // Convert messages to a single prompt with strict JSON formatting instructions
      let fullPrompt = '';

      if (messages && Array.isArray(messages)) {
        for (const message of messages) {
          // Handle content that might be string or array of objects
          let content = '';
          if (typeof message.content === 'string') {
            content = message.content;
          } else if (Array.isArray(message.content)) {
            // Extract text from content array (Anthropic format)
            content = message.content
              .filter(item => item.type === 'text')
              .map(item => item.text)
              .join(' ');
          } else {
            content = String(message.content);
          }

          switch (message.role) {
            case 'user':
              fullPrompt += `${content}\n\n`;
              break;
            case 'assistant':
              fullPrompt += `Assistant: ${content}\n\n`;
              break;
          }
        }
      }

      // Add strict formatting instructions
      fullPrompt =
        fullPrompt.trim() +
        `\n\nIMPORTANT: You MUST respond with ONLY valid JSON in one of these exact formats:

For existing category:
{"type": "existing", "categoryId": "uuid-here"}

For new category:
{"type": "new", "newCategory": {"name": "Category Name", "groupName": "Group Name", "groupIsNew": false}}

For rule creation:
{"type": "rule", "categoryId": "uuid-here", "ruleName": "Rule Name"}

Do NOT include any explanations, markdown formatting, or conversational text. ONLY return the JSON object.
Na hora que for processar a transação para me retornar o json, saiba que estamos no contexto brasileiro, as categorias não
devem ser em inglês e sim em português, mesmo as que já existem, ignore elas se forem em inglês, também entenda exatamente a descrição da transação para colocar ela na melhor categoria possivel
se essa categoria nao existis, mais tarde irei entrar em contato para criar uma categoria nova, entenda que tudo é no contexto brasileiro
caso tenha duvida, raciocine sobre o valor da compra, o nome do lugar, pesquisa na internet pra tentar trazer com exatidão a categoria correta`;
      console.log(`Anthropic prompt: ${fullPrompt.substring(0, 200)}...`);

      // Get response from Claude Code
      const sessionId = (req.headers['x-session-id'] as string) || 'default';
      const rawResponse = await this.sessionManager.sendPrompt(
        sessionId,
        fullPrompt,
      );

      // Clean JSON response (remove markdown, etc.)
      let cleanedResponse = rawResponse;

      // Remove markdown code blocks if present
      if (rawResponse.includes('```json')) {
        const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          cleanedResponse = jsonMatch[1].trim();
        }
      } else if (rawResponse.includes('```')) {
        const jsonMatch = rawResponse.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          cleanedResponse = jsonMatch[1].trim();
        }
      }

      // Try to find JSON object if not already extracted
      if (!cleanedResponse.startsWith('{')) {
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanedResponse = jsonMatch[0];
        }
      }

      console.log(
        `Anthropic cleaned response: ${cleanedResponse.substring(0, 200)}...`,
      );

      // Format as Anthropic response
      const anthropicResponse: AnthropicResponse = {
        id: `msg-${Date.now()}`,
        type: 'message',
        role: 'assistant',
        model: model || 'claude-3-sonnet-20240229',
        content: [
          {
            type: 'text',
            text: cleanedResponse,
          },
        ],
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: {
          input_tokens: this.estimateTokenCount(fullPrompt),
          output_tokens: this.estimateTokenCount(cleanedResponse),
        },
      };

      res.json(anthropicResponse);
    } catch (error) {
      console.error('Anthropic handler error:', error);
      res.status(500).json({
        error: {
          type: 'api_error',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }

  async tagsHandler(req: Request, res: Response): Promise<void> {
    try {
      const response: OllamaTagsResponse = {
        models: [
          {
            name: 'claude-code:latest',
            model: 'claude-code:latest',
            modified_at: new Date().toISOString(),
            size: 1000000000, // 1GB mock size
            digest: 'sha256:claude-code-proxy-v1',
            details: {
              parent_model: '',
              format: 'claude',
              family: 'claude',
              families: ['claude'],
              parameter_size: 'Anthropic Claude',
              quantization_level: 'FP16',
            },
          },
        ],
      };

      res.json(response);
    } catch (error) {
      console.error('Tags handler error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async versionHandler(req: Request, res: Response): Promise<void> {
    res.json({
      version: '1.0.0-claude-proxy',
    });
  }

  async pullHandler(req: Request, res: Response): Promise<void> {
    // Mock pull response - always success since we don't actually pull models
    res.setHeader('Content-Type', 'application/x-ndjson');

    const pullResponses = [
      { status: 'pulling manifest' },
      {
        status: 'downloading',
        digest: 'sha256:mock',
        total: 1000000000,
        completed: 1000000000,
      },
      { status: 'verifying sha256 digest' },
      { status: 'writing manifest' },
      { status: 'success' },
    ];

    for (const response of pullResponses) {
      res.write(JSON.stringify(response) + '\n');
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    res.end();
  }

  async healthHandler(req: Request, res: Response): Promise<void> {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'claude-code-proxy',
    });
  }

  private chunkResponse(response: string): string[] {
    // Split response into chunks for streaming simulation
    const words = response.split(' ');
    const chunks: string[] = [];

    for (let i = 0; i < words.length; i++) {
      if (i === 0) {
        chunks.push(words[i]);
      } else {
        chunks.push(' ' + words[i]);
      }
    }

    // Ensure we have at least one chunk
    if (chunks.length === 0) {
      chunks.push(response || '');
    }

    return chunks;
  }

  private estimateTokenCount(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}
