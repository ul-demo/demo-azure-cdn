/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs");

const routes = ["/about", "/test"];

if (!fs.existsSync("./dist/index.html")) {
  throw new Error("Le build ne semble pas avoir été exécuté");
}

for (const route of routes) {
  console.info(`Copying index.html for ${route}...`);
  const destFolder = `./dist${route}`;
  fs.mkdirSync(destFolder, { recursive: true });
  fs.copyFileSync("./dist/index.html", `${destFolder}/index.html`);
}

console.info("Done handling routes.");
