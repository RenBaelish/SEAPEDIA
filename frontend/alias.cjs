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
      
      const relativeTypesRegex = /from\s+['"](\.\.?\/)+types['"]/g;
      if (content.match(relativeTypesRegex)) {
        content = content.replace(relativeTypesRegex, "from '@/types'");
        changed = true;
      }
      
      if (content.includes("'./types'")) {
        content = content.replace(/'\.\/types'/g, "'@/types'");
        changed = true;
      }
      
      if (content.includes('invalid_type_error')) {
        content = content.replace(/invalid_type_error/g, 'invalid_type_error_removed');
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

replaceAll('src');
