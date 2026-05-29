import { NextRequest, NextResponse } from "next/server";
import yaml from "js-yaml";
import { getChallenge } from "@/lib/challenges";
import { textValidate, validateSection } from "@/lib/textValidate";

const isServerless = !!process.env.NETLIFY || !!process.env.AWS_EXECUTION_ENV || !!process.env.VERCEL;

export async function POST(request: NextRequest) {
  try {
    const { configYaml, challengeId } = await request.json();

    if (!configYaml || !challengeId) {
      return NextResponse.json(
        { error: "Missing configYaml or challengeId" },
        { status: 400 }
      );
    }

    const challenge = getChallenge(challengeId);
    if (!challenge) {
      return NextResponse.json(
        { error: `Challenge "${challengeId}" not found` },
        { status: 404 }
      );
    }

    // Parse user's YAML
    let userConfig: any;
    try {
      userConfig = yaml.load(configYaml);
    } catch (e: any) {
      const line = e?.mark?.line != null ? ` (line ${e.mark.line + 1})` : "";
      return NextResponse.json({
        correct: false,
        actualOutput: [],
        expectedOutput: challenge.expectedBodies,
        error: `Invalid YAML syntax${line}. Check your indentation and formatting.`,
        score: 0,
        validationMode: "text",
      });
    }

    // Check that all required sections exist
    const missing: string[] = [];
    if (challenge.solutionProcessors) {
      const p = userConfig?.processors;
      if (!p || typeof p !== "object" || Object.keys(p).length === 0) {
        missing.push("`processors`");
      }
    }
    if (challenge.solutionReceivers) {
      const r = userConfig?.receivers;
      if (!r || typeof r !== "object" || Object.keys(r).length === 0) {
        missing.push("`receivers`");
      }
    }
    if (challenge.solutionExporters) {
      const e = userConfig?.exporters;
      if (!e || typeof e !== "object" || Object.keys(e).length === 0) {
        missing.push("`exporters`");
      }
    }
    if (challenge.solutionExtensions) {
      const ext = userConfig?.extensions;
      if (!ext || typeof ext !== "object" || Object.keys(ext).length === 0) {
        missing.push("`extensions`");
      }
    }
    if (challenge.solutionConnectors) {
      const conn = userConfig?.connectors;
      if (!conn || typeof conn !== "object" || Object.keys(conn).length === 0) {
        missing.push("`connectors`");
      }
    }
    if (challenge.solutionPipelines) {
      const pl = userConfig?.service?.pipelines;
      if (!pl || typeof pl !== "object" || Object.keys(pl).length === 0) {
        missing.push("`service.pipelines`");
      }
    }
    if (challenge.pipelineReceivers || challenge.pipelineExporters) {
      const pl = userConfig?.service?.pipelines?.logs;
      if (!pl) {
        missing.push("`service.pipelines.logs`");
      } else {
        if (challenge.pipelineReceivers && (!pl.receivers || !Array.isArray(pl.receivers))) {
          missing.push("`service.pipelines.logs.receivers`");
        }
        if (challenge.pipelineExporters && (!pl.exporters || !Array.isArray(pl.exporters))) {
          missing.push("`service.pipelines.logs.exporters`");
        }
      }
    }
    if (challenge.requiredProcessors?.length) {
      const pipeline = userConfig?.service?.pipelines?.logs?.processors;
      if (!pipeline || !Array.isArray(pipeline)) {
        missing.push("`service.pipelines.logs.processors`");
      }
    }
    if (challenge.serviceExtensions) {
      const svcExt = userConfig?.service?.extensions;
      if (!svcExt || !Array.isArray(svcExt)) {
        missing.push("`service.extensions`");
      }
    }

    if (missing.length > 0) {
      return NextResponse.json({
        correct: false,
        actualOutput: [],
        expectedOutput: challenge.expectedBodies,
        error: `Your config must include ${missing.join(", ")}.`,
        score: 0,
        validationMode: "text",
      });
    }

    // Try running the actual collector binary (not available in serverless)
    let collectorResult;
    if (!isServerless) {
      const { runCollector: run } = await import("@/lib/collector");
      collectorResult = await run(
        {
          processors: userConfig?.processors ?? {},
          pipeline: userConfig?.service?.pipelines?.logs?.processors ?? [],
          receivers: userConfig?.receivers,
          exporters: userConfig?.exporters,
          pipelineReceivers: userConfig?.service?.pipelines?.logs?.receivers,
          pipelineExporters: userConfig?.service?.pipelines?.logs?.exporters,
          extensions: userConfig?.extensions,
          serviceExtensions: userConfig?.service?.extensions,
          connectors: userConfig?.connectors,
        },
        challenge
      );
    }

    if (collectorResult?.success) {
      const actual = collectorResult.logBodies;
      const expected = challenge.expectedBodies;
      const correct =
        actual.length === expected.length &&
        actual.every((body, i) => body === expected[i]);

      return NextResponse.json({
        correct,
        actualOutput: actual,
        expectedOutput: expected,
        score: correct ? challenge.basePoints : 0,
        validationMode: "collector",
      });
    }

    // Fall back to text-based config comparison
    const diffs: string[] = [];

    if (challenge.solutionProcessors) {
      const result = textValidate(userConfig.processors, challenge.solutionProcessors);
      if (!result.valid) diffs.push(...result.diffs);
    }

    if (challenge.solutionReceivers) {
      const result = validateSection(
        userConfig.receivers,
        challenge.solutionReceivers,
        "receivers"
      );
      if (!result.valid) diffs.push(...result.diffs);
    }

    if (challenge.solutionExporters) {
      const result = validateSection(
        userConfig.exporters,
        challenge.solutionExporters,
        "exporters"
      );
      if (!result.valid) diffs.push(...result.diffs);
    }

    if (challenge.solutionExtensions) {
      const result = validateSection(
        userConfig.extensions,
        challenge.solutionExtensions,
        "extensions"
      );
      if (!result.valid) diffs.push(...result.diffs);
    }

    if (challenge.solutionConnectors) {
      const result = validateSection(
        userConfig.connectors,
        challenge.solutionConnectors,
        "connectors"
      );
      if (!result.valid) diffs.push(...result.diffs);
    }

    if (challenge.solutionPipelines) {
      const result = validateSection(
        userConfig?.service?.pipelines,
        challenge.solutionPipelines,
        "service.pipelines"
      );
      if (!result.valid) diffs.push(...result.diffs);
    }

    // Validate pipeline wiring
    if (challenge.pipelineReceivers) {
      const userRcvr = userConfig?.service?.pipelines?.logs?.receivers;
      if (JSON.stringify(userRcvr) !== JSON.stringify(challenge.pipelineReceivers)) {
        diffs.push(
          `service.pipelines.logs.receivers: expected ${JSON.stringify(challenge.pipelineReceivers)}, got ${JSON.stringify(userRcvr)}`
        );
      }
    }
    if (challenge.pipelineExporters) {
      const userExprt = userConfig?.service?.pipelines?.logs?.exporters;
      if (JSON.stringify(userExprt) !== JSON.stringify(challenge.pipelineExporters)) {
        diffs.push(
          `service.pipelines.logs.exporters: expected ${JSON.stringify(challenge.pipelineExporters)}, got ${JSON.stringify(userExprt)}`
        );
      }
    }
    if (challenge.requiredProcessors?.length) {
      const userProcs = userConfig?.service?.pipelines?.logs?.processors;
      if (JSON.stringify(userProcs) !== JSON.stringify(challenge.requiredProcessors)) {
        diffs.push(
          `service.pipelines.logs.processors: expected ${JSON.stringify(challenge.requiredProcessors)}, got ${JSON.stringify(userProcs)}`
        );
      }
    }

    if (challenge.serviceExtensions) {
      const userSvcExt = userConfig?.service?.extensions;
      if (JSON.stringify(userSvcExt) !== JSON.stringify(challenge.serviceExtensions)) {
        diffs.push(
          `service.extensions: expected ${JSON.stringify(challenge.serviceExtensions)}, got ${JSON.stringify(userSvcExt)}`
        );
      }
    }

    if (diffs.length === 0) {
      return NextResponse.json({
        correct: true,
        actualOutput: challenge.expectedBodies,
        expectedOutput: challenge.expectedBodies,
        score: challenge.basePoints,
        validationMode: "text",
      });
    }

    return NextResponse.json({
      correct: false,
      actualOutput: [],
      expectedOutput: challenge.expectedBodies,
      error: "Your config doesn't match the expected structure.",
      diffs,
      score: 0,
      validationMode: "text",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
