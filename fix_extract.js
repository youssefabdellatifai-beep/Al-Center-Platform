const fs = require('fs');
let code = fs.readFileSync('extract_students.js', 'utf8');
code = code.replace(/\\\$\{/g, '${');
fs.writeFileSync('extract_students.js', code, 'utf8');

const exec = require('child_process').execSync;
exec('node extract_students.js', { stdio: 'inherit' });
