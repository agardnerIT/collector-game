import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";
import yaml from "js-yaml";
import { Challenge } from "./challenges/types";

interface CollectorResult {
  success: boolean;
  logBodies: string[];
  error?: string;
  errorCode?: "BINARY_NOT_FOUND" | "CONFIG_INVALID" | "TIMEOUT" | "RUNTIME_ERROR";
}

interface UserConfig {
  processors: Record<string, unknown>;
  pipeline: string[];
  receivers?: Record<string, unknown>;
  exporters?: Record<string, unknown>;
  pipelineReceivers?: string[];
  pipelineExporters?: string[];
  extensions?: Record<string, unknown>;
  serviceExtensions?: string[];
  connectors?: Record<string, unknown>;
}

function buildConfig(
  userConfig: UserConfig,
  challengeId: string
): string {
  // Determine receivers — use user's filelog if provided, else default with json_parser
  let receivers: Record<string, unknown>;
  if (userConfig.receivers?.filelog) {
    const userFilelog = userConfig.receivers.filelog as Record<string, unknown>;
    // Use user's filelog config as-is, only override include path
    receivers = {
      filelog: {
        ...userFilelog,
        include: [`/tmp/${challengeId}/input.log`],
      },
    };
  } else {
    receivers = {
      filelog: {
        include: [`/tmp/${challengeId}/input.log`],
        start_at: "beginning",
        operators: [{ type: "json_parser" }],
      },
    };
  }

  // Determine exporters — always ensure file exporter is present for output capture
  let exporters: Record<string, unknown> = {};
  if (userConfig.exporters?.file) {
    const userFile = userConfig.exporters.file as Record<string, unknown>;
    exporters.file = {
      ...userFile,
      path: `/tmp/${challengeId}/output.json`,
    };
  } else {
    exporters.file = {
      path: `/tmp/${challengeId}/output.json`,
    };
  }
  // Add only safe (non-networking) user exporters alongside the file exporter
  if (userConfig.exporters) {
    for (const [name, config] of Object.entries(userConfig.exporters)) {
      if (name === "debug") {
        (exporters as Record<string, unknown>)[name] = config;
      }
    }
  }

  // Pipeline wiring — use user's if provided, else defaults
  const pipelineReceivers = userConfig.pipelineReceivers ?? ["filelog"];
  const pipelineExportersList = [...(userConfig.pipelineExporters ?? ["file"])];
  // Always include file exporter for output capture
  if (!pipelineExportersList.includes("file")) {
    pipelineExportersList.push("file");
  }

  const config: Record<string, unknown> = {
    receivers,
    processors: userConfig.processors ?? {},
    exporters,
    service: {
      pipelines: {
        logs: {
          receivers: pipelineReceivers,
          processors: userConfig.pipeline ?? [],
          exporters: pipelineExportersList,
        },
      },
    },
  };

  // Pass through extensions if provided
  if (userConfig.extensions && Object.keys(userConfig.extensions).length > 0) {
    config.extensions = userConfig.extensions;
  }
  if (userConfig.serviceExtensions && userConfig.serviceExtensions.length > 0) {
    (config.service as Record<string, unknown>).extensions = userConfig.serviceExtensions;
  }

  // Pass through connectors if provided
  if (userConfig.connectors && Object.keys(userConfig.connectors).length > 0) {
    config.connectors = userConfig.connectors;
  }

  return yaml.dump(config);
}

function parseOutput(raw: string): string[] {
  const data = JSON.parse(raw);
  const bodies: string[] = [];
  for (const rl of data.resourceLogs ?? []) {
    for (const sl of rl.scopeLogs ?? []) {
      for (const lr of sl.logRecords ?? []) {
        const body = lr.body;
        if (typeof body === "string") {
          bodies.push(body);
        } else if (body?.stringValue) {
          bodies.push(body.stringValue);
        }
      }
    }
  }
  return bodies;
}

async function findOtelColBinary(): Promise<string | null> {
  const names = [
    "otelcol-contrib",
    "otelcol",
    "opentelemetry-collector-contrib",
  ];
  for (const name of names) {
    const proc = spawn("which", [name], { stdio: "pipe" });
    const code = await new Promise<number>((resolve) => {
      proc.on("close", resolve);
    });
    if (code === 0) return name;
  }
  return null;
}

export async function runCollector(
  userConfig: UserConfig,
  challenge: Challenge
): Promise<CollectorResult> {
  const binary = await findOtelColBinary();
  if (!binary) {
    return {
      success: false,
      logBodies: [],
      errorCode: "BINARY_NOT_FOUND",
      error: "OpenTelemetry Collector binary not found. Falling back to text-based config validation.",
    };
  }

  const dir = `/tmp/${challenge.id}`;
  await fs.mkdir(dir, { recursive: true });

  const configYaml = buildConfig(userConfig, challenge.id);
  const inputLog = challenge.inputLogs.join("\n") + "\n";

  await fs.writeFile(path.join(dir, "config.yaml"), configYaml);
  await fs.writeFile(path.join(dir, "input.log"), inputLog);

  // Clean up previous output if any
  try {
    await fs.unlink(path.join(dir, "output.json"));
  } catch {}

  return new Promise((resolve) => {
    const proc = spawn(binary, ["--config", path.join(dir, "config.yaml")], {
      stdio: "pipe",
      env: { ...process.env, HOME: os.homedir() },
      timeout: 15000,
    });

    let stderr = "";

    proc.stderr?.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    const timeout = setTimeout(async () => {
      proc.kill("SIGTERM");
      // Wait for output file
      await new Promise((r) => setTimeout(r, 1000));

      try {
        const raw = await fs.readFile(path.join(dir, "output.json"), "utf-8");
        const bodies = parseOutput(raw);
        resolve({ success: true, logBodies: bodies });
      } catch (e) {
        resolve({
          success: false,
          logBodies: [],
          errorCode: "TIMEOUT",
          error: `Output not generated. Collector stderr: ${stderr.slice(0, 500)}`,
        });
      }
    }, 5000);

    proc.on("error", (err) => {
      clearTimeout(timeout);
      resolve({
        success: false,
        logBodies: [],
        errorCode: "RUNTIME_ERROR",
        error: `Failed to start collector: ${err.message}`,
      });
    });

    proc.on("exit", async (code) => {
      clearTimeout(timeout);
      try {
        const raw = await fs.readFile(path.join(dir, "output.json"), "utf-8");
        const bodies = parseOutput(raw);
        resolve({ success: true, logBodies: bodies });
      } catch {
        resolve({
          success: false,
          logBodies: [],
          errorCode: "RUNTIME_ERROR",
          error: `Collector exited with code ${code}. ${stderr.slice(0, 300)}`,
        });
      }
    });
  });
}
