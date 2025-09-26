"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiHandlers = void 0;
class ApiHandlers {
    constructor(sessionManager) {
        this.sessionManager = sessionManager;
    }
    async generateHandler(req, res) {
        try {
            const request = req.body;
            const { model, prompt, stream = true, system } = request;
            console.log(`Generate request - Model: ${model}, Stream: ${stream}`);
            console.log(`Prompt: ${prompt.substring(0, 100)}...`);
            // Combine system message with prompt if provided
            const fullPrompt = system ? `${system}\n\n${prompt}` : prompt;
            // Get response from Claude Code
            const sessionId = req.headers['x-session-id'] || 'default';
            const response = await this.sessionManager.sendPrompt(sessionId, fullPrompt);
            if (stream) {
                // Send streaming response (NDJSON format)
                res.setHeader('Content-Type', 'application/x-ndjson');
                // Simulate streaming by chunking the response
                const chunks = this.chunkResponse(response);
                for (let i = 0; i < chunks.length; i++) {
                    const isLast = i === chunks.length - 1;
                    const streamResponse = {
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
                        })
                    };
                    res.write(JSON.stringify(streamResponse) + '\n');
                    // Add small delay to simulate streaming
                    if (!isLast) {
                        await new Promise(resolve => setTimeout(resolve, 50));
                    }
                }
                res.end();
            }
            else {
                // Send single response
                const generateResponse = {
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
        }
        catch (error) {
            console.error('Generate handler error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async chatHandler(req, res) {
        try {
            const request = req.body;
            const { model, messages, stream = false, options } = request;
            console.log(`Chat request - Model: ${model}, Stream: ${stream}, Messages: ${messages.length}`);
            // Convert chat messages to a single prompt
            let fullPrompt = '';
            for (const message of messages) {
                switch (message.role) {
                    case 'system':
                        fullPrompt += `System: ${message.content}\n\n`;
                        break;
                    case 'user':
                        fullPrompt += `User: ${message.content}\n\n`;
                        break;
                    case 'assistant':
                        fullPrompt += `Assistant: ${message.content}\n\n`;
                        break;
                }
            }
            // Remove trailing newlines
            fullPrompt = fullPrompt.trim();
            console.log(`Converted prompt: ${fullPrompt.substring(0, 200)}...`);
            // Get response from Claude Code
            const sessionId = req.headers['x-session-id'] || 'default';
            const response = await this.sessionManager.sendPrompt(sessionId, fullPrompt);
            if (stream) {
                // Send streaming response (NDJSON format)
                res.setHeader('Content-Type', 'application/x-ndjson');
                // Simulate streaming by chunking the response
                const chunks = this.chunkResponse(response);
                for (let i = 0; i < chunks.length; i++) {
                    const isLast = i === chunks.length - 1;
                    const streamResponse = {
                        model: model || 'claude-code:latest',
                        created_at: new Date().toISOString(),
                        message: {
                            role: 'assistant',
                            content: chunks[i]
                        },
                        done: isLast,
                        ...(isLast && {
                            total_duration: 1000000000, // 1 second in nanoseconds
                            load_duration: 100000000,
                            prompt_eval_count: this.estimateTokenCount(fullPrompt),
                            prompt_eval_duration: 200000000,
                            eval_count: this.estimateTokenCount(response),
                            eval_duration: 800000000,
                        })
                    };
                    res.write(JSON.stringify(streamResponse) + '\n');
                    // Add small delay to simulate streaming
                    if (!isLast) {
                        await new Promise(resolve => setTimeout(resolve, 50));
                    }
                }
                res.end();
            }
            else {
                // Send single response
                const chatResponse = {
                    model: model || 'claude-code:latest',
                    created_at: new Date().toISOString(),
                    message: {
                        role: 'assistant',
                        content: response
                    },
                    done: true,
                    total_duration: 1000000000,
                    load_duration: 100000000,
                    prompt_eval_count: this.estimateTokenCount(fullPrompt),
                    prompt_eval_duration: 200000000,
                    eval_count: this.estimateTokenCount(response),
                    eval_duration: 800000000,
                };
                res.json(chatResponse);
            }
        }
        catch (error) {
            console.error('Chat handler error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async tagsHandler(req, res) {
        try {
            const response = {
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
                            quantization_level: 'FP16'
                        }
                    }
                ]
            };
            res.json(response);
        }
        catch (error) {
            console.error('Tags handler error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async versionHandler(req, res) {
        res.json({
            version: '1.0.0-claude-proxy'
        });
    }
    async pullHandler(req, res) {
        // Mock pull response - always success since we don't actually pull models
        res.setHeader('Content-Type', 'application/x-ndjson');
        const pullResponses = [
            { status: 'pulling manifest' },
            { status: 'downloading', digest: 'sha256:mock', total: 1000000000, completed: 1000000000 },
            { status: 'verifying sha256 digest' },
            { status: 'writing manifest' },
            { status: 'success' }
        ];
        for (const response of pullResponses) {
            res.write(JSON.stringify(response) + '\n');
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        res.end();
    }
    async healthHandler(req, res) {
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'claude-code-proxy'
        });
    }
    chunkResponse(response) {
        // Split response into chunks for streaming simulation
        const words = response.split(' ');
        const chunks = [];
        for (let i = 0; i < words.length; i++) {
            if (i === 0) {
                chunks.push(words[i]);
            }
            else {
                chunks.push(' ' + words[i]);
            }
        }
        // Ensure we have at least one chunk
        if (chunks.length === 0) {
            chunks.push(response || '');
        }
        return chunks;
    }
    estimateTokenCount(text) {
        // Rough estimation: ~4 characters per token
        return Math.ceil(text.length / 4);
    }
}
exports.ApiHandlers = ApiHandlers;
//# sourceMappingURL=api-handlers.js.map