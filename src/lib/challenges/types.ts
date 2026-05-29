export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  basePoints: number;

  /** Sample log lines (one per line, JSON format) to feed to the collector */
  inputLogs: string[];

  /** Expected log bodies after correct processing */
  expectedBodies: string[];

  /** The pipeline processors list (just processor names, user picks order) */
  requiredProcessors: string[];

  /** Hints shown progressively */
  hints: string[];

  /** Template YAML to pre-fill the editor */
  starterYaml: string;

  /** The correct processors config (for validation reference) */
  solutionProcessors: Record<string, unknown>;

  /** Receiver types the user must configure (e.g., filelog) */
  requiredReceivers?: string[];

  /** Exporter types the user must configure (e.g., debug, file) */
  requiredExporters?: string[];

  /** The correct receivers config (for validation reference) */
  solutionReceivers?: Record<string, unknown>;

  /** The correct exporters config (for validation reference) */
  solutionExporters?: Record<string, unknown>;

  /** Expected pipeline receivers list (e.g., ["filelog"]) */
  pipelineReceivers?: string[];

  /** Expected pipeline exporters list (e.g., ["file"]) */
  pipelineExporters?: string[];

  /** Expected extensions config (e.g., health_check) */
  solutionExtensions?: Record<string, unknown>;

  /** Expected service.extensions list */
  serviceExtensions?: string[];

  /** Expected connectors config */
  solutionConnectors?: Record<string, unknown>;

  /** Expected service.pipelines structure (for multi-pipeline challenges) */
  solutionPipelines?: Record<string, unknown>;
}
