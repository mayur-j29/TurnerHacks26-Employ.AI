const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "skulpt");
const srcDir = path.join(root, "node_modules", "skulpt", "dist");
const files = ["skulpt.min.js", "skulpt-stdlib.js"];

fs.mkdirSync(outDir, { recursive: true });

for (const file of files) {
  const src = path.join(srcDir, file);
  const dest = path.join(outDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`copied ${file} -> public/skulpt/`);
  } else if (fs.existsSync(dest)) {
    console.log(`using committed ${file} in public/skulpt/`);
  } else {
    console.warn(`warning: ${file} not found (skulpt may be unavailable until npm install)`);
  }
}
