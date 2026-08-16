const fs = require('fs');

let lines = fs.readFileSync('src/app/page.tsx', 'utf8').split(/\r?\n/);

const replaceFetch = (name, table) => {
  const s = lines.findIndex(l => l.includes('const fetch' + name + ' = async () => {'));
  if (s === -1) return;
  const logIdx = lines.findIndex((l, i) => i > s && l.includes('if (error'));
  if (logIdx !== -1) {
    lines[logIdx] = `        if (error) console.error("❌ Error fetching ${table}:", error); else console.log("✅ Fetched ${table} successfully. Count:", data?.length, "TeacherId:", teacherId);`;
  }
};

replaceFetch('Groups', 'groups');
replaceFetch('Students', 'students');
replaceFetch('Payments', 'payments');
replaceFetch('Materials', 'materials');

fs.writeFileSync('src/app/page.tsx', lines.join('\n'), 'utf8');
console.log('Injected detailed logs!');
