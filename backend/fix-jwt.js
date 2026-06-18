import fs from 'fs';
import path from 'path';

const routesDir = path.join(process.cwd(), 'src/routes');
const files = fs.readdirSync(routesDir);

files.forEach(f => {
  if (f.endsWith('.ts')) {
    const p = path.join(routesDir, f);
    let code = fs.readFileSync(p, 'utf8');
    code = code.replace(/verify\(([^,]+),\s*([^)]+)\)/g, 'verify($1, $2, "HS256")');
    code = code.replace(/sign\(([^,]+),\s*([^)]+)\)/g, 'sign($1, $2, "HS256")');
    fs.writeFileSync(p, code);
  }
});
console.log('Fixed verify and sign calls');
