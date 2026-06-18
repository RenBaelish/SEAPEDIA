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
      
      // Replace className= with class=
      if (content.match(/\sclassName=/g)) {
        content = content.replace(/\sclassName=/g, ' class=');
        changed = true;
      }
      
      if (content.includes('lucide-react')) {
        content = content.replace(/lucide-react/g, 'lucide-preact');
        changed = true;
      }

      if (content.match(/from\s+['"]react['"]/)) {
        content = content.replace(/from\s+['"]react['"]/g, 'from \'preact/hooks\'');
        changed = true;
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

replaceAll('src');
