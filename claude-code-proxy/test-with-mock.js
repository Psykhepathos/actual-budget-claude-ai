// Teste com mock do Claude Code para desenvolvimento
const http = require('http');

// Mock Claude Code para teste local
const { spawn } = require('child_process');
const path = require('path');

// Cria um mock script do Claude Code
const mockClaudeScript = `
console.log('Claude Code Mock Started');
process.stdin.setEncoding('utf-8');
process.stdin.on('data', (data) => {
  const prompt = data.toString().trim();
  console.log('Human: ' + prompt);

  // Simular resposta do Claude
  setTimeout(() => {
    console.log('Assistant: Esta é uma resposta simulada para: "' + prompt.substring(0, 50) + '"');
    console.log('\\nHuman: ');
  }, 1000);
});
`;

// Salvar mock script
require('fs').writeFileSync('./mock-claude.js', mockClaudeScript);

// Testar o proxy com mock
function testProxyWithMock() {
  console.log('🧪 Testando Claude Code Proxy com Mock...\n');

  // Primeiro, substituir o comando claude-code por nosso mock
  process.env.CLAUDE_CODE_COMMAND = 'node mock-claude.js';

  setTimeout(() => {
    // Teste 1: Health check
    console.log('1. Testando health check...');
    makeRequest('GET', '/health', null, (response) => {
      console.log('✅ Health check:', response.status);

      // Teste 2: Generate com mock
      console.log('\n2. Testando /api/generate com mock...');
      const generateRequest = {
        model: 'claude-code:latest',
        prompt: 'Classifique esta transação: Supermercado XYZ -45.30',
        stream: false
      };

      makeRequest('POST', '/api/generate', generateRequest, (response) => {
        console.log('✅ Generate endpoint funcionando!');
        console.log('Resposta:', response.response?.substring(0, 200));

        console.log('\n🎉 Teste com mock concluído!');
        console.log('\n📝 Para usar com Claude Code real:');
        console.log('   1. Instale: npm install -g @anthropics/claude-code');
        console.log('   2. Configure: export ANTHROPIC_API_KEY=sua_chave');
        console.log('   3. Remova CLAUDE_CODE_COMMAND do ambiente');
      });
    });
  }, 3000); // Aguardar proxy iniciar
}

function makeRequest(method, path, data, callback) {
  const postData = data ? JSON.stringify(data) : null;

  const options = {
    hostname: 'localhost',
    port: 11434,
    path: path,
    method: method,
    headers: {
      'Content-Type': 'application/json',
      ...(postData && { 'Content-Length': Buffer.byteLength(postData) })
    }
  };

  const req = http.request(options, (res) => {
    let body = '';

    res.on('data', (chunk) => {
      body += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(body);
        callback(response);
      } catch (error) {
        console.error('❌ Erro parsing JSON:', error.message);
        console.log('Raw response:', body);
        callback({ error: 'Invalid JSON response', raw: body });
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erro na requisição:', error.message);
    console.log('💡 Certifique-se de que o proxy está rodando: npm run dev');
  });

  if (postData) {
    req.write(postData);
  }

  req.end();
}

testProxyWithMock();