// Teste rápido para verificar se o proxy está funcionando
const http = require('http');

// Função para fazer uma requisição de teste
function testProxy() {
  console.log('🧪 Testando Claude Code Proxy...\n');

  // Teste 1: Health check
  console.log('1. Testando health check...');
  makeRequest('GET', '/health', null, (response) => {
    console.log('✅ Health check:', response.status);

    // Teste 2: Tags endpoint
    console.log('\n2. Testando /api/tags...');
    makeRequest('GET', '/api/tags', null, (response) => {
      console.log('✅ Tags endpoint:', response.models?.length, 'modelos');

      // Teste 3: Generate endpoint
      console.log('\n3. Testando /api/generate...');
      const generateRequest = {
        model: 'claude-code:latest',
        prompt: 'Olá, você consegue me ajudar com uma classificação de transação?',
        stream: false
      };

      makeRequest('POST', '/api/generate', generateRequest, (response) => {
        console.log('✅ Generate endpoint funcionando!');
        console.log('Resposta:', response.response?.substring(0, 100) + '...');

        console.log('\n🎉 Todos os testes passaram! O proxy está funcionando.');
        console.log('\n📝 Próximos passos:');
        console.log('   1. Configure ANTHROPIC_API_KEY se não estiver configurada');
        console.log('   2. Teste com actual-ai addon');
        console.log('   3. Execute: yarn start:server-dev-ai');
      });
    });
  });
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
        callback({ error: 'Invalid JSON response' });
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

// Aguardar um pouco e executar teste
setTimeout(testProxy, 2000);