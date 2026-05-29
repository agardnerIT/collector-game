import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { Challenge } from "../src/lib/challenges/types";

const ymlDir = path.join(__dirname, "../src/lib/challenges");
const files = fs.readdirSync(ymlDir).filter(f => f.endsWith(".yml")).sort();
const challenges: Challenge[] = [];

for (const file of files) {
  const raw = fs.readFileSync(path.join(ymlDir, file), "utf-8");
  const data = yaml.load(raw) as Challenge;
  challenges.push(data);
}

challenges.sort((a, b) => a.id.localeCompare(b.id));

const output = `import { Challenge } from "./types";\n\nexport const challenges: Challenge[] = ${JSON.stringify(challenges, null, 2)} as Challenge[];\n`;

fs.writeFileSync(path.join(ymlDir, "data.ts"), output);

console.log(`Generated data.ts with ${challenges.length} challenges`);
