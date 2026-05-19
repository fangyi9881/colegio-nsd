const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/data/quintets.ts',
  'src/data/mockData.ts',
  'src/data/matchStats.ts',
  'src/data/news.ts'
];

filesToFix.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Remove (CAP) and (cap)
  content = content.replace(/\s*\(CAP\)/gi, '');
  
  // 2. Remove *
  content = content.replace(/\*/g, '');
  
  // 3. Fix Luna Maria -> Luisa Maria
  content = content.replace(/LUNA MARIA/g, 'LUISA MARIA');
  content = content.replace(/Luna Maria/g, 'Luisa Maria');
  
  // 4. Fix CEPEDA / CEPEZA -> ZEPEDA
  content = content.replace(/CEPEZA/g, 'ZEPEDA');
  content = content.replace(/CEPEDA/g, 'ZEPEDA');
  content = content.replace(/Cepeza/g, 'Zepeda');
  content = content.replace(/Cepeda/g, 'Zepeda');
  
  // 5. Fix PROAÑO GUAJARDO -> PROAÑO QUINAUCHO
  content = content.replace(/PROAÑO GUAJARDO/g, 'PROAÑO QUINAUCHO');
  content = content.replace(/Proaño Guajardo/g, 'Proaño Quinaucho');
  
  fs.writeFileSync(filePath, content, 'utf8');
});

console.log("Names fixed!");
