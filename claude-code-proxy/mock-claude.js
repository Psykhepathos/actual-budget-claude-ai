
console.log('Claude Code Mock Started');
process.stdin.setEncoding('utf-8');
process.stdin.on('data', (data) => {
  const prompt = data.toString().trim();
  console.log('Human: ' + prompt);

  // Simular resposta do Claude
  setTimeout(() => {
    console.log('Assistant: Esta é uma resposta simulada para: "' + prompt.substring(0, 50) + '"');
    console.log('\nHuman: ');
  }, 1000);
});
