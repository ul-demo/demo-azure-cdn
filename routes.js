/* eslint-disable @typescript-eslint/no-var-requires */
// Petit script permettant de copier le fichier index.html dans une arborescence de dossier
// afin de supporter la navigation correctement
const fs = require("fs");

// Populer la liste des URLs à supporter ici
const routes = ["/callback", "/logout", "/about"];

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
