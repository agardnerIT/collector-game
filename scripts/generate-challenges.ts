import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { Challenge } from "../src/lib/challenges/types";

function deepMerge(target: unknown, source: unknown): unknown {
  if (typeof target !== "object" || target === null) return source;
  if (typeof source !== "object" || source === null) return source;
  if (Array.isArray(target) || Array.isArray(source)) return source;

  const result: Record<string, unknown> = { ...(target as Record<string, unknown>) };
  const src = source as Record<string, unknown>;
  for (const key of Object.keys(src)) {
    if (
      src[key] && typeof src[key] === "object" && !Array.isArray(src[key]) &&
      result[key] && typeof result[key] === "object" && !Array.isArray(result[key])
    ) {
      result[key] = deepMerge(result[key], src[key]);
    } else {
      result[key] = src[key];
    }
  }
  return result;
}

function buildSolutionYaml(data: Record<string, unknown>): string {
  const starter = (yaml.load(data.starterYaml as string) as Record<string, unknown>) ?? {};

  const merges: [string, string][] = [
    ["processors", "solutionProcessors"],
    ["receivers", "solutionReceivers"],
    ["exporters", "solutionExporters"],
    ["extensions", "solutionExtensions"],
    ["connectors", "solutionConnectors"],
  ];

  for (const [section, key] of merges) {
    const val = data[key];
    if (val && typeof val === "object") {
      starter[section] = deepMerge(starter[section] ?? {}, val);
    }
  }

  if (data.solutionPipelines && typeof data.solutionPipelines === "object") {
    starter.service = starter.service ?? {};
    (starter.service as Record<string, unknown>).pipelines = deepMerge(
      ((starter.service as Record<string, unknown>).pipelines as Record<string, unknown>) ?? {},
      data.solutionPipelines as Record<string, unknown>
    );
  }

  return yaml.dump(starter, { lineWidth: 120, noRefs: true, sortKeys: false });
}

const ymlDir = path.join(__dirname, "../src/lib/challenges");
const files = fs.readdirSync(ymlDir).filter(f => f.endsWith(".yml")).sort();
const challenges: Challenge[] = [];

for (const file of files) {
  const raw = fs.readFileSync(path.join(ymlDir, file), "utf-8");
  const data = yaml.load(raw) as Challenge;

  const dataAny = data as unknown as Record<string, unknown>;
  const solutionYaml = buildSolutionYaml(dataAny);
  dataAny.solutionYaml = solutionYaml;

  challenges.push(data);
}

challenges.sort((a, b) => a.id.localeCompare(b.id));

const output = `import { Challenge } from "./types";\n\nexport const challenges: Challenge[] = ${JSON.stringify(challenges, null, 2)} as Challenge[];\n`;

fs.writeFileSync(path.join(ymlDir, "data.ts"), output);

console.log(`Generated data.ts with ${challenges.length} challenges`);
