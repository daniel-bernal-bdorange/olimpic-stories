import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const rootDir = process.cwd();
const sourceDir = path.join(rootDir, "public", "images");
const oneLifeDir = path.join(sourceDir, "one-life");
const athleteDir = path.join(oneLifeDir, "athletes");

const athletes = [
  ["Afanasijs Kuzmins.jpg", "afanasijs-kuzmins.webp"],
  ["Andrew Hoy.jpg", "andrew-hoy.webp"],
  ["Claudia Pechstein.jpg", "claudia-pechstein.webp"],
  ["Hubert Raudaschl.jpeg", "hubert-raudaschl.webp"],
  ["Ian Millar.webp", "ian-millar.webp"],
  ["Jesús Ángel García.avif", "jesus-angel-garcia.webp"],
  ["Josefa Idem-Guerrini.jpg", "josefa-idem-guerrini.webp"],
  ["Nino Salukvadze.webp", "nino-salukvadze.webp"],
  ["Oksana Chusovitina.webp", "oksana-chusovitina.webp"],
  ["Paul Elvstrom.jpg", "paul-elvstrom.webp"],
];

async function convertAthlete(sourceName, outputName) {
  const inputPath = path.join(sourceDir, sourceName);
  const outputPath = path.join(athleteDir, outputName);

  await sharp(inputPath)
    .resize({ width: 660, height: 900, fit: "cover", position: "north" })
    .webp({ quality: 82 })
    .toFile(outputPath);
}

async function convertBackground(sourceName, outputName, width, quality) {
  const inputPath = path.join(sourceDir, sourceName);
  const outputPath = path.join(oneLifeDir, outputName);

  await sharp(inputPath)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toFile(outputPath);
}

function formatSize(filePath) {
  return `${Math.round(fs.statSync(filePath).size / 1024)} KB`;
}

await fs.promises.mkdir(athleteDir, { recursive: true });

for (const [sourceName, outputName] of athletes) {
  await convertAthlete(sourceName, outputName);
}

await convertBackground("one-life-cover.png", "one-life-cover.webp", 1920, 82);
await convertBackground("one-life-bg.png", "one-life-bg.webp", 1600, 80);

const summary = fs
  .readdirSync(athleteDir)
  .sort()
  .map((fileName) => `${fileName}\t${formatSize(path.join(athleteDir, fileName))}`);

summary.push(`one-life-cover.webp\t${formatSize(path.join(oneLifeDir, "one-life-cover.webp"))}`);
summary.push(`one-life-bg.webp\t${formatSize(path.join(oneLifeDir, "one-life-bg.webp"))}`);

console.log(summary.join("\n"));