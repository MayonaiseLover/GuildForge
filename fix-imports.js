import fs from "fs";
import path from "path";

function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const a = path.join(d, f.name);
    if (f.isDirectory()) {
      walk(a);
    } else if (a.endsWith(".ts")) {
      let c = fs.readFileSync(a, "utf8");
      // Replace import/export .js extensions
      c = c.replace(/(\b(?:import|export)\s+.*?\s+from\s+["'][^"']*)(\.js)(["'])/g, "$1$3");
      // Also dynamic imports
      c = c.replace(/(import\s*\(\s*["'][^"']*)(\.js)(["']\s*\))/g, "$1$3");
      fs.writeFileSync(a, c);
    }
  }
}

walk("apps/api/src");
