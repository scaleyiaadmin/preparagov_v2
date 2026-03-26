const { ESLint } = require('eslint');

async function main() {
  const eslint = new ESLint();
  const results = await eslint.lintFiles(['src/pages/**/*.tsx']);
  
  const errors = results.filter(r => r.errorCount > 0);
  
  for (const result of errors) {
    console.log(`\nFILE: ${result.filePath}`);
    for (const msg of result.messages) {
      if (msg.severity === 2) {
        console.log(`  Line ${msg.line}: ${msg.message} (${msg.ruleId})`);
      }
    }
  }
}

main().catch(console.error);
