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
      
      if (content.match(/from\s+['"]preact\/hooks['"]/)) {
        content = content.replace(/from\s+['"]preact\/hooks['"]/g, 'from \'react\'');
        changed = true;
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

replaceAll('src');
