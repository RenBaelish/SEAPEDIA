const fs = require('fs');
const path = require('path');

function replaceAll(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceAll(fullPath);
    } else if (fullPath.match(/\.(ts|tsx)$/)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      if (content.includes('@seapedia/types')) {
        // Find depth. Assuming src is the base
        const depth = fullPath.split(path.sep).length - 3;
        const relativePrefix = depth > 0 ? '../'.repeat(depth) : './';
        content = content.replace(/['"]@seapedia\/types['"]/g, `'${relativePrefix}types'`);
        changed = true;
      }
      if (content.includes('e.target.value')) {
        content = content.replace(/e\.target\.value/g, '(e.target as any).value');
        changed = true;
      }
      if (content.includes('e.target.checked')) {
        content = content.replace(/e\.target\.checked/g, '(e.target as any).checked');
        changed = true;
      }
      if (content.includes('href') && fullPath.includes('AccountPage.tsx')) {
         // Fix TS2339 href error in AccountPage
         content = content.replace(/item\.href/g, '(item as any).href');
         changed = true;
      }
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Fixed', fullPath);
      }
    }
  }
}

replaceAll('src');
