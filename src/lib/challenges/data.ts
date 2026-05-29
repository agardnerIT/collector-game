import { Challenge } from "./types";

export const challenges: Challenge[] = [
  {
    "id": "level-01",
    "title": "Bye Bye Emails",
    "description": "The log lines below contain user email addresses in the attributes. Write an OpenTelemetry Collector config to **delete** all `user.email` attributes from the telemetry before it's exported.",
    "difficulty": "easy",
    "category": "pii-redaction",
    "basePoints": 100,
    "inputLogs": [
      "{\"body\":\"User logged in successfully\",\"attributes\":{\"user.email\":\"john.doe@company.com\",\"level\":\"info\"}}",
      "{\"body\":\"Password reset requested\",\"attributes\":{\"user.email\":\"jane.smith@example.org\",\"level\":\"warn\",\"ip\":\"192.168.1.1\"}}",
      "{\"body\":\"Account created\",\"attributes\":{\"user.email\":\"alice@startup.io\",\"level\":\"info\",\"plan\":\"pro\"}}",
      "{\"body\":\"Payment failed\",\"attributes\":{\"user.email\":\"bob@corp.net\",\"level\":\"error\",\"amount\":49.99}}"
    ],
    "expectedBodies": [
      "User logged in successfully",
      "Password reset requested",
      "Account created",
      "Payment failed"
    ],
    "requiredProcessors": [
      "attributes"
    ],
    "hints": [
      "Use the [attributes](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/attributesprocessor/README.md) processor",
      "The action should be `delete`",
      "The key to target is `user.email`"
    ],
    "starterYaml": "processors:\n  attributes:\n    actions:\n\nservice:\n  pipelines:\n    logs:\n      processors: [attributes]\n",
    "solutionProcessors": {
      "attributes": {
        "actions": [
          {
            "key": "user.email",
            "action": "delete"
          }
        ]
      }
    }
  },
  {
    "id": "level-02",
    "title": "Blur the Cards",
    "description": "The log bodies contain credit card numbers! Use the **transform** processor with OTTL's `replace_pattern` to replace any 16-digit number with `[REDACTED]`.",
    "difficulty": "easy",
    "category": "pii-redaction",
    "basePoints": 120,
    "inputLogs": [
      "{\"body\":\"Payment processed: card 4532123456789012 charged $99.99\",\"attributes\":{\"level\":\"info\",\"merchant\":\"Acme Store\"}}",
      "{\"body\":\"Refund issued for card 5425234567890123 amount $25.00\",\"attributes\":{\"level\":\"info\",\"reason\":\"duplicate\"}}",
      "{\"body\":\"Card 378912345678901 declined - insufficient funds\",\"attributes\":{\"level\":\"warn\"}}",
      "{\"body\":\"Subscription renewed: card 6011234567890123 $9.99/month\",\"attributes\":{\"level\":\"info\",\"plan\":\"premium\"}}"
    ],
    "expectedBodies": [
      "Payment processed: card [REDACTED] charged $99.99",
      "Refund issued for card [REDACTED] amount $25.00",
      "Card [REDACTED] declined - insufficient funds",
      "Subscription renewed: card [REDACTED] $9.99/month"
    ],
    "requiredProcessors": [
      "transform"
    ],
    "hints": [
      "Use the `transform` processor with `log_statements`",
      "Use `replace_pattern(body, regex, replacement)` OTTL function",
      "The regex should match 16 consecutive digits: `\\d{16}` (double-escape for YAML)",
      "Set the context to `log`"
    ],
    "starterYaml": "processors:\n  transform:\n    log_statements:\n      - context: log\n        statements:\n\nservice:\n  pipelines:\n    logs:\n      processors: [transform]\n",
    "solutionProcessors": {
      "transform": {
        "log_statements": [
          {
            "context": "log",
            "statements": [
              "replace_pattern(body, \"\\\\d{16}\", \"[REDACTED]\")"
            ]
          }
        ]
      }
    }
  },
  {
    "id": "level-03",
    "title": "Watch the Logs",
    "description": "So far we've been processing logs that already arrived. But how does the Collector **ingest** them? Configure a `filelog` receiver to monitor `/var/log/app.log`, starting at the beginning of the file.",
    "difficulty": "easy",
    "category": "receiver-config",
    "basePoints": 120,
    "inputLogs": [
      "Server started on port 8080",
      "Connection from 10.0.0.5",
      "Disk usage at 90%"
    ],
    "expectedBodies": [
      "Server started on port 8080",
      "Connection from 10.0.0.5",
      "Disk usage at 90%"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add a `receivers` section to your config",
      "Use the **filelog** receiver type — it reads from log files",
      "It needs `include` (a list of file paths to watch)",
      "The pipeline also needs `receivers: [filelog]` under `service.pipelines.logs`"
    ],
    "starterYaml": "receivers:\n  filelog:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [filelog]\n",
    "solutionReceivers": {
      "filelog": {
        "include": [
          "/var/log/app.log"
        ]
      }
    }
  },
  {
    "id": "level-04",
    "title": "Debug Off",
    "description": "These logs are too noisy! Use the **filter** processor to drop all log records where `IsMatch(attributes[\"level\"], \"debug\")` is true. Only keep `info` and above.",
    "difficulty": "easy",
    "category": "filtering",
    "basePoints": 150,
    "inputLogs": [
      "{\"body\":\"Cache hit for key user:12345\",\"attributes\":{\"level\":\"debug\",\"cache_key\":\"user:12345\"}}",
      "{\"body\":\"Request received from 10.0.0.5\",\"attributes\":{\"level\":\"info\",\"ip\":\"10.0.0.5\"}}",
      "{\"body\":\"Database query took 245ms\",\"attributes\":{\"level\":\"debug\",\"query_time_ms\":245}}",
      "{\"body\":\"Failing health check: disk 95% full\",\"attributes\":{\"level\":\"error\",\"disk_usage_pct\":95}}",
      "{\"body\":\"User settings saved\",\"attributes\":{\"level\":\"info\",\"user_id\":\"abc-001\"}}"
    ],
    "expectedBodies": [
      "Request received from 10.0.0.5",
      "Failing health check: disk 95% full",
      "User settings saved"
    ],
    "requiredProcessors": [
      "filter"
    ],
    "hints": [
      "Use the `filter` processor with `logs` config",
      "Use `log_record` in the condition to check attributes",
      "Check if `level` equals `debug` with `IsMatch`",
      "The condition: `IsMatch(attributes[\"level\"], \"debug\")`"
    ],
    "starterYaml": "processors:\n  filter:\n    logs:\n      log_record:\n\nservice:\n  pipelines:\n    logs:\n      processors: [filter]\n",
    "solutionProcessors": {
      "filter": {
        "logs": {
          "log_record": [
            "IsMatch(attributes[\"level\"], \"debug\")"
          ]
        }
      }
    }
  },
  {
    "id": "level-05",
    "title": "Set the Stage",
    "description": "Enrich these logs by setting a new attribute `environment` to `production` on all log records. Use the **transform** processor with OTTL's `set` function.",
    "difficulty": "easy",
    "category": "transformation",
    "basePoints": 120,
    "inputLogs": [
      "{\"body\":\"Deploy v2.4.1 to cluster-east\",\"attributes\":{\"level\":\"info\",\"service\":\"deployer\"}}",
      "{\"body\":\"Database migration step 3/5\",\"attributes\":{\"level\":\"info\",\"migration_id\":\"mig-042\"}}",
      "{\"body\":\"SSL certificate expires in 7 days\",\"attributes\":{\"level\":\"warn\",\"domain\":\"api.example.com\"}}"
    ],
    "expectedBodies": [
      "Deploy v2.4.1 to cluster-east",
      "Database migration step 3/5",
      "SSL certificate expires in 7 days"
    ],
    "requiredProcessors": [
      "transform"
    ],
    "hints": [
      "Use the `transform` processor like in Level 2",
      "Use OTTL's `set` function: `set(attributes[\"environment\"], \"production\")`",
      "Make sure the context is `log`"
    ],
    "starterYaml": "processors:\n  transform:\n    log_statements:\n      - context: log\n        statements:\n\nservice:\n  pipelines:\n    logs:\n      processors: [transform]\n",
    "solutionProcessors": {
      "transform": {
        "log_statements": [
          {
            "context": "log",
            "statements": [
              "set(attributes[\"environment\"], \"production\")"
            ]
          }
        ]
      }
    }
  },
  {
    "id": "level-06",
    "title": "Show Your Work",
    "description": "You've configured receivers and processors — now where does the data go? Configure a **debug exporter** so the Collector prints telemetry to the console. Set `verbosity: detailed` to see the full output.",
    "difficulty": "easy",
    "category": "exporter-config",
    "basePoints": 120,
    "inputLogs": [
      "{\"body\":\"Health check passed\",\"attributes\":{\"level\":\"info\",\"service\":\"api\"}}",
      "{\"body\":\"Rate limit exceeded\",\"attributes\":{\"level\":\"warn\",\"client_id\":\"abc-123\"}}",
      "{\"body\":\"Cache flushed\",\"attributes\":{\"level\":\"info\",\"entries\":2048}}"
    ],
    "expectedBodies": [
      "Health check passed",
      "Rate limit exceeded",
      "Cache flushed"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add an `exporters` section to your config",
      "Use the **debug** exporter type (it prints to stdout)",
      "Set `verbosity: detailed` to see the full telemetry data",
      "Wire it in `service.pipelines.logs.exporters`"
    ],
    "starterYaml": "exporters:\n  debug:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [filelog]\n      exporters: [debug]\n",
    "solutionExporters": {
      "debug": {
        "verbosity": "detailed"
      }
    }
  },
  {
    "id": "level-07",
    "title": "Hash It Out",
    "description": "Instead of deleting PII, let's **hash** it. Use the `attributes` processor to hash the `user.email` attribute — it should still be there but look like `[REDACTED]`.",
    "difficulty": "medium",
    "category": "pii-redaction",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"User profile updated\",\"attributes\":{\"user.email\":\"ceo@bigcorp.com\",\"user.id\":\"usr_001\",\"level\":\"info\"}}",
      "{\"body\":\"Login from new device\",\"attributes\":{\"user.email\":\"dev@startup.io\",\"user.id\":\"usr_002\",\"level\":\"warn\",\"device\":\"iPhone 15\"}}",
      "{\"body\":\"Email verification sent\",\"attributes\":{\"user.email\":\"support@helpdesk.org\",\"user.id\":\"usr_003\",\"level\":\"info\"}}"
    ],
    "expectedBodies": [
      "User profile updated",
      "Login from new device",
      "Email verification sent"
    ],
    "requiredProcessors": [
      "attributes"
    ],
    "hints": [
      "Use the `attributes` processor — same as Level 1, different action",
      "The action should be `hash` (not `delete`)",
      "The key is still `user.email`",
      "Hashing truncates the value to a short hash string"
    ],
    "starterYaml": "processors:\n  attributes:\n    actions:\n\nservice:\n  pipelines:\n    logs:\n      processors: [attributes]\n",
    "solutionProcessors": {
      "attributes": {
        "actions": [
          {
            "key": "user.email",
            "action": "hash"
          }
        ]
      }
    }
  },
  {
    "id": "level-08",
    "title": "Two-Step Pipeline",
    "description": "Combine what you've learned! These logs have emails in the attributes **and** credit card numbers in the body. Build a **pipeline** that: (1) deletes `user.email` attribute, (2) replaces 16-digit card numbers with `[REDACTED]` in the body.",
    "difficulty": "medium",
    "category": "pipeline",
    "basePoints": 250,
    "inputLogs": [
      "{\"body\":\"Order #1234: card 4532123456789012 processed for customer\",\"attributes\":{\"user.email\":\"vip@luxurystore.com\",\"level\":\"info\",\"order_id\":\"1234\"}}",
      "{\"body\":\"Refund: card 6011987654321098 for $150.00\",\"attributes\":{\"user.email\":\"returns@shopnow.net\",\"level\":\"info\",\"refund_id\":\"r-889\"}}",
      "{\"body\":\"Card 3789456123098765 expired during checkout\",\"attributes\":{\"user.email\":\"shopper@mart.io\",\"level\":\"warn\",\"session\":\"s-445\"}}"
    ],
    "expectedBodies": [
      "Order #1234: card [REDACTED] processed for customer",
      "Refund: card [REDACTED] for $150.00",
      "Card [REDACTED] expired during checkout"
    ],
    "requiredProcessors": [
      "attributes",
      "transform"
    ],
    "hints": [
      "You need TWO processors: `attributes` and `transform`",
      "List them in order: `[attributes, transform]`",
      "First delete `user.email` (attributes processor)",
      "Then replace_pattern for card numbers (transform processor)"
    ],
    "starterYaml": "processors:\n  attributes:\n    actions:\n  transform:\n    log_statements:\n      - context: log\n        statements:\n\nservice:\n  pipelines:\n    logs:\n      processors: [attributes, transform]\n",
    "solutionProcessors": {
      "attributes": {
        "actions": [
          {
            "key": "user.email",
            "action": "delete"
          }
        ]
      },
      "transform": {
        "log_statements": [
          {
            "context": "log",
            "statements": [
              "replace_pattern(body, \"\\\\d{16}\", \"[REDACTED]\")"
            ]
          }
        ]
      }
    }
  },
  {
    "id": "level-09",
    "title": "Extract the Signal",
    "description": "Log bodies contain unstructured data: `IP: 10.0.1.42 | Status: 200 | Duration: 145ms`. Use the **transform** processor with `extract_patterns` to extract the IP and status code into structured attributes, then delete them from the body.",
    "difficulty": "medium",
    "category": "transformation",
    "basePoints": 300,
    "inputLogs": [
      "{\"body\":\"IP: 10.0.1.42 | Status: 200 | Duration: 45ms\",\"attributes\":{\"level\":\"info\"}}",
      "{\"body\":\"IP: 172.16.0.8 | Status: 404 | Duration: 12ms\",\"attributes\":{\"level\":\"info\"}}",
      "{\"body\":\"IP: 192.168.5.100 | Status: 500 | Duration: 3200ms\",\"attributes\":{\"level\":\"error\"}}"
    ],
    "expectedBodies": [
      "IP: 10.0.1.42 | Status: 200 | Duration: 45ms",
      "IP: 172.16.0.8 | Status: 404 | Duration: 12ms",
      "IP: 192.168.5.100 | Status: 500 | Duration: 3200ms"
    ],
    "requiredProcessors": [
      "transform"
    ],
    "hints": [
      "Use OTTL's `extract_patterns` function on the body",
      "Pattern: `\"IP: (?P<ip>[^ |]+) \\| Status: (?P<status_code>[^ |]+)\"`",
      "Use `set` to assign extracted values to attributes",
      "Destination: `attributes[\"cache\"][\"ip\"]` and `attributes[\"cache\"][\"status_code\"]`"
    ],
    "starterYaml": "processors:\n  transform:\n    log_statements:\n      - context: log\n        statements:\n\nservice:\n  pipelines:\n    logs:\n      processors: [transform]\n",
    "solutionProcessors": {
      "transform": {
        "log_statements": [
          {
            "context": "log",
            "statements": [
              "extract_patterns(body, \"IP: (?P<ip>[^ |]+) \\\\| Status: (?P<status_code>[^ |]+)\")"
            ]
          }
        ]
      }
    }
  },
  {
    "id": "level-10",
    "title": "Parse at the Edge",
    "description": "These logs arrive as raw strings in a structured format. Instead of processing them later with a `transform` processor, add a **regex_parser operator** directly in the `filelog` receiver to parse them as they're ingested.\nThe format is: `<timestamp> <level> <message>`",
    "difficulty": "medium",
    "category": "receiver-processing",
    "basePoints": 250,
    "inputLogs": [
      "2024-01-15 INFO Server started on port 8080",
      "2024-01-15 ERROR Connection refused: timeout",
      "2024-01-15 WARN Disk usage at 85%",
      "2024-01-15 INFO User login from 10.0.0.5"
    ],
    "expectedBodies": [
      "2024-01-15 INFO Server started on port 8080",
      "2024-01-15 ERROR Connection refused: timeout",
      "2024-01-15 WARN Disk usage at 85%",
      "2024-01-15 INFO User login from 10.0.0.5"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add an `operators` list to your `filelog` receiver config",
      "Use the **regex_parser** operator type",
      "Pattern: `^(?P<timestamp>\\S+) (?P<level>\\S+) (?P<message>.*)$`",
      "Set `parse_from: body` and `parse_to: attributes`",
      "Since we're using operators, no `json_parser` is needed — each line is read as-is"
    ],
    "starterYaml": "receivers:\n  filelog:\n    include: [/var/log/app.log]\n    start_at: beginning\n    operators:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [filelog]\n      exporters: [file]\n",
    "solutionReceivers": {
      "filelog": {
        "include": [
          "/var/log/app.log"
        ],
        "start_at": "beginning",
        "operators": [
          {
            "type": "regex_parser",
            "regex": "^(?P<timestamp>\\S+) (?P<level>\\S+) (?P<message>.*)$",
            "parse_from": "body",
            "parse_to": "attributes"
          }
        ]
      }
    }
  },
  {
    "id": "level-100",
    "title": "Remote Write",
    "description": "Send metrics to a remote Prometheus-compatible backend. Configure a **prometheusremotewrite** exporter that pushes metrics to `http://cortex:9009/api/v1/push`.",
    "difficulty": "medium",
    "category": "metrics-exporter",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"remote.write.success 1\",\"attributes\":{\"exporter\":\"prometheusremotewrite\",\"endpoint\":\"cortex:9009\"}}",
      "{\"body\":\"remote.write.latency 0.5\",\"attributes\":{\"exporter\":\"prometheusremotewrite\",\"endpoint\":\"cortex:9009\"}}"
    ],
    "expectedBodies": [
      "remote.write.success 1",
      "remote.write.latency 0.5"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add an `exporters` section with a `prometheusremotewrite` exporter",
      "Set `endpoint` to the remote write URL",
      "Wire into `service.pipelines.logs.exporters`"
    ],
    "starterYaml": "exporters:\n  prometheusremotewrite:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [hostmetrics]\n      exporters: [prometheusremotewrite]\n",
    "solutionExporters": {
      "prometheusremotewrite": {
        "endpoint": "http://cortex:9009/api/v1/push"
      }
    }
  },
  {
    "id": "level-101",
    "title": "Custom Headers",
    "description": "Authenticate remote write requests with custom HTTP headers. Configure a **prometheusremotewrite** exporter that adds an `Authorization: Bearer my-token-123` header.",
    "difficulty": "hard",
    "category": "metrics-exporter",
    "basePoints": 300,
    "inputLogs": [
      "{\"body\":\"auth.write 1\",\"attributes\":{\"exporter\":\"prometheusremotewrite\",\"auth\":\"bearer\"}}",
      "{\"body\":\"auth.write 2\",\"attributes\":{\"exporter\":\"prometheusremotewrite\",\"auth\":\"bearer\"}}"
    ],
    "expectedBodies": [
      "auth.write 1",
      "auth.write 2"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add a `prometheusremotewrite` exporter with `endpoint`",
      "Add a `headers` section with the Authorization header",
      "Set `Authorization` to `Bearer my-token-123`",
      "Wire into `service.pipelines.logs.exporters`"
    ],
    "starterYaml": "exporters:\n  prometheusremotewrite:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [hostmetrics]\n      exporters: [prometheusremotewrite]\n",
    "solutionExporters": {
      "prometheusremotewrite": {
        "endpoint": "http://cortex:9009/api/v1/push",
        "headers": {
          "Authorization": "Bearer my-token-123"
        }
      }
    }
  },
  {
    "id": "level-102",
    "title": "InfluxDB Export",
    "description": "Export metrics to InfluxDB. Configure an **influxdb** exporter that sends data to `http://influxdb:8086` with organization `myorg` and bucket `metrics`.",
    "difficulty": "medium",
    "category": "metrics-exporter",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"influxdb.write 1\",\"attributes\":{\"exporter\":\"influxdb\",\"org\":\"myorg\",\"bucket\":\"metrics\"}}",
      "{\"body\":\"influxdb.write 2\",\"attributes\":{\"exporter\":\"influxdb\",\"org\":\"myorg\",\"bucket\":\"metrics\"}}"
    ],
    "expectedBodies": [
      "influxdb.write 1",
      "influxdb.write 2"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add an `exporters` section with an `influxdb` exporter",
      "Set `endpoint` to the InfluxDB server URL",
      "Set `org` to `myorg`",
      "Set `bucket` to `metrics`",
      "Set `token` to a placeholder value",
      "Wire into `service.pipelines.logs.exporters`"
    ],
    "starterYaml": "exporters:\n  influxdb:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [hostmetrics]\n      exporters: [influxdb]\n",
    "solutionExporters": {
      "influxdb": {
        "endpoint": "http://influxdb:8086",
        "org": "myorg",
        "bucket": "metrics",
        "token": "my-token"
      }
    }
  },
  {
    "id": "level-103",
    "title": "Carbon Export",
    "description": "Send metrics to a Carbon (Graphite) backend. Configure a **carbon** exporter that pushes metrics to `carbon-server:2003` using the TCP protocol.",
    "difficulty": "medium",
    "category": "metrics-exporter",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"carbon.send 1\",\"attributes\":{\"exporter\":\"carbon\",\"endpoint\":\"carbon-server:2003\"}}",
      "{\"body\":\"carbon.send 2\",\"attributes\":{\"exporter\":\"carbon\",\"endpoint\":\"carbon-server:2003\"}}"
    ],
    "expectedBodies": [
      "carbon.send 1",
      "carbon.send 2"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add an `exporters` section with a `carbon` exporter",
      "Set `endpoint` to the Carbon server address",
      "Set `transport` to `tcp`",
      "Wire into `service.pipelines.logs.exporters`"
    ],
    "starterYaml": "exporters:\n  carbon:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [hostmetrics]\n      exporters: [carbon]\n",
    "solutionExporters": {
      "carbon": {
        "endpoint": "carbon-server:2003",
        "transport": "tcp"
      }
    }
  },
  {
    "id": "level-104",
    "title": "Full Pipeline",
    "description": "Build a complete metric pipeline. Configure a pipeline that collects `hostmetrics`, filters to only CPU metrics, and exports them via **prometheus**. Use the **filter** processor with `include: [cpu.*]`.",
    "difficulty": "medium",
    "category": "metrics-pipeline",
    "basePoints": 250,
    "inputLogs": [
      "{\"body\":\"cpu.utilization 0.5\",\"attributes\":{\"metric\":\"cpu.utilization\"}}",
      "{\"body\":\"memory.usage 1000\",\"attributes\":{\"metric\":\"memory.usage\"}}",
      "{\"body\":\"cpu.time 5000\",\"attributes\":{\"metric\":\"cpu.time\"}}"
    ],
    "expectedBodies": [
      "cpu.utilization 0.5",
      "cpu.time 5000"
    ],
    "requiredProcessors": [
      "filter"
    ],
    "hints": [
      "Add `hostmetrics` receiver with CPU scraper",
      "Add a **filter** processor that includes only CPU metrics",
      "Add a **prometheus** exporter on `:8889`",
      "Wire all three together in the pipeline"
    ],
    "starterYaml": "receivers:\n  hostmetrics:\n    scrapers:\n      cpu:\n\nprocessors:\n  filter:\n    metrics:\n\nexporters:\n  prometheus:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [hostmetrics]\n      processors: [filter]\n      exporters: [prometheus]\n",
    "solutionReceivers": {
      "hostmetrics": {
        "scrapers": {
          "cpu": null
        }
      }
    },
    "solutionProcessors": {
      "filter": {
        "metrics": {
          "include": {
            "match_type": "regexp",
            "metric_names": [
              "cpu.*"
            ]
          }
        }
      }
    },
    "solutionExporters": {
      "prometheus": {
        "endpoint": "0.0.0.0:8889"
      }
    }
  },
  {
    "id": "level-105",
    "title": "Cumul.→Rate Pipe",
    "description": "Build a pipeline that converts cumulative metrics to deltas, then to rates. Configure `hostmetrics` → `cumulativetodelta` → `deltatorate` → `prometheus`.",
    "difficulty": "medium",
    "category": "metrics-pipeline",
    "basePoints": 250,
    "inputLogs": [
      "{\"body\":\"system.cpu.time 10000\",\"attributes\":{\"metric\":\"system.cpu.time\",\"type\":\"cumulative\"}}",
      "{\"body\":\"system.cpu.time 10500\",\"attributes\":{\"metric\":\"system.cpu.time\",\"type\":\"cumulative\"}}"
    ],
    "expectedBodies": [
      "system.cpu.time 10000",
      "system.cpu.time 10500"
    ],
    "requiredProcessors": [
      "cumulativetodelta",
      "deltatorate"
    ],
    "hints": [
      "Add a `hostmetrics` receiver with `cpu` scraper",
      "Add **cumulativetodelta** processor first",
      "Add **deltatorate** processor second",
      "Add a **prometheus** exporter",
      "Wire them in order in the pipeline"
    ],
    "starterYaml": "receivers:\n  hostmetrics:\n    scrapers:\n      cpu:\n\nprocessors:\n  cumulativetodelta:\n  deltatorate:\n\nexporters:\n  prometheus:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [hostmetrics]\n      processors: []\n      exporters: [prometheus]\n",
    "solutionReceivers": {
      "hostmetrics": {
        "scrapers": {
          "cpu": null
        }
      }
    },
    "solutionProcessors": {
      "cumulativetodelta": null,
      "deltatorate": null
    },
    "solutionExporters": {
      "prometheus": {
        "endpoint": "0.0.0.0:8889"
      }
    }
  },
  {
    "id": "level-106",
    "title": "Dual Export",
    "description": "Send metrics to two backends simultaneously. Configure a pipeline that collects `hostmetrics` and exports to both **prometheus** (`:8889`) and **influxdb** (`http://influxdb:8086`).",
    "difficulty": "hard",
    "category": "metrics-pipeline",
    "basePoints": 400,
    "inputLogs": [
      "{\"body\":\"dual.export 1\",\"attributes\":{\"pipeline\":\"dual\",\"exporters\":[\"prometheus\",\"influxdb\"]}}",
      "{\"body\":\"dual.export 2\",\"attributes\":{\"pipeline\":\"dual\",\"exporters\":[\"prometheus\",\"influxdb\"]}}"
    ],
    "expectedBodies": [
      "dual.export 1",
      "dual.export 2"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add a `hostmetrics` receiver with CPU and memory scrapers",
      "Add both **prometheus** and **influxdb** exporters",
      "List both exporters in `service.pipelines.logs.exporters`",
      "The collector fans out to all listed exporters"
    ],
    "starterYaml": "receivers:\n  hostmetrics:\n    scrapers:\n      cpu:\n      memory:\n\nexporters:\n  prometheus:\n  influxdb:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [hostmetrics]\n      exporters: []\n",
    "solutionReceivers": {
      "hostmetrics": {
        "scrapers": {
          "cpu": null,
          "memory": null
        }
      }
    },
    "solutionExporters": {
      "prometheus": {
        "endpoint": "0.0.0.0:8889"
      },
      "influxdb": {
        "endpoint": "http://influxdb:8086",
        "org": "myorg",
        "bucket": "metrics",
        "token": "my-token"
      }
    }
  },
  {
    "id": "level-107",
    "title": "Logs + Metrics",
    "description": "Run both logs and metrics pipelines in a single config. Configure a **filelog** receiver for logs and a **hostmetrics** receiver for metrics. Export logs to **file** and metrics to **prometheus**, each in its own pipeline.",
    "difficulty": "hard",
    "category": "metrics-pipeline",
    "basePoints": 500,
    "inputLogs": [
      "{\"body\":\"Log line 1\",\"attributes\":{\"level\":\"info\"}}",
      "{\"body\":\"hostmetrics cpu 0.5\",\"attributes\":{\"metric\":\"cpu\"}}",
      "{\"body\":\"Log line 2\",\"attributes\":{\"level\":\"warn\"}}"
    ],
    "expectedBodies": [
      "Log line 1",
      "hostmetrics cpu 0.5",
      "Log line 2"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add both `filelog` and `hostmetrics` receivers",
      "Add both `file` and `prometheus` exporters",
      "Create TWO pipelines under `service.pipelines`: one for logs, one for metrics",
      "Wire filelog→file in the logs pipeline",
      "Wire hostmetrics→prometheus in the metrics pipeline"
    ],
    "starterYaml": "receivers:\n  filelog:\n    include: []\n    start_at: beginning\n    operators:\n      - type: json_parser\n  hostmetrics:\n    scrapers:\n      cpu:\n\nexporters:\n  file:\n    path: ./output.json\n  prometheus:\n\nservice:\n  pipelines:\n",
    "solutionReceivers": {
      "filelog": {
        "include": [
          "/tmp/input.log"
        ],
        "start_at": "beginning",
        "operators": [
          {
            "type": "json_parser"
          }
        ]
      },
      "hostmetrics": {
        "scrapers": {
          "cpu": null
        }
      }
    },
    "solutionExporters": {
      "file": {
        "path": "./output.json"
      },
      "prometheus": {
        "endpoint": "0.0.0.0:8889"
      }
    },
    "solutionPipelines": {
      "logs": {
        "receivers": [
          "filelog"
        ],
        "exporters": [
          "file"
        ]
      },
      "metrics": {
        "receivers": [
          "hostmetrics"
        ],
        "exporters": [
          "prometheus"
        ]
      }
    }
  },
  {
    "id": "level-11",
    "title": "Conditional Redaction",
    "description": "Redact `user.email` attributes, but **only** on log records with `level: info`. Error logs should keep their emails intact (for debugging). Use the **attributes** processor with `include` and `exclude` match types.",
    "difficulty": "hard",
    "category": "conditional",
    "basePoints": 400,
    "inputLogs": [
      "{\"body\":\"Profile viewed by another user\",\"attributes\":{\"user.email\":\"alice@social.net\",\"level\":\"info\",\"viewer\":\"bob\"}}",
      "{\"body\":\"CRITICAL: database connection lost\",\"attributes\":{\"user.email\":\"dba@ops.team\",\"level\":\"error\",\"db\":\"users-db\"}}",
      "{\"body\":\"Friend request accepted\",\"attributes\":{\"user.email\":\"carol@friends.app\",\"level\":\"info\",\"from\":\"dave\"}}",
      "{\"body\":\"Authentication failure for admin panel\",\"attributes\":{\"user.email\":\"admin@secure.io\",\"level\":\"error\",\"attempts\":5}}"
    ],
    "expectedBodies": [
      "Profile viewed by another user",
      "CRITICAL: database connection lost",
      "Friend request accepted",
      "Authentication failure for admin panel"
    ],
    "requiredProcessors": [
      "attributes"
    ],
    "hints": [
      "Use the `include` match_type in the action config",
      "Expression: `attributes[\"level\"] == \"info\"`",
      "The action is still `delete` on key `user.email`",
      "Error logs (level != info) should keep their user.email attribute"
    ],
    "starterYaml": "processors:\n  attributes:\n    actions:\n      - key: user.email\n        action: delete\n\nservice:\n  pipelines:\n    logs:\n      processors: [attributes]\n",
    "solutionProcessors": {
      "attributes": {
        "actions": [
          {
            "key": "user.email",
            "action": "delete",
            "include": {
              "match_type": "expr",
              "expressions": [
                "attributes[\"level\"] == \"info\""
              ]
            }
          }
        ]
      }
    }
  },
  {
    "id": "level-12",
    "title": "Full Pipeline",
    "description": "Now put it all together! Configure a **complete** OpenTelemetry Collector pipeline that:\n1. Reads logs from `/var/log/app.log` (starting at the beginning) 2. Deletes any `user.email` attributes from the telemetry 3. Exports the result to a file at `/tmp/clean-logs.json`\nYou'll need to configure **receivers**, **processors**, **exporters**, and wire them together in `service.pipelines.logs`.",
    "difficulty": "hard",
    "category": "pipeline",
    "basePoints": 400,
    "inputLogs": [
      "{\"body\":\"Order confirmed\",\"attributes\":{\"user.email\":\"buyer@shop.com\",\"level\":\"info\",\"order\":\"123\"}}",
      "{\"body\":\"Refund initiated\",\"attributes\":{\"user.email\":\"customer@store.net\",\"level\":\"info\",\"refund\":\"r-456\"}}",
      "{\"body\":\"Login failed\",\"attributes\":{\"level\":\"warn\",\"ip\":\"10.0.0.5\"}}",
      "{\"body\":\"Account deleted\",\"attributes\":{\"user.email\":\"leaving@startup.io\",\"level\":\"info\",\"reason\":\"manual\"}}"
    ],
    "expectedBodies": [
      "Order confirmed",
      "Refund initiated",
      "Login failed",
      "Account deleted"
    ],
    "requiredProcessors": [
      "attributes"
    ],
    "hints": [
      "You need three sections: `receivers`, `processors`, and `exporters`",
      "The `filelog` receiver needs `include` and `start_at`",
      "Use the `attributes` processor with the `delete` action on `user.email`",
      "The `file` exporter needs a `path` setting",
      "Wire it all together in `service.pipelines.logs`"
    ],
    "starterYaml": "receivers:\n  filelog:\n\nprocessors:\n  attributes:\n    actions:\n\nexporters:\n  file:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [filelog]\n      processors: [attributes]\n      exporters: [file]\n",
    "solutionReceivers": {
      "filelog": {
        "include": [
          "/var/log/app.log"
        ],
        "start_at": "beginning"
      }
    },
    "solutionProcessors": {
      "attributes": {
        "actions": [
          {
            "key": "user.email",
            "action": "delete"
          }
        ]
      }
    },
    "solutionExporters": {
      "file": {
        "path": "/tmp/clean-logs.json"
      }
    }
  },
  {
    "id": "level-13",
    "title": "Replace Match",
    "description": "Some log attributes follow a pattern that needs rewriting. Use the **transform** processor with `replace_match` to change all `env` attributes that match `staging-*` to just `dev`.",
    "difficulty": "easy",
    "category": "transformation",
    "basePoints": 120,
    "inputLogs": [
      "{\"body\":\"Deploy to staging-us-1 finished\",\"attributes\":{\"env\":\"staging-us-1\",\"level\":\"info\"}}",
      "{\"body\":\"Deploy to staging-eu-2 finished\",\"attributes\":{\"env\":\"staging-eu-2\",\"level\":\"info\"}}",
      "{\"body\":\"Deploy to prod-east finished\",\"attributes\":{\"env\":\"prod-east\",\"level\":\"info\"}}"
    ],
    "expectedBodies": [
      "Deploy to staging-us-1 finished",
      "Deploy to staging-eu-2 finished",
      "Deploy to prod-east finished"
    ],
    "requiredProcessors": [
      "transform"
    ],
    "hints": [
      "Use the `transform` processor with `log_statements`",
      "Use `replace_match(attributes[\"env\"], \"staging-*\", \"dev\")`",
      "The first argument is the attribute to check, the second is the glob pattern, the third is the replacement",
      "Make sure context is `log`"
    ],
    "starterYaml": "processors:\n  transform:\n    log_statements:\n      - context: log\n        statements:\n\nservice:\n  pipelines:\n    logs:\n      processors: [transform]\n",
    "solutionProcessors": {
      "transform": {
        "log_statements": [
          {
            "context": "log",
            "statements": [
              "replace_match(attributes[\"env\"], \"staging-*\", \"dev\")"
            ]
          }
        ]
      }
    }
  },
  {
    "id": "level-14",
    "title": "Truncate It",
    "description": "Log bodies can get too long. Use the **transform** processor with `truncate_all` to limit each log body to **20 characters**.",
    "difficulty": "easy",
    "category": "transformation",
    "basePoints": 120,
    "inputLogs": [
      "{\"body\":\"This is a very long log message that should be shortened\",\"attributes\":{\"level\":\"info\"}}",
      "{\"body\":\"Short msg\",\"attributes\":{\"level\":\"info\"}}",
      "{\"body\":\"Exactly 20 chars here!\",\"attributes\":{\"level\":\"info\"}}"
    ],
    "expectedBodies": [
      "This is a very long l",
      "Short msg",
      "Exactly 20 chars her"
    ],
    "requiredProcessors": [
      "transform"
    ],
    "hints": [
      "Use the `transform` processor with `log_statements`",
      "Use `truncate_all(body, 20)` to limit body length",
      "The first argument is the field to truncate, the second is the max length",
      "Make sure context is `log`"
    ],
    "starterYaml": "processors:\n  transform:\n    log_statements:\n      - context: log\n        statements:\n\nservice:\n  pipelines:\n    logs:\n      processors: [transform]\n",
    "solutionProcessors": {
      "transform": {
        "log_statements": [
          {
            "context": "log",
            "statements": [
              "truncate_all(body, 20)"
            ]
          }
        ]
      }
    }
  },
  {
    "id": "level-15",
    "title": "Split the Tags",
    "description": "Some logs have tags as a comma-separated string in attributes. Use the **transform** processor with OTTL's `Split` function to convert them into an array and store it in a new `tags_array` attribute.",
    "difficulty": "medium",
    "category": "transformation",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"Order placed\",\"attributes\":{\"tags\":\"urgent,high-priority,international\",\"level\":\"info\"}}",
      "{\"body\":\"Refund processed\",\"attributes\":{\"tags\":\"finance,urgent\",\"level\":\"info\"}}",
      "{\"body\":\"User login\",\"attributes\":{\"tags\":\"standard\",\"level\":\"info\"}}"
    ],
    "expectedBodies": [
      "Order placed",
      "Refund processed",
      "User login"
    ],
    "requiredProcessors": [
      "transform"
    ],
    "hints": [
      "Use the `transform` processor with `log_statements`",
      "Split the `tags` attribute on `,` using `Split(attributes[\"tags\"], \",\")`",
      "Set the result to a new attribute `tags_array`",
      "Example: `set(attributes[\"tags_array\"], Split(attributes[\"tags\"], \",\"))`"
    ],
    "starterYaml": "processors:\n  transform:\n    log_statements:\n      - context: log\n        statements:\n\nservice:\n  pipelines:\n    logs:\n      processors: [transform]\n",
    "solutionProcessors": {
      "transform": {
        "log_statements": [
          {
            "context": "log",
            "statements": [
              "set(attributes[\"tags_array\"], Split(attributes[\"tags\"], \",\"))"
            ]
          }
        ]
      }
    }
  },
  {
    "id": "level-16",
    "title": "Keep the Essentials",
    "description": "These logs carry many attributes but we only care about the `level`. Use the **attributes** processor to **keep** only that attribute and drop everything else.",
    "difficulty": "easy",
    "category": "pii-redaction",
    "basePoints": 120,
    "inputLogs": [
      "{\"body\":\"User profile updated\",\"attributes\":{\"user.email\":\"test@test.com\",\"user.id\":\"usr_001\",\"level\":\"info\",\"ip\":\"10.0.0.1\"}}",
      "{\"body\":\"Payment processed\",\"attributes\":{\"user.email\":\"buyer@shop.com\",\"amount\":49.99,\"level\":\"info\",\"currency\":\"USD\"}}",
      "{\"body\":\"Login from new device\",\"attributes\":{\"user.email\":\"dev@startup.io\",\"level\":\"warn\",\"device\":\"iPhone\"}}"
    ],
    "expectedBodies": [
      "User profile updated",
      "Payment processed",
      "Login from new device"
    ],
    "requiredProcessors": [
      "attributes"
    ],
    "hints": [
      "Use the `attributes` processor",
      "Set `keep_keys` to only keep the `level` attribute",
      "This is not an action — it's a top-level setting on the processor",
      "All other attributes will be dropped automatically"
    ],
    "starterYaml": "processors:\n  attributes:\n\nservice:\n  pipelines:\n    logs:\n      processors: [attributes]\n",
    "solutionProcessors": {
      "attributes": {
        "keep_keys": [
          "level"
        ]
      }
    }
  },
  {
    "id": "level-17",
    "title": "Flatten the Nest",
    "description": "Some logs have nested attributes that are hard to query. Use the **transform** processor with OTTL's `flatten` function to flatten the `metadata` attribute, using `.` as the separator.",
    "difficulty": "medium",
    "category": "transformation",
    "basePoints": 250,
    "inputLogs": [
      "{\"body\":\"Request from mobile client\",\"attributes\":{\"metadata\":{\"ip\":\"10.0.0.1\",\"location\":{\"city\":\"Brisbane\",\"country\":\"AU\"}},\"level\":\"info\"}}",
      "{\"body\":\"API call from partner\",\"attributes\":{\"metadata\":{\"ip\":\"192.168.1.1\",\"location\":{\"city\":\"Sydney\",\"country\":\"AU\"},\"partner\":\"acme\"},\"level\":\"info\"}}"
    ],
    "expectedBodies": [
      "Request from mobile client",
      "API call from partner"
    ],
    "requiredProcessors": [
      "transform"
    ],
    "hints": [
      "Use the `transform` processor with `log_statements`",
      "Use `flatten(attributes[\"metadata\"], \".\")`",
      "This turns nested keys like `location.city` into top-level keys under `metadata`",
      "Make sure context is `log`"
    ],
    "starterYaml": "processors:\n  transform:\n    log_statements:\n      - context: log\n        statements:\n\nservice:\n  pipelines:\n    logs:\n      processors: [transform]\n",
    "solutionProcessors": {
      "transform": {
        "log_statements": [
          {
            "context": "log",
            "statements": [
              "flatten(attributes[\"metadata\"], \".\")"
            ]
          }
        ]
      }
    }
  },
  {
    "id": "level-18",
    "title": "Batch & Burst",
    "description": "When processing high-volume logs, batching improves efficiency. Configure the **batch** processor to send batches every **5 seconds** or when **1024** log records are queued, whichever comes first.",
    "difficulty": "easy",
    "category": "performance",
    "basePoints": 100,
    "inputLogs": [
      "{\"body\":\"Request processed\",\"attributes\":{\"level\":\"info\",\"latency_ms\":42}}",
      "{\"body\":\"Cache refreshed\",\"attributes\":{\"level\":\"info\",\"entries\":1500}}",
      "{\"body\":\"Connection pool full\",\"attributes\":{\"level\":\"warn\",\"pool_size\":100}}"
    ],
    "expectedBodies": [
      "Request processed",
      "Cache refreshed",
      "Connection pool full"
    ],
    "requiredProcessors": [
      "batch"
    ],
    "hints": [
      "Add a `batch` processor to the `processors` section",
      "Set `timeout` to `5s` (how long to wait before sending)",
      "Set `send_batch_size` to `1024` (max logs per batch)",
      "The batch processor doesn't change log content — it only affects delivery"
    ],
    "starterYaml": "processors:\n  batch:\n\nservice:\n  pipelines:\n    logs:\n      processors: [batch]\n",
    "solutionProcessors": {
      "batch": {
        "timeout": "5s",
        "send_batch_size": 1024
      }
    }
  },
  {
    "id": "level-19",
    "title": "Memory Guardian",
    "description": "The Collector should protect itself from running out of memory. Configure the **memory_limiter** processor to check every **5 seconds** and enforce a hard limit of **512 MiB**.",
    "difficulty": "easy",
    "category": "performance",
    "basePoints": 100,
    "inputLogs": [
      "{\"body\":\"Processing large log file\",\"attributes\":{\"level\":\"info\",\"file\":\"access.log\",\"size_mb\":250}}",
      "{\"body\":\"Memory pressure detected\",\"attributes\":{\"level\":\"warn\",\"heap_mib\":480}}",
      "{\"body\":\"Normal operation\",\"attributes\":{\"level\":\"info\"}}"
    ],
    "expectedBodies": [
      "Processing large log file",
      "Memory pressure detected",
      "Normal operation"
    ],
    "requiredProcessors": [
      "memory_limiter"
    ],
    "hints": [
      "Add a `memory_limiter` processor to the `processors` section",
      "Set `check_interval` to `5s`",
      "Set `limit_mib` to `512`",
      "The memory_limiter drops or slows down logs when memory is exceeded"
    ],
    "starterYaml": "processors:\n  memory_limiter:\n\nservice:\n  pipelines:\n    logs:\n      processors: [memory_limiter]\n",
    "solutionProcessors": {
      "memory_limiter": {
        "check_interval": "5s",
        "limit_mib": 512
      }
    }
  },
  {
    "id": "level-20",
    "title": "Cloud Detect",
    "description": "Enrich your telemetry with cloud metadata using the **resourcedetection** processor. Configure it to detect the environment using `env`, `gcp`, and `ecs` detectors (in that order).",
    "difficulty": "medium",
    "category": "enrichment",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"Service started\",\"attributes\":{\"service\":\"api-gateway\",\"level\":\"info\"}}",
      "{\"body\":\"Health check passed\",\"attributes\":{\"service\":\"auth-service\",\"level\":\"info\"}}"
    ],
    "expectedBodies": [
      "Service started",
      "Health check passed"
    ],
    "requiredProcessors": [
      "resourcedetection"
    ],
    "hints": [
      "Add a `resourcedetection` processor to the `processors` section",
      "Set `detectors` to a list of environment detectors",
      "Available detectors: `env`, `gcp`, `ecs`, `ec2`, `azure`",
      "The processor adds cloud metadata as resource attributes"
    ],
    "starterYaml": "processors:\n  resourcedetection:\n\nservice:\n  pipelines:\n    logs:\n      processors: [resourcedetection]\n",
    "solutionProcessors": {
      "resourcedetection": {
        "detectors": [
          "env",
          "gcp",
          "ecs"
        ]
      }
    }
  },
  {
    "id": "level-21",
    "title": "Send with OTLP",
    "description": "To ship logs to a central backend, configure an **OTLP exporter** that sends data to `https://my-otel-backend:4317`.",
    "difficulty": "medium",
    "category": "exporter-config",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"Request completed in 42ms\",\"attributes\":{\"level\":\"info\",\"latency_ms\":42}}",
      "{\"body\":\"Database connection established\",\"attributes\":{\"level\":\"info\",\"db\":\"users\"}}",
      "{\"body\":\"Rate limit hit for client abc-123\",\"attributes\":{\"level\":\"warn\",\"client\":\"abc-123\"}}"
    ],
    "expectedBodies": [
      "Request completed in 42ms",
      "Database connection established",
      "Rate limit hit for client abc-123"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add an `exporters` section with an `otlp` exporter",
      "Set `endpoint` to the OTLP backend URL",
      "The OTLP exporter sends data via gRPC",
      "Wire it into `service.pipelines.logs.exporters`"
    ],
    "starterYaml": "exporters:\n  otlp:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [filelog]\n      exporters: [otlp]\n",
    "solutionExporters": {
      "otlp": {
        "endpoint": "https://my-otel-backend:4317"
      }
    }
  },
  {
    "id": "level-22",
    "title": "Ship to Loki",
    "description": "Send your logs to Grafana Loki for centralized log aggregation. Configure a **Loki exporter** that pushes logs to `https://loki.example.com:3100/loki/api/v1/push`.",
    "difficulty": "medium",
    "category": "exporter-config",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"Dashboard rendered\",\"attributes\":{\"level\":\"info\",\"user\":\"admin\",\"page\":\"/metrics\"}}",
      "{\"body\":\"Export job completed\",\"attributes\":{\"level\":\"info\",\"rows\":5000}}",
      "{\"body\":\"API token expired\",\"attributes\":{\"level\":\"warn\",\"service\":\"auth\"}}"
    ],
    "expectedBodies": [
      "Dashboard rendered",
      "Export job completed",
      "API token expired"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add an `exporters` section with a `loki` exporter",
      "Set `endpoint` to the Loki push API URL",
      "Loki is a log aggregation system from Grafana Labs",
      "Wire it into `service.pipelines.logs.exporters`"
    ],
    "starterYaml": "exporters:\n  loki:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [filelog]\n      exporters: [loki]\n",
    "solutionExporters": {
      "loki": {
        "endpoint": "https://loki.example.com:3100/loki/api/v1/push"
      }
    }
  },
  {
    "id": "level-23",
    "title": "Syslog Watcher",
    "description": "Configure a **syslog receiver** to listen for incoming syslog messages over TCP on port `514`, using the `rfc5424` protocol format.",
    "difficulty": "medium",
    "category": "receiver-config",
    "basePoints": 200,
    "inputLogs": [
      "<34>1 2024-01-15T10:00:00Z myhost myapp 1234 - - Server started",
      "<34>1 2024-01-15T10:01:00Z myhost myapp 1234 - - User login from 10.0.0.5",
      "<34>1 2024-01-15T10:02:00Z myhost myapp 1234 - - Connection timeout"
    ],
    "expectedBodies": [
      "<34>1 2024-01-15T10:00:00Z myhost myapp 1234 - - Server started",
      "<34>1 2024-01-15T10:01:00Z myhost myapp 1234 - - User login from 10.0.0.5",
      "<34>1 2024-01-15T10:02:00Z myhost myapp 1234 - - Connection timeout"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add a `receivers` section with a `syslog` receiver",
      "Configure TCP protocol under the `tcp` key with a `listen_address`",
      "Set the `protocol` to `rfc5424` for standard syslog format",
      "Wire it into `service.pipelines.logs.receivers`"
    ],
    "starterYaml": "receivers:\n  syslog:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [syslog]\n      exporters: [file]\n",
    "solutionReceivers": {
      "syslog": {
        "tcp": {
          "listen_address": "0.0.0.0:514"
        },
        "protocol": "rfc5424"
      }
    }
  },
  {
    "id": "level-24",
    "title": "Health Check",
    "description": "The Collector can expose a health check endpoint for monitoring. Configure the **health_check** extension on port `13133`.",
    "difficulty": "easy",
    "category": "extensions",
    "basePoints": 100,
    "inputLogs": [
      "{\"body\":\"Collector started\",\"attributes\":{\"level\":\"info\",\"version\":\"0.1.0\"}}",
      "{\"body\":\"Pipeline initialized\",\"attributes\":{\"level\":\"info\",\"pipeline\":\"logs\"}}"
    ],
    "expectedBodies": [
      "Collector started",
      "Pipeline initialized"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add an `extensions` section with `health_check`",
      "Set the `endpoint` to `0.0.0.0:13133`",
      "Add `extensions: [health_check]` under the `service` section",
      "Extensions are not part of the pipeline — they run alongside it"
    ],
    "starterYaml": "extensions:\n  health_check:\n\nservice:\n  extensions: [health_check]\n  pipelines:\n    logs:\n      receivers: [filelog]\n      exporters: [file]\n",
    "solutionExtensions": {
      "health_check": {
        "endpoint": "0.0.0.0:13133"
      }
    },
    "serviceExtensions": [
      "health_check"
    ]
  },
  {
    "id": "level-25",
    "title": "Double Pipeline",
    "description": "Real-world deployments often need different processing for different log streams. Create **two pipelines**:\n- **`logs`** — uses the `filter` processor to drop debug logs, then the `attributes` processor to hash emails - **`logs/important`** — only hashes emails (keeps debug logs)\nBoth pipelines read from the same `filelog` receiver.",
    "difficulty": "hard",
    "category": "pipeline",
    "basePoints": 400,
    "inputLogs": [
      "{\"body\":\"Cache refreshed\",\"attributes\":{\"level\":\"debug\",\"user.email\":\"cache@system.local\",\"cache\":\"users\"}}",
      "{\"body\":\"Order placed\",\"attributes\":{\"level\":\"info\",\"user.email\":\"buyer@shop.com\",\"order\":\"ORD-123\"}}",
      "{\"body\":\"Payment failed\",\"attributes\":{\"level\":\"error\",\"user.email\":\"billing@corp.net\",\"amount\":99.95}}"
    ],
    "expectedBodies": [
      "Cache refreshed",
      "Order placed",
      "Payment failed"
    ],
    "requiredProcessors": [],
    "hints": [
      "You need TWO entries under `service.pipelines`",
      "The first is `logs` with `filter` then `attributes` processors",
      "The second is `logs/important` with just `attributes`",
      "Both use the same `filelog` receiver",
      "Use separate `file` exporters for each pipeline path"
    ],
    "starterYaml": "receivers:\n  filelog:\n    include: [/var/log/app.log]\n    start_at: beginning\n\nprocessors:\n  filter:\n    logs:\n      log_record:\n  attributes:\n    actions:\n\nexporters:\n  file/normal:\n    path: /tmp/normal-logs.json\n  file/important:\n    path: /tmp/important-logs.json\n\nservice:\n  pipelines:\n    logs:\n      receivers: [filelog]\n      processors: [filter, attributes]\n      exporters: [file/normal]\n    logs/important:\n      receivers: [filelog]\n      processors: [attributes]\n      exporters: [file/important]\n",
    "solutionProcessors": {
      "filter": {
        "logs": {
          "log_record": [
            "IsMatch(attributes[\"level\"], \"debug\")"
          ]
        }
      },
      "attributes": {
        "actions": [
          {
            "key": "user.email",
            "action": "hash"
          }
        ]
      }
    },
    "solutionReceivers": {
      "filelog": {
        "include": [
          "/var/log/app.log"
        ],
        "start_at": "beginning"
      }
    },
    "solutionExporters": {
      "file/normal": {
        "path": "/tmp/normal-logs.json"
      },
      "file/important": {
        "path": "/tmp/important-logs.json"
      }
    },
    "solutionPipelines": {
      "logs": {
        "receivers": [
          "filelog"
        ],
        "processors": [
          "filter",
          "attributes"
        ],
        "exporters": [
          "file/normal"
        ]
      },
      "logs/important": {
        "receivers": [
          "filelog"
        ],
        "processors": [
          "attributes"
        ],
        "exporters": [
          "file/important"
        ]
      }
    }
  },
  {
    "id": "level-26",
    "title": "Route by Level",
    "description": "Route logs to different pipelines based on their severity level. Use the **routing** processor to send `error` logs to a dedicated pipeline while normal logs go through the standard one.",
    "difficulty": "hard",
    "category": "conditional",
    "basePoints": 400,
    "inputLogs": [
      "{\"body\":\"Connection established\",\"attributes\":{\"level\":\"info\",\"service\":\"db\"}}",
      "{\"body\":\"Disk full — write failed\",\"attributes\":{\"level\":\"error\",\"service\":\"storage\",\"device\":\"/dev/sda1\"}}",
      "{\"body\":\"Health check passed\",\"attributes\":{\"level\":\"info\",\"service\":\"api\"}}"
    ],
    "expectedBodies": [
      "Connection established",
      "Disk full — write failed",
      "Health check passed"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add a `routing` processor with a `table` of routes",
      "Each route has a `statement` using the `route()` function",
      "Route error logs to `logs/errors` pipeline",
      "You also need TWO pipelines: `logs` and `logs/errors`",
      "The error pipeline can just use a file exporter with a different path"
    ],
    "starterYaml": "processors:\n  routing:\n    table:\n\nexporters:\n  file/normal:\n    path: /tmp/normal-logs.json\n  file/errors:\n    path: /tmp/error-logs.json\n\nservice:\n  pipelines:\n    logs:\n      receivers: [filelog]\n      processors: [routing]\n      exporters: [file/normal]\n    logs/errors:\n      receivers: [filelog]\n      processors: []\n      exporters: [file/errors]\n",
    "solutionProcessors": {
      "routing": {
        "table": [
          {
            "statement": "route()"
          }
        ]
      }
    },
    "solutionExporters": {
      "file/normal": {
        "path": "/tmp/normal-logs.json"
      },
      "file/errors": {
        "path": "/tmp/error-logs.json"
      }
    },
    "solutionPipelines": {
      "logs": {
        "receivers": [
          "filelog"
        ],
        "processors": [
          "routing"
        ],
        "exporters": [
          "file/normal"
        ]
      },
      "logs/errors": {
        "receivers": [
          "filelog"
        ],
        "processors": [],
        "exporters": [
          "file/errors"
        ]
      }
    }
  },
  {
    "id": "level-27",
    "title": "Connector Bridge",
    "description": "Connectors let you bridge pipelines across telemetry signals. Configure a **count** connector that counts log records and generates metrics.",
    "difficulty": "hard",
    "category": "connectors",
    "basePoints": 500,
    "inputLogs": [
      "{\"body\":\"API request processed\",\"attributes\":{\"level\":\"info\",\"endpoint\":\"/users\",\"status\":200}}",
      "{\"body\":\"API request processed\",\"attributes\":{\"level\":\"info\",\"endpoint\":\"/orders\",\"status\":201}}",
      "{\"body\":\"API request processed\",\"attributes\":{\"level\":\"info\",\"endpoint\":\"/users\",\"status\":404}}"
    ],
    "expectedBodies": [
      "API request processed",
      "API request processed",
      "API request processed"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add a `connectors` section with a `count` connector",
      "The count connector matches logs by a condition and counts them",
      "It acts as both an exporter in the source pipeline and a receiver in the destination pipeline",
      "Configure it with `logs` section and a `metric_description`",
      "Add `connectors` to your `service.pipelines` to wire everything"
    ],
    "starterYaml": "connectors:\n  count:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [filelog]\n      exporters: [count, file]\n    logs/counts:\n      receivers: [count]\n      exporters: [file]\n",
    "solutionConnectors": {
      "count": {
        "logs": {
          "metric_description": "Count of log records by severity"
        }
      }
    },
    "solutionPipelines": {
      "logs": {
        "receivers": [
          "filelog"
        ],
        "exporters": [
          "count",
          "file"
        ]
      },
      "logs/counts": {
        "receivers": [
          "count"
        ],
        "exporters": [
          "file"
        ]
      }
    }
  },
  {
    "id": "level-28",
    "title": "Multiline Logs",
    "description": "Some logs span multiple lines (like stack traces or multi-line messages). Configure the `filelog` receiver to merge lines that start with a **timestamp pattern** (`^\\d{4}-\\d{2}-\\d{2}`) so each log entry is a complete block.",
    "difficulty": "medium",
    "category": "receiver-operators",
    "basePoints": 250,
    "inputLogs": [
      "2024-01-15 INFO Order 12345",
      "  Status: pending",
      "  Items: 3",
      "2024-01-15 ERROR Connection timeout",
      "  Retry attempt 1/3",
      "  Backend: api.example.com",
      "2024-01-15 INFO Cache refreshed",
      "  Entries: 1500"
    ],
    "expectedBodies": [
      "2024-01-15 INFO Order 12345\n  Status: pending\n  Items: 3",
      "2024-01-15 ERROR Connection timeout\n  Retry attempt 1/3\n  Backend: api.example.com",
      "2024-01-15 INFO Cache refreshed\n  Entries: 1500"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add `multiline` config to your `filelog` receiver",
      "Use `line_start_pattern` to match timestamp lines",
      "Pattern: `^\\d{4}-\\d{2}-\\d{2}` (lines starting with a date)",
      "Lines that don't match the pattern are appended to the previous entry",
      "No `json_parser` operator needed — we want the raw merged text"
    ],
    "starterYaml": "receivers:\n  filelog:\n    include: [/var/log/app.log]\n    start_at: beginning\n    multiline:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [filelog]\n      exporters: [file]\n",
    "solutionReceivers": {
      "filelog": {
        "include": [
          "/var/log/app.log"
        ],
        "start_at": "beginning",
        "multiline": {
          "line_start_pattern": "^\\d{4}-\\d{2}-\\d{2}"
        }
      }
    }
  },
  {
    "id": "level-29",
    "title": "JSON in the Wild",
    "description": "Some log bodies contain embedded JSON strings that need to be parsed into structured attributes. Use the **transform** processor with OTTL's `parse_json` to extract the JSON fields from the body.",
    "difficulty": "medium",
    "category": "transformation",
    "basePoints": 250,
    "inputLogs": [
      "{\"body\":\"{\\\"event\\\": \\\"login\\\", \\\"user_id\\\": 12345, \\\"ip\\\": \\\"10.0.0.1\\\"}\",\"attributes\":{\"level\":\"info\"}}",
      "{\"body\":\"{\\\"event\\\": \\\"purchase\\\", \\\"amount\\\": 49.99, \\\"currency\\\": \\\"USD\\\"}\",\"attributes\":{\"level\":\"info\"}}",
      "{\"body\":\"{\\\"event\\\": \\\"error\\\", \\\"code\\\": \\\"E403\\\", \\\"resource\\\": \\\"/api/admin\\\"}\",\"attributes\":{\"level\":\"warn\"}}"
    ],
    "expectedBodies": [
      "{\"event\": \"login\", \"user_id\": 12345, \"ip\": \"10.0.0.1\"}",
      "{\"event\": \"purchase\", \"amount\": 49.99, \"currency\": \"USD\"}",
      "{\"event\": \"error\", \"code\": \"E403\", \"resource\": \"/api/admin\"}"
    ],
    "requiredProcessors": [
      "transform"
    ],
    "hints": [
      "Use the `transform` processor with `log_statements`",
      "Use `parse_json(body)` to parse the body as JSON",
      "Set the parsed result to a new `parsed` attribute",
      "Example: `set(attributes[\"parsed\"], parse_json(body))`",
      "Make sure context is `log`"
    ],
    "starterYaml": "processors:\n  transform:\n    log_statements:\n      - context: log\n        statements:\n\nservice:\n  pipelines:\n    logs:\n      processors: [transform]\n",
    "solutionProcessors": {
      "transform": {
        "log_statements": [
          {
            "context": "log",
            "statements": [
              "set(attributes[\"parsed\"], parse_json(body))"
            ]
          }
        ]
      }
    }
  },
  {
    "id": "level-30",
    "title": "Allow List",
    "description": "Only keep safe attributes. Configure the **redaction** processor to allow only `level`, `message`, and `timestamp` attributes — everything else should be removed.",
    "difficulty": "easy",
    "category": "pii-redaction",
    "basePoints": 120,
    "inputLogs": [
      "{\"body\":\"User logged in\",\"attributes\":{\"level\":\"info\",\"user.email\":\"user@test.com\",\"user.ip\":\"10.0.0.1\",\"message\":\"login success\",\"timestamp\":\"2024-01-15T10:00:00Z\"}}",
      "{\"body\":\"Payment processed\",\"attributes\":{\"level\":\"info\",\"credit_card\":\"4111111111111111\",\"message\":\"payment ok\",\"timestamp\":\"2024-01-15T10:01:00Z\",\"user.email\":\"buyer@shop.com\"}}",
      "{\"body\":\"Error occurred\",\"attributes\":{\"level\":\"error\",\"message\":\"db timeout\",\"timestamp\":\"2024-01-15T10:02:00Z\",\"stack_trace\":\"java.lang.NullPointerException\",\"user.id\":\"usr_001\"}}"
    ],
    "expectedBodies": [
      "User logged in",
      "Payment processed",
      "Error occurred"
    ],
    "requiredProcessors": [
      "redaction"
    ],
    "hints": [
      "Use the **redaction** processor",
      "Set `allowed_keys` to a list of attribute names to keep",
      "Only `level`, `message`, and `timestamp` should survive",
      "Set `allow_all_keys` to `false` (default) so unlisted keys are dropped"
    ],
    "starterYaml": "processors:\n  redaction:\n\nservice:\n  pipelines:\n    logs:\n      processors: [redaction]\n",
    "solutionProcessors": {
      "redaction": {
        "allowed_keys": [
          "level",
          "message",
          "timestamp"
        ]
      }
    }
  },
  {
    "id": "level-31",
    "title": "Block Values",
    "description": "Some attribute values contain sensitive data patterns. Configure the **redaction** processor to mask credit card numbers using a `blocked_values` regex pattern.",
    "difficulty": "easy",
    "category": "pii-redaction",
    "basePoints": 120,
    "inputLogs": [
      "{\"body\":\"Payment by card\",\"attributes\":{\"level\":\"info\",\"card\":\"4532123456789012\",\"holder\":\"John Doe\"}}",
      "{\"body\":\"Refund to card\",\"attributes\":{\"level\":\"info\",\"card\":\"5425234567890123\",\"holder\":\"Jane Smith\"}}",
      "{\"body\":\"Normal log\",\"attributes\":{\"level\":\"info\",\"message\":\"Health check passed\"}}"
    ],
    "expectedBodies": [
      "Payment by card",
      "Refund to card",
      "Normal log"
    ],
    "requiredProcessors": [
      "redaction"
    ],
    "hints": [
      "Use the **redaction** processor with `allow_all_keys: true`",
      "Add `blocked_values` with a regex matching 16-digit card numbers",
      "The regex: `\\d{16}`",
      "Matching values will be masked with asterisks"
    ],
    "starterYaml": "processors:\n  redaction:\n\nservice:\n  pipelines:\n    logs:\n      processors: [redaction]\n",
    "solutionProcessors": {
      "redaction": {
        "allow_all_keys": true,
        "blocked_values": [
          "\\\\d{16}"
        ]
      }
    }
  },
  {
    "id": "level-32",
    "title": "URL Sanitizer",
    "description": "URLs in logs often contain high-cardinality data like user IDs. Configure the **redaction** processor with `url_sanitizer` to clean sensitive path segments from `http.url` attributes.",
    "difficulty": "medium",
    "category": "pii-redaction",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"API call\",\"attributes\":{\"level\":\"info\",\"http.url\":\"https://api.example.com/users/12345/profile\",\"status\":200}}",
      "{\"body\":\"API call\",\"attributes\":{\"level\":\"info\",\"http.url\":\"https://api.example.com/users/67890/profile\",\"status\":404}}",
      "{\"body\":\"API call\",\"attributes\":{\"level\":\"info\",\"http.url\":\"https://api.example.com/health\",\"status\":200}}"
    ],
    "expectedBodies": [
      "API call",
      "API call",
      "API call"
    ],
    "requiredProcessors": [
      "redaction"
    ],
    "hints": [
      "Use the **redaction** processor with `allow_all_keys: true`",
      "Add a `url_sanitizer` section with `enabled: true`",
      "Set `attributes` to `[\"http.url\"]`",
      "The sanitizer removes UUIDs, timestamps, and numeric IDs from URLs"
    ],
    "starterYaml": "processors:\n  redaction:\n\nservice:\n  pipelines:\n    logs:\n      processors: [redaction]\n",
    "solutionProcessors": {
      "redaction": {
        "allow_all_keys": true,
        "url_sanitizer": {
          "enabled": true,
          "attributes": [
            "http.url"
          ]
        }
      }
    }
  },
  {
    "id": "level-33",
    "title": "Hash It",
    "description": "Instead of masking values, hash them so they remain consistent for correlation. Configure the **redaction** processor to hash IP addresses using `sha256`.",
    "difficulty": "medium",
    "category": "pii-redaction",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"Login from new IP\",\"attributes\":{\"level\":\"info\",\"client_ip\":\"10.0.0.5\",\"user\":\"alice\"}}",
      "{\"body\":\"Login from new IP\",\"attributes\":{\"level\":\"info\",\"client_ip\":\"10.0.0.5\",\"user\":\"bob\"}}",
      "{\"body\":\"Login from new IP\",\"attributes\":{\"level\":\"warn\",\"client_ip\":\"192.168.1.1\",\"user\":\"admin\"}}"
    ],
    "expectedBodies": [
      "Login from new IP",
      "Login from new IP",
      "Login from new IP"
    ],
    "requiredProcessors": [
      "redaction"
    ],
    "hints": [
      "Use the **redaction** processor with `allow_all_keys: true`",
      "Set `hash_function` to `sha256`",
      "Add `blocked_values` with a regex for IPv4 addresses: `(?:[0-9]{1,3}\\.){3}[0-9]{1,3}`",
      "Hashed values remain the same for identical inputs (good for correlation)"
    ],
    "starterYaml": "processors:\n  redaction:\n\nservice:\n  pipelines:\n    logs:\n      processors: [redaction]\n",
    "solutionProcessors": {
      "redaction": {
        "allow_all_keys": true,
        "hash_function": "sha256",
        "blocked_values": [
          "(?:[0-9]{1,3}\\.){3}[0-9]{1,3}"
        ]
      }
    }
  },
  {
    "id": "level-34",
    "title": "Database Sanitizer",
    "description": "Database queries in logs can contain sensitive literal values. Configure the **redaction** processor with `db_sanitizer` to redact SQL values from `db.statement` attributes.",
    "difficulty": "hard",
    "category": "pii-redaction",
    "basePoints": 300,
    "inputLogs": [
      "{\"body\":\"Query executed\",\"attributes\":{\"level\":\"info\",\"db.statement\":\"SELECT * FROM users WHERE email = 'test@test.com' AND password = 'secret123'\",\"db.system\":\"postgresql\"}}",
      "{\"body\":\"Query executed\",\"attributes\":{\"level\":\"info\",\"db.statement\":\"INSERT INTO orders (user_id, amount) VALUES (42, 99.95)\",\"db.system\":\"mysql\"}}",
      "{\"body\":\"Cache miss\",\"attributes\":{\"level\":\"debug\",\"message\":\"no cache entry\"}}"
    ],
    "expectedBodies": [
      "Query executed",
      "Query executed",
      "Cache miss"
    ],
    "requiredProcessors": [
      "redaction"
    ],
    "hints": [
      "Use the **redaction** processor with `allow_all_keys: true`",
      "Add a `db_sanitizer` section with `sql.enabled: true`",
      "Set `sql.attributes` to `[\"db.statement\"]`",
      "The sanitizer replaces literal values in SQL with placeholders"
    ],
    "starterYaml": "processors:\n  redaction:\n\nservice:\n  pipelines:\n    logs:\n      processors: [redaction]\n",
    "solutionProcessors": {
      "redaction": {
        "allow_all_keys": true,
        "db_sanitizer": {
          "sql": {
            "enabled": true,
            "attributes": [
              "db.statement"
            ]
          }
        }
      }
    }
  },
  {
    "id": "level-35",
    "title": "Silent Repetition",
    "description": "Some logs repeat frequently and waste storage. Configure the **log_dedup** processor to aggregate identical logs over a **30 second** interval, emitting only one log with a count.",
    "difficulty": "easy",
    "category": "performance",
    "basePoints": 120,
    "inputLogs": [
      "{\"body\":\"Health check passed\",\"attributes\":{\"level\":\"info\",\"service\":\"api\"}}",
      "{\"body\":\"Health check passed\",\"attributes\":{\"level\":\"info\",\"service\":\"api\"}}",
      "{\"body\":\"Health check passed\",\"attributes\":{\"level\":\"info\",\"service\":\"api\"}}",
      "{\"body\":\"Database query slow\",\"attributes\":{\"level\":\"warn\",\"query_time_ms\":1500}}",
      "{\"body\":\"Health check passed\",\"attributes\":{\"level\":\"info\",\"service\":\"api\"}}"
    ],
    "expectedBodies": [
      "Health check passed",
      "Database query slow",
      "Health check passed"
    ],
    "requiredProcessors": [
      "log_dedup"
    ],
    "hints": [
      "Add a `log_dedup` processor to the `processors` section",
      "Set `interval` to `30s` to aggregate logs over 30 seconds",
      "Identical logs (same body + attributes) are deduplicated",
      "The count of deduplicated logs is added as an attribute"
    ],
    "starterYaml": "processors:\n  log_dedup:\n\nservice:\n  pipelines:\n    logs:\n      processors: [log_dedup]\n",
    "solutionProcessors": {
      "log_dedup": {
        "interval": "30s"
      }
    }
  },
  {
    "id": "level-36",
    "title": "Dedup by Fields",
    "description": "Sometimes only specific fields matter for deduplication. Configure the **log_dedup** processor to match logs only on their `error_code` attribute.",
    "difficulty": "medium",
    "category": "performance",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"Request failed\",\"attributes\":{\"level\":\"error\",\"error_code\":\"E500\",\"request_id\":\"abc-001\",\"user\":\"alice\"}}",
      "{\"body\":\"Request failed\",\"attributes\":{\"level\":\"error\",\"error_code\":\"E500\",\"request_id\":\"def-002\",\"user\":\"bob\"}}",
      "{\"body\":\"Request failed\",\"attributes\":{\"level\":\"error\",\"error_code\":\"E403\",\"request_id\":\"ghi-003\",\"user\":\"admin\"}}",
      "{\"body\":\"Request failed\",\"attributes\":{\"level\":\"error\",\"error_code\":\"E500\",\"request_id\":\"jkl-004\",\"user\":\"carol\"}}"
    ],
    "expectedBodies": [
      "Request failed",
      "Request failed",
      "Request failed",
      "Request failed"
    ],
    "requiredProcessors": [
      "log_dedup"
    ],
    "hints": [
      "Use the **log_dedup** processor with an `interval`",
      "Set `include_fields` to only match on `error_code`",
      "Logs with the same error_code will be deduplicated regardless of other differences",
      "Use field path syntax: `attributes.error_code`"
    ],
    "starterYaml": "processors:\n  log_dedup:\n\nservice:\n  pipelines:\n    logs:\n      processors: [log_dedup]\n",
    "solutionProcessors": {
      "log_dedup": {
        "interval": "30s",
        "include_fields": [
          "attributes.error_code"
        ]
      }
    }
  },
  {
    "id": "level-37",
    "title": "Conditional Dedup",
    "description": "Only deduplicate logs that match certain conditions. Configure the **log_dedup** processor to only aggregate logs with severity `ERROR` using an OTTL condition.",
    "difficulty": "medium",
    "category": "performance",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"Disk space low\",\"attributes\":{\"level\":\"warn\",\"disk_pct\":85}}",
      "{\"body\":\"Connection timeout\",\"attributes\":{\"level\":\"error\",\"service\":\"db\"}}",
      "{\"body\":\"Connection timeout\",\"attributes\":{\"level\":\"error\",\"service\":\"db\"}}",
      "{\"body\":\"Disk space low\",\"attributes\":{\"level\":\"warn\",\"disk_pct\":87}}",
      "{\"body\":\"Connection timeout\",\"attributes\":{\"level\":\"error\",\"service\":\"db\"}}"
    ],
    "expectedBodies": [
      "Disk space low",
      "Connection timeout",
      "Disk space low",
      "Connection timeout"
    ],
    "requiredProcessors": [
      "log_dedup"
    ],
    "hints": [
      "Use the **log_dedup** processor",
      "Add a `conditions` list with an OTTL expression",
      "Use `log.attributes[\"level\"] == \"error\"` to only dedup ERROR logs",
      "WARN and other logs pass through without deduplication"
    ],
    "starterYaml": "processors:\n  log_dedup:\n\nservice:\n  pipelines:\n    logs:\n      processors: [log_dedup]\n",
    "solutionProcessors": {
      "log_dedup": {
        "interval": "30s",
        "conditions": [
          "log.attributes[\"level\"] == \"error\""
        ]
      }
    }
  },
  {
    "id": "level-38",
    "title": "Insert Missing",
    "description": "When an attribute is missing, add a default value. Use the **attributes** processor with the `insert` action to add `environment: production` on every log that doesn't already have it.",
    "difficulty": "easy",
    "category": "transformation",
    "basePoints": 120,
    "inputLogs": [
      "{\"body\":\"Deployment finished\",\"attributes\":{\"level\":\"info\",\"service\":\"api\"}}",
      "{\"body\":\"Deployment finished\",\"attributes\":{\"level\":\"info\",\"service\":\"worker\",\"environment\":\"staging\"}}",
      "{\"body\":\"Deployment finished\",\"attributes\":{\"level\":\"info\",\"service\":\"db\"}}"
    ],
    "expectedBodies": [
      "Deployment finished",
      "Deployment finished",
      "Deployment finished"
    ],
    "requiredProcessors": [
      "attributes"
    ],
    "hints": [
      "Use the **attributes** processor with `actions`",
      "Action `insert` only sets the value if the key doesn't already exist",
      "Key: `environment`, Value: `production`",
      "Compare with `upsert` which overwrites existing values"
    ],
    "starterYaml": "processors:\n  attributes:\n    actions:\n\nservice:\n  pipelines:\n    logs:\n      processors: [attributes]\n",
    "solutionProcessors": {
      "attributes": {
        "actions": [
          {
            "key": "environment",
            "value": "production",
            "action": "insert"
          }
        ]
      }
    }
  },
  {
    "id": "level-39",
    "title": "Upsert It",
    "description": "Use the **attributes** processor with `upsert` to set a `datacenter` attribute to `us-east-1`, overwriting any existing value.",
    "difficulty": "easy",
    "category": "transformation",
    "basePoints": 120,
    "inputLogs": [
      "{\"body\":\"Node joined cluster\",\"attributes\":{\"level\":\"info\",\"node\":\"node-1\",\"datacenter\":\"us-west-2\"}}",
      "{\"body\":\"Node joined cluster\",\"attributes\":{\"level\":\"info\",\"node\":\"node-2\"}}",
      "{\"body\":\"Node joined cluster\",\"attributes\":{\"level\":\"info\",\"node\":\"node-3\",\"datacenter\":\"eu-west-1\"}}"
    ],
    "expectedBodies": [
      "Node joined cluster",
      "Node joined cluster",
      "Node joined cluster"
    ],
    "requiredProcessors": [
      "attributes"
    ],
    "hints": [
      "Use the **attributes** processor with `actions`",
      "Action `upsert` creates or overwrites the attribute",
      "Key: `datacenter`, Value: `us-east-1`",
      "All logs should end up with `datacenter: us-east-1`"
    ],
    "starterYaml": "processors:\n  attributes:\n    actions:\n\nservice:\n  pipelines:\n    logs:\n      processors: [attributes]\n",
    "solutionProcessors": {
      "attributes": {
        "actions": [
          {
            "key": "datacenter",
            "value": "us-east-1",
            "action": "upsert"
          }
        ]
      }
    }
  },
  {
    "id": "level-40",
    "title": "Extract Regex",
    "description": "Extract structured data from an existing attribute using regex. Use the **attributes** processor with the `extract` action to parse `version: v2.1.3-rc1` into separate `version_major`, `version_minor`, `version_patch`, and `version_tag` attributes.",
    "difficulty": "medium",
    "category": "transformation",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"Deploy released\",\"attributes\":{\"level\":\"info\",\"version\":\"v2.1.3-rc1\"}}",
      "{\"body\":\"Deploy released\",\"attributes\":{\"level\":\"info\",\"version\":\"v3.0.0\"}}",
      "{\"body\":\"Deploy released\",\"attributes\":{\"level\":\"info\",\"version\":\"v1.5.2-beta\"}}"
    ],
    "expectedBodies": [
      "Deploy released",
      "Deploy released",
      "Deploy released"
    ],
    "requiredProcessors": [
      "attributes"
    ],
    "hints": [
      "Use the **attributes** processor with `extract` action",
      "The `key` is the attribute to extract from: `version`",
      "The `pattern` uses named capture groups: `v(?P<major>\\d+)\\.(?P<minor>\\d+)\\.(?P<patch>\\d+)(-(?P<tag>\\w+))?`",
      "Extracted values become new attribute keys matching the group names"
    ],
    "starterYaml": "processors:\n  attributes:\n    actions:\n\nservice:\n  pipelines:\n    logs:\n      processors: [attributes]\n",
    "solutionProcessors": {
      "attributes": {
        "actions": [
          {
            "key": "version",
            "pattern": "v(?P<major>\\d+)\\.(?P<minor>\\d+)\\.(?P<patch>\\d+)(-(?P<tag>\\w+))?",
            "action": "extract"
          }
        ]
      }
    }
  },
  {
    "id": "level-41",
    "title": "Type Convert",
    "description": "Sometimes attribute values are the wrong type. Use the **attributes** processor with the `convert` action to change `http.status_code` from a string to an integer.",
    "difficulty": "medium",
    "category": "transformation",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"Request completed\",\"attributes\":{\"level\":\"info\",\"http.status_code\":\"200\",\"latency_ms\":\"42\"}}",
      "{\"body\":\"Not found\",\"attributes\":{\"level\":\"warn\",\"http.status_code\":\"404\",\"latency_ms\":\"12\"}}",
      "{\"body\":\"Server error\",\"attributes\":{\"level\":\"error\",\"http.status_code\":\"500\",\"latency_ms\":\"3200\"}}"
    ],
    "expectedBodies": [
      "Request completed",
      "Not found",
      "Server error"
    ],
    "requiredProcessors": [
      "attributes"
    ],
    "hints": [
      "Use the **attributes** processor with `convert` action",
      "Key: `http.status_code`, converted_type: `int`",
      "The string `\"200\"` becomes the integer `200`",
      "Also try converting `latency_ms` to `int`"
    ],
    "starterYaml": "processors:\n  attributes:\n    actions:\n\nservice:\n  pipelines:\n    logs:\n      processors: [attributes]\n",
    "solutionProcessors": {
      "attributes": {
        "actions": [
          {
            "key": "http.status_code",
            "action": "convert",
            "converted_type": "int"
          }
        ]
      }
    }
  },
  {
    "id": "level-42",
    "title": "Merge Maps",
    "description": "Parse JSON from the log body and merge it into the attributes. Use the **transform** processor with `merge_maps` and `ParseJSON` to bring body fields into attributes.",
    "difficulty": "medium",
    "category": "transformation",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"{\\\"event\\\": \\\"login\\\", \\\"user_id\\\": 42}\",\"attributes\":{\"level\":\"info\"}}",
      "{\"body\":\"{\\\"event\\\": \\\"purchase\\\", \\\"amount\\\": 29.99}\",\"attributes\":{\"level\":\"info\"}}",
      "{\"body\":\"Plain text log here\",\"attributes\":{\"level\":\"info\"}}"
    ],
    "expectedBodies": [
      "{\"event\": \"login\", \"user_id\": 42}",
      "{\"event\": \"purchase\", \"amount\": 29.99}",
      "Plain text log here"
    ],
    "requiredProcessors": [
      "transform"
    ],
    "hints": [
      "Use the **transform** processor with `log_statements`",
      "Parse the body as JSON with `ParseJSON(log.body)`",
      "Merge the result into attributes with `merge_maps(log.attributes, ..., \"upsert\")`",
      "Use a condition: `where IsMatch(log.body, \"^\\\\{\")` to skip non-JSON bodies"
    ],
    "starterYaml": "processors:\n  transform:\n    log_statements:\n      - context: log\n        statements:\n\nservice:\n  pipelines:\n    logs:\n      processors: [transform]\n",
    "solutionProcessors": {
      "transform": {
        "log_statements": [
          {
            "context": "log",
            "statements": [
              "merge_maps(log.attributes, ParseJSON(log.body), \"upsert\") where IsMatch(log.body, \"^\\\\{\")"
            ]
          }
        ]
      }
    }
  },
  {
    "id": "level-43",
    "title": "Concat Fields",
    "description": "Combine multiple attributes into one. Use the **transform** processor with `Concat` to join `first_name` and `last_name` into a single `full_name` attribute, separated by a space.",
    "difficulty": "easy",
    "category": "transformation",
    "basePoints": 120,
    "inputLogs": [
      "{\"body\":\"User registered\",\"attributes\":{\"level\":\"info\",\"first_name\":\"John\",\"last_name\":\"Doe\"}}",
      "{\"body\":\"User registered\",\"attributes\":{\"level\":\"info\",\"first_name\":\"Jane\",\"last_name\":\"Smith\"}}",
      "{\"body\":\"User registered\",\"attributes\":{\"level\":\"info\",\"first_name\":\"Alice\",\"last_name\":\"Johnson\"}}"
    ],
    "expectedBodies": [
      "User registered",
      "User registered",
      "User registered"
    ],
    "requiredProcessors": [
      "transform"
    ],
    "hints": [
      "Use the **transform** processor with `log_statements`",
      "Use `Concat` to join two strings with a delimiter",
      "Syntax: `Concat([log.attributes[\"first_name\"], log.attributes[\"last_name\"]], \" \")`",
      "Set the result to `log.attributes[\"full_name\"]` with `set()`"
    ],
    "starterYaml": "processors:\n  transform:\n    log_statements:\n      - context: log\n        statements:\n\nservice:\n  pipelines:\n    logs:\n      processors: [transform]\n",
    "solutionProcessors": {
      "transform": {
        "log_statements": [
          {
            "context": "log",
            "statements": [
              "set(log.attributes[\"full_name\"], Concat([log.attributes[\"first_name\"], log.attributes[\"last_name\"]], \" \"))"
            ]
          }
        ]
      }
    }
  },
  {
    "id": "level-44",
    "title": "Match & Replace",
    "description": "Glob patterns are great for bulk attribute updates. Use the **transform** processor with `replace_all_matches` to change all routes matching `/user/*` to `/user/{id}` in the `http.route` attribute.",
    "difficulty": "medium",
    "category": "transformation",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"Request handled\",\"attributes\":{\"level\":\"info\",\"http.route\":\"/user/12345/profile\",\"status\":200}}",
      "{\"body\":\"Request handled\",\"attributes\":{\"level\":\"info\",\"http.route\":\"/user/67890/settings\",\"status\":200}}",
      "{\"body\":\"Request handled\",\"attributes\":{\"level\":\"info\",\"http.route\":\"/health\",\"status\":200}}"
    ],
    "expectedBodies": [
      "Request handled",
      "Request handled",
      "Request handled"
    ],
    "requiredProcessors": [
      "transform"
    ],
    "hints": [
      "Use the **transform** processor with `log_statements`",
      "Use `replace_all_matches` on `log.attributes`",
      "The pattern `/user/*/` matches any user route",
      "Replacement: `/user/{id}/`"
    ],
    "starterYaml": "processors:\n  transform:\n    log_statements:\n      - context: log\n        statements:\n\nservice:\n  pipelines:\n    logs:\n      processors: [transform]\n",
    "solutionProcessors": {
      "transform": {
        "log_statements": [
          {
            "context": "log",
            "statements": [
              "replace_all_matches(log.attributes, \"/user/*/*\", \"/user/{id}/{action}\")"
            ]
          }
        ]
      }
    }
  },
  {
    "id": "level-45",
    "title": "Keep Matching",
    "description": "Keep only attributes matching a regex pattern. Use the **transform** processor with `keep_matching_keys` to preserve only attributes starting with `k8s.`.",
    "difficulty": "medium",
    "category": "transformation",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"Pod scheduled\",\"attributes\":{\"level\":\"info\",\"k8s.pod.name\":\"web-1\",\"k8s.namespace.name\":\"production\",\"app.version\":\"1.0.0\",\"environment\":\"prod\"}}",
      "{\"body\":\"Pod scheduled\",\"attributes\":{\"level\":\"info\",\"k8s.pod.name\":\"worker-1\",\"k8s.namespace.name\":\"staging\",\"team\":\"backend\"}}"
    ],
    "expectedBodies": [
      "Pod scheduled",
      "Pod scheduled"
    ],
    "requiredProcessors": [
      "transform"
    ],
    "hints": [
      "Use the **transform** processor with `log_statements`",
      "Use `keep_matching_keys(log.attributes, \"k8s.*\")`",
      "Only attributes with keys starting with `k8s.` survive",
      "The `level` attribute is also kept by default in the pipeline"
    ],
    "starterYaml": "processors:\n  transform:\n    log_statements:\n      - context: log\n        statements:\n\nservice:\n  pipelines:\n    logs:\n      processors: [transform]\n",
    "solutionProcessors": {
      "transform": {
        "log_statements": [
          {
            "context": "log",
            "statements": [
              "keep_matching_keys(log.attributes, \"k8s.*\")"
            ]
          }
        ]
      }
    }
  },
  {
    "id": "level-46",
    "title": "Limit Attributes",
    "description": "Some logs carry too many attributes. Use the **transform** processor with `limit` to cap attributes at **5** per log, keeping only the first ones.",
    "difficulty": "easy",
    "category": "transformation",
    "basePoints": 120,
    "inputLogs": [
      "{\"body\":\"Rich log entry\",\"attributes\":{\"level\":\"info\",\"service\":\"api\",\"endpoint\":\"/users\",\"method\":\"GET\",\"status\":\"200\",\"duration_ms\":42,\"env\":\"prod\"}}",
      "{\"body\":\"Simple log\",\"attributes\":{\"level\":\"info\",\"message\":\"done\"}}"
    ],
    "expectedBodies": [
      "Rich log entry",
      "Simple log"
    ],
    "requiredProcessors": [
      "transform"
    ],
    "hints": [
      "Use the **transform** processor with `log_statements`",
      "Use `limit(log.attributes, 5, [])`",
      "The `[]` means no priority attributes (they are all subject to the limit)",
      "Only the first 5 attributes survive"
    ],
    "starterYaml": "processors:\n  transform:\n    log_statements:\n      - context: log\n        statements:\n\nservice:\n  pipelines:\n    logs:\n      processors: [transform]\n",
    "solutionProcessors": {
      "transform": {
        "log_statements": [
          {
            "context": "log",
            "statements": [
              "limit(log.attributes, 5, [])"
            ]
          }
        ]
      }
    }
  },
  {
    "id": "level-47",
    "title": "Delete Matching",
    "description": "Remove all attributes matching a sensitive pattern. Use the **transform** processor with `delete_matching_keys` to remove any attributes with `token`, `secret`, or `password` in their key name.",
    "difficulty": "medium",
    "category": "pii-redaction",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"API request\",\"attributes\":{\"level\":\"info\",\"auth_token\":\"eyJhbGciOiJIUzI1NiJ9\",\"api_key\":\"sk-abc123\",\"endpoint\":\"/data\",\"user.password\":\"supersecret\"}}",
      "{\"body\":\"API request\",\"attributes\":{\"level\":\"info\",\"endpoint\":\"/health\",\"status\":\"ok\"}}"
    ],
    "expectedBodies": [
      "API request",
      "API request"
    ],
    "requiredProcessors": [
      "transform"
    ],
    "hints": [
      "Use the **transform** processor with `log_statements`",
      "Use `delete_matching_keys(log.attributes, \"(?i).*(token|secret|password).*\")`",
      "The `(?i)` makes it case-insensitive",
      "Any attribute with token, secret, or password in the key is removed"
    ],
    "starterYaml": "processors:\n  transform:\n    log_statements:\n      - context: log\n        statements:\n\nservice:\n  pipelines:\n    logs:\n      processors: [transform]\n",
    "solutionProcessors": {
      "transform": {
        "log_statements": [
          {
            "context": "log",
            "statements": [
              "delete_matching_keys(log.attributes, \"(?i).*(token|secret|password).*\")"
            ]
          }
        ]
      }
    }
  },
  {
    "id": "level-48",
    "title": "Filter by Body",
    "description": "Use OTTL conditions with the **filter** processor to drop any log whose body contains the word `debug` (case-insensitive).",
    "difficulty": "medium",
    "category": "filtering",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"User logged in successfully\",\"attributes\":{\"level\":\"info\"}}",
      "{\"body\":\"Debug: cache miss for user 123\",\"attributes\":{\"level\":\"debug\"}}",
      "{\"body\":\"Payment processed\",\"attributes\":{\"level\":\"info\"}}",
      "{\"body\":\"debug mode enabled\",\"attributes\":{\"level\":\"debug\"}}"
    ],
    "expectedBodies": [
      "User logged in successfully",
      "Payment processed"
    ],
    "requiredProcessors": [
      "filter"
    ],
    "hints": [
      "Use the **filter** processor with `log_conditions`",
      "Use `IsMatch(log.body, \"(?i)debug\")` to match case-insensitively",
      "Logs matching any condition are dropped",
      "Set `error_mode: ignore` to handle non-string bodies gracefully"
    ],
    "starterYaml": "processors:\n  filter:\n\nservice:\n  pipelines:\n    logs:\n      processors: [filter]\n",
    "solutionProcessors": {
      "filter": {
        "error_mode": "ignore",
        "log_conditions": [
          "IsMatch(log.body, \"(?i)debug\")"
        ]
      }
    }
  },
  {
    "id": "level-49",
    "title": "Filter by Severity",
    "description": "Use OTTL conditions with the **filter** processor to drop all logs with severity below WARN (keeping only WARN, ERROR, and FATAL).",
    "difficulty": "medium",
    "category": "filtering",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"Cache hit\",\"attributes\":{\"level\":\"debug\"}}",
      "{\"body\":\"Request received\",\"attributes\":{\"level\":\"info\"}}",
      "{\"body\":\"High memory usage\",\"attributes\":{\"level\":\"warn\"}}",
      "{\"body\":\"Connection refused\",\"attributes\":{\"level\":\"error\"}}",
      "{\"body\":\"Operation completed\",\"attributes\":{\"level\":\"info\"}}"
    ],
    "expectedBodies": [
      "High memory usage",
      "Connection refused"
    ],
    "requiredProcessors": [
      "filter"
    ],
    "hints": [
      "Use the **filter** processor with `log_conditions`",
      "Filter by `log.severity_number` — INFO is 9, WARN is 13, ERROR is 17",
      "Use: `log.severity_number < SEVERITY_NUMBER_WARN`",
      "Logs matching the condition (less severe than WARN) are dropped"
    ],
    "starterYaml": "processors:\n  filter:\n\nservice:\n  pipelines:\n    logs:\n      processors: [filter]\n",
    "solutionProcessors": {
      "filter": {
        "error_mode": "ignore",
        "log_conditions": [
          "log.severity_number < SEVERITY_NUMBER_WARN"
        ]
      }
    }
  },
  {
    "id": "level-50",
    "title": "Webhook Endpoint",
    "description": "Configure a **webhookevent** receiver that listens for incoming webhooks at the `/events` endpoint on port `8080`.",
    "difficulty": "easy",
    "category": "receiver-config",
    "basePoints": 120,
    "inputLogs": [
      "{\"body\":\"Webhook received\",\"attributes\":{\"event\":\"push\",\"repo\":\"CollectorGame\"}}",
      "{\"body\":\"Webhook received\",\"attributes\":{\"event\":\"pull_request\",\"repo\":\"OTel\"}}"
    ],
    "expectedBodies": [
      "Webhook received",
      "Webhook received"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add a `receivers` section with a `webhookevent` receiver",
      "Set the `endpoint` to `0.0.0.0:8080`",
      "Set the `path` to `/events`",
      "Wire it into `service.pipelines.logs.receivers`"
    ],
    "starterYaml": "receivers:\n  webhookevent:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [webhookevent]\n      exporters: [file]\n",
    "solutionReceivers": {
      "webhookevent": {
        "endpoint": "0.0.0.0:8080",
        "path": "/events"
      }
    }
  },
  {
    "id": "level-51",
    "title": "Rate Limited Webhook",
    "description": "Protect your webhook receiver from overload. Add a **rate_limit** to the `webhookevent` receiver, allowing a maximum of **100 requests per second**.",
    "difficulty": "medium",
    "category": "receiver-config",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"Webhook received\",\"attributes\":{\"event\":\"push\",\"repo\":\"CollectorGame\"}}",
      "{\"body\":\"Webhook received\",\"attributes\":{\"event\":\"issue\",\"repo\":\"OTel\"}}"
    ],
    "expectedBodies": [
      "Webhook received",
      "Webhook received"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add a `receivers` section with a `webhookevent` receiver",
      "Add a `rate_limit` section inside the receiver config",
      "Set `hits_per_second` to `100`",
      "Set `enabled: true`"
    ],
    "starterYaml": "receivers:\n  webhookevent:\n    endpoint: 0.0.0.0:8080\n    path: /events\n    rate_limit:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [webhookevent]\n      exporters: [file]\n",
    "solutionReceivers": {
      "webhookevent": {
        "endpoint": "0.0.0.0:8080",
        "path": "/events",
        "rate_limit": {
          "enabled": true,
          "hits_per_second": 100
        }
      }
    }
  },
  {
    "id": "level-52",
    "title": "Authenticated Webhook",
    "description": "Secure your webhook endpoint. Configure a `webhookevent` receiver with `auth` to require a Bearer token `Bearer my-secret-token` in incoming requests.",
    "difficulty": "medium",
    "category": "receiver-config",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"Authenticated webhook received\",\"attributes\":{\"event\":\"push\",\"repo\":\"CollectorGame\"}}"
    ],
    "expectedBodies": [
      "Authenticated webhook received"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add an `auth` section to the `webhookevent` receiver",
      "Set `type` to `bearer`",
      "Set `token` to `my-secret-token`",
      "Only requests with the correct Bearer token will be accepted"
    ],
    "starterYaml": "receivers:\n  webhookevent:\n    endpoint: 0.0.0.0:8080\n    path: /events\n    auth:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [webhookevent]\n      exporters: [file]\n",
    "solutionReceivers": {
      "webhookevent": {
        "endpoint": "0.0.0.0:8080",
        "path": "/events",
        "auth": {
          "type": "bearer",
          "token": "my-secret-token"
        }
      }
    }
  },
  {
    "id": "level-53",
    "title": "OTLP File Read",
    "description": "Sometimes telemetry arrives as OTLP JSON files. Configure an **otlpjsonfilereceiver** to read logs from `/var/log/otlp/logs.json`.",
    "difficulty": "easy",
    "category": "receiver-config",
    "basePoints": 120,
    "inputLogs": [
      "{\"body\":\"Telemetry ingested from file\",\"attributes\":{\"source\":\"otlp-json\",\"level\":\"info\"}}"
    ],
    "expectedBodies": [
      "Telemetry ingested from file"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add a `receivers` section with an `otlpjsonfile` receiver",
      "Set `include` to the path of the OTLP JSON file",
      "Set `start_at: beginning`",
      "Wire it into `service.pipelines.logs.receivers`"
    ],
    "starterYaml": "receivers:\n  otlpjsonfile:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [otlpjsonfile]\n      exporters: [file]\n",
    "solutionReceivers": {
      "otlpjsonfile": {
        "include": "/var/log/otlp/logs.json",
        "start_at": "beginning"
      }
    }
  },
  {
    "id": "level-54",
    "title": "OTLP File Interval",
    "description": "Control how often the OTLP JSON File receiver checks for new data. Set the `collection_interval` to **10 seconds**.",
    "difficulty": "easy",
    "category": "receiver-config",
    "basePoints": 120,
    "inputLogs": [
      "{\"body\":\"Telemetry ingested from file\",\"attributes\":{\"source\":\"otlp-json\",\"level\":\"info\"}}"
    ],
    "expectedBodies": [
      "Telemetry ingested from file"
    ],
    "requiredProcessors": [],
    "hints": [
      "Use the `otlpjsonfile` receiver",
      "Add `collection_interval` set to `10s`",
      "This controls how often the receiver scans the file for new data",
      "Shorter intervals mean lower latency but more I/O"
    ],
    "starterYaml": "receivers:\n  otlpjsonfile:\n    include: /var/log/otlp/logs.json\n    start_at: beginning\n\nservice:\n  pipelines:\n    logs:\n      receivers: [otlpjsonfile]\n      exporters: [file]\n",
    "solutionReceivers": {
      "otlpjsonfile": {
        "include": "/var/log/otlp/logs.json",
        "start_at": "beginning",
        "collection_interval": "10s"
      }
    }
  },
  {
    "id": "level-55",
    "title": "Timestamp Parse",
    "description": "Add timestamp parsing to a `filelog` receiver operator. Configure a `regex_parser` that extracts a timestamp and parses it into the log record's observed timestamp.",
    "difficulty": "medium",
    "category": "receiver-operators",
    "basePoints": 250,
    "inputLogs": [
      "2024-01-15 10:30:00 INFO Server started",
      "2024-01-15 10:31:00 ERROR Connection timeout",
      "2024-01-15 10:32:00 WARN Disk usage high"
    ],
    "expectedBodies": [
      "2024-01-15 10:30:00 INFO Server started",
      "2024-01-15 10:31:00 ERROR Connection timeout",
      "2024-01-15 10:32:00 WARN Disk usage high"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add a `regex_parser` operator to the `filelog` receiver",
      "Pattern: `^(?P<timestamp>\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}) (?P<severity>\\w+) (?P<message>.*)$`",
      "Add a `timestamp` config to the operator with `parse_from: attributes.timestamp`",
      "Set `layout: '%Y-%m-%d %H:%M:%S'` for the timestamp format"
    ],
    "starterYaml": "receivers:\n  filelog:\n    include: [/var/log/app.log]\n    start_at: beginning\n    operators:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [filelog]\n      exporters: [file]\n",
    "solutionReceivers": {
      "filelog": {
        "include": [
          "/var/log/app.log"
        ],
        "start_at": "beginning",
        "operators": [
          {
            "type": "regex_parser",
            "regex": "^(?P<timestamp>\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}) (?P<severity>\\w+) (?P<message>.*)$",
            "parse_from": "body",
            "parse_to": "attributes",
            "timestamp": {
              "parse_from": "attributes.timestamp",
              "layout": "%Y-%m-%d %H:%M:%S"
            }
          }
        ]
      }
    }
  },
  {
    "id": "level-56",
    "title": "Severity Parse",
    "description": "Extract severity from raw log lines. Configure a `regex_parser` operator in the `filelog` receiver that parses the severity level from the log body.",
    "difficulty": "medium",
    "category": "receiver-operators",
    "basePoints": 250,
    "inputLogs": [
      "ERROR Database connection failed",
      "INFO Health check passed",
      "WARN Memory usage at 85%",
      "DEBUG Cache miss for key user:42"
    ],
    "expectedBodies": [
      "ERROR Database connection failed",
      "INFO Health check passed",
      "WARN Memory usage at 85%",
      "DEBUG Cache miss for key user:42"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add a `regex_parser` operator to the `filelog` receiver",
      "Pattern: `^(?P<sev>\\w+) (?P<msg>.*)$`",
      "Add a `severity` config with `parse_from: attributes.sev`",
      "The severity mapping: INFO->info, WARN->warn, ERROR->error, DEBUG->debug"
    ],
    "starterYaml": "receivers:\n  filelog:\n    include: [/var/log/app.log]\n    start_at: beginning\n    operators:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [filelog]\n      exporters: [file]\n",
    "solutionReceivers": {
      "filelog": {
        "include": [
          "/var/log/app.log"
        ],
        "start_at": "beginning",
        "operators": [
          {
            "type": "regex_parser",
            "regex": "^(?P<sev>\\w+) (?P<msg>.*)$",
            "parse_from": "body",
            "parse_to": "attributes",
            "severity": {
              "parse_from": "attributes.sev"
            }
          }
        ]
      }
    }
  },
  {
    "id": "level-57",
    "title": "Compressed Logs",
    "description": "Log files are often compressed to save space. Configure the `filelog` receiver to read **gzip** compressed files by setting the `compression` option.",
    "difficulty": "medium",
    "category": "receiver-config",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"Log line from compressed file\",\"attributes\":{\"level\":\"info\"}}",
      "{\"body\":\"Another log line\",\"attributes\":{\"level\":\"warn\"}}"
    ],
    "expectedBodies": [
      "Log line from compressed file",
      "Another log line"
    ],
    "requiredProcessors": [],
    "hints": [
      "Use the `filelog` receiver",
      "Set `compression` to `gzip`",
      "Files with `.gz` extension will be decompressed automatically",
      "Set `start_at: beginning`"
    ],
    "starterYaml": "receivers:\n  filelog:\n    include: [/var/log/app.log.gz]\n    start_at: beginning\n\nservice:\n  pipelines:\n    logs:\n      receivers: [filelog]\n      exporters: [file]\n",
    "solutionReceivers": {
      "filelog": {
        "include": [
          "/var/log/app.log.gz"
        ],
        "start_at": "beginning",
        "compression": "gzip"
      }
    }
  },
  {
    "id": "level-58",
    "title": "Header Metadata",
    "description": "Some log files have header lines with metadata before the data begins. Configure the `filelog` receiver with `header.pattern` to recognize header lines starting with `#` and parse them.",
    "difficulty": "hard",
    "category": "receiver-config",
    "basePoints": 350,
    "inputLogs": [
      "# hostname: web-01",
      "# datacenter: us-east-1",
      "INFO Server started on port 8080",
      "ERROR Connection timeout",
      "WARN Disk usage at 85%"
    ],
    "expectedBodies": [
      "INFO Server started on port 8080",
      "ERROR Connection timeout",
      "WARN Disk usage at 85%"
    ],
    "requiredProcessors": [],
    "hints": [
      "The `filelog.allowHeaderMetadataParsing` feature gate must be enabled",
      "Set `header.pattern` to match lines starting with `#`: `^#.*$`",
      "Add `header.metadata_operators` with a `regex_parser`",
      "Pattern for header values: `^# (?P<key>\\w+): (?P<value>.*)$`",
      "Header metadata attributes are added to every log line from the file"
    ],
    "starterYaml": "receivers:\n  filelog:\n    include: [/var/log/app.log]\n    start_at: beginning\n    header:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [filelog]\n      exporters: [file]\n",
    "solutionReceivers": {
      "filelog": {
        "include": [
          "/var/log/app.log"
        ],
        "start_at": "beginning",
        "header": {
          "pattern": "^#.*$",
          "metadata_operators": [
            {
              "type": "regex_parser",
              "regex": "^# (?P<key>\\w+): (?P<value>.*)$",
              "parse_from": "body",
              "parse_to": "attributes"
            }
          ]
        }
      }
    }
  },
  {
    "id": "level-59",
    "title": "Google Cloud Logging",
    "description": "Export logs to Google Cloud Logging. Configure a **googlecloud** exporter with the `project_id` set to `my-gcp-project`.",
    "difficulty": "medium",
    "category": "exporter-config",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"Log to export to GCP\",\"attributes\":{\"level\":\"info\",\"service\":\"api\"}}",
      "{\"body\":\"Another GCP log\",\"attributes\":{\"level\":\"error\",\"error_code\":\"E500\"}}"
    ],
    "expectedBodies": [
      "Log to export to GCP",
      "Another GCP log"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add an `exporters` section with a `googlecloud` exporter",
      "Set `project_id` to `my-gcp-project`",
      "The googlecloud exporter sends logs to Google Cloud Logging",
      "Wire it into `service.pipelines.logs.exporters`"
    ],
    "starterYaml": "exporters:\n  googlecloud:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [filelog]\n      exporters: [googlecloud]\n",
    "solutionExporters": {
      "googlecloud": {
        "project_id": "my-gcp-project"
      }
    }
  },
  {
    "id": "level-60",
    "title": "Azure Monitor",
    "description": "Export logs to Azure Monitor. Configure an **azuremonitor** exporter with an instrumentation key for authentication.",
    "difficulty": "medium",
    "category": "exporter-config",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"Log to export to Azure\",\"attributes\":{\"level\":\"info\",\"service\":\"api\"}}",
      "{\"body\":\"Azure export test\",\"attributes\":{\"level\":\"warn\",\"message\":\"performance degredation\"}}"
    ],
    "expectedBodies": [
      "Log to export to Azure",
      "Azure export test"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add an `exporters` section with an `azuremonitor` exporter",
      "Set `instrumentation_key` to `abc-123-def-456`",
      "The azuremonitor exporter sends logs to Azure Monitor",
      "Wire it into `service.pipelines.logs.exporters`"
    ],
    "starterYaml": "exporters:\n  azuremonitor:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [filelog]\n      exporters: [azuremonitor]\n",
    "solutionExporters": {
      "azuremonitor": {
        "instrumentation_key": "abc-123-def-456"
      }
    }
  },
  {
    "id": "level-61",
    "title": "Kafka Send Logs",
    "description": "Ship logs to Apache Kafka. Configure a **kafka** exporter that sends logs to `kafka-broker:9092` on the `logs-topic` topic using `otlp_proto` encoding.",
    "difficulty": "medium",
    "category": "exporter-config",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"User login event\",\"attributes\":{\"level\":\"info\",\"user_id\":42}}",
      "{\"body\":\"Order placed\",\"attributes\":{\"level\":\"info\",\"order_id\":\"ORD-12345\",\"amount\":99.95}}",
      "{\"body\":\"Payment timeout\",\"attributes\":{\"level\":\"error\",\"error_code\":\"TIMEOUT\"}}"
    ],
    "expectedBodies": [
      "User login event",
      "Order placed",
      "Payment timeout"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add an `exporters` section with a `kafka` exporter",
      "Set `brokers` to a list containing `kafka-broker:9092`",
      "Set `topic` to `logs-topic`",
      "Set `encoding` to `otlp_proto`",
      "Wire it into `service.pipelines.logs.exporters`"
    ],
    "starterYaml": "exporters:\n  kafka:\n    brokers: []\n    topic:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [filelog]\n      exporters: [kafka]\n",
    "solutionExporters": {
      "kafka": {
        "brokers": [
          "kafka-broker:9092"
        ],
        "topic": "logs-topic",
        "encoding": "otlp_proto"
      }
    }
  },
  {
    "id": "level-62",
    "title": "Kafka Log Partition",
    "description": "Configure a **kafka** exporter with custom partitioning. Set `partition_logs_by_resource_attributes` to partition by `service.name` and use a `hash` partitioner for balanced distribution.",
    "difficulty": "hard",
    "category": "exporter-config",
    "basePoints": 300,
    "inputLogs": [
      "{\"body\":\"API request started\",\"attributes\":{\"level\":\"info\",\"service.name\":\"api-gateway\",\"method\":\"GET\"}}",
      "{\"body\":\"Auth check passed\",\"attributes\":{\"level\":\"info\",\"service.name\":\"auth-service\",\"user\":\"admin\"}}",
      "{\"body\":\"DB query executed\",\"attributes\":{\"level\":\"info\",\"service.name\":\"db-layer\",\"query\":\"SELECT *\"}}",
      "{\"body\":\"Cache miss\",\"attributes\":{\"level\":\"warn\",\"service.name\":\"api-gateway\",\"cache_key\":\"users:42\"}}"
    ],
    "expectedBodies": [
      "API request started",
      "Auth check passed",
      "DB query executed",
      "Cache miss"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add a `kafka` exporter with `brokers` and `topic`",
      "Set `partition_logs_by_resource_attributes` to a resource attribute like `service.name`",
      "Configure `partitioner` to `hash` for balanced distribution",
      "Wire it into `service.pipelines.logs.exporters`"
    ],
    "starterYaml": "exporters:\n  kafka:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [filelog]\n      exporters: [kafka]\n",
    "solutionExporters": {
      "kafka": {
        "brokers": [
          "kafka-broker:9092"
        ],
        "topic": "logs-topic",
        "encoding": "otlp_proto",
        "partition_logs_by_resource_attributes": [
          "service.name"
        ],
        "partitioner": "hash"
      }
    }
  },
  {
    "id": "level-63",
    "title": "Splunk HEC Basic",
    "description": "Export logs to Splunk via HTTP Event Collector. Configure a **splunk_hec** exporter with token `abc123-token`, endpoint `https://splunk-instance:8088`, and sourcetype `otel_logs`.",
    "difficulty": "medium",
    "category": "exporter-config",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"App started successfully\",\"attributes\":{\"level\":\"info\",\"env\":\"production\"}}",
      "{\"body\":\"User session created\",\"attributes\":{\"level\":\"info\",\"session_id\":\"sess_001\"}}",
      "{\"body\":\"Disk space warning\",\"attributes\":{\"level\":\"warn\",\"disk_usage_pct\":85}}"
    ],
    "expectedBodies": [
      "App started successfully",
      "User session created",
      "Disk space warning"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add an `exporters` section with a `splunk_hec` exporter",
      "Set `token` to `abc123-token`",
      "Set `endpoint` to the Splunk HEC URL",
      "Set `sourcetype` to `otel_logs`",
      "Wire it into `service.pipelines.logs.exporters`"
    ],
    "starterYaml": "exporters:\n  splunk_hec:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [filelog]\n      exporters: [splunk_hec]\n",
    "solutionExporters": {
      "splunk_hec": {
        "token": "abc123-token",
        "endpoint": "https://splunk-instance:8088",
        "sourcetype": "otel_logs"
      }
    }
  },
  {
    "id": "level-64",
    "title": "Splunk HEC Routing",
    "description": "Route logs to different Splunk indices based on attributes. Configure **splunk_hec** with `otel_attrs_to_hec_metadata` to map `environment` attribute to the Splunk index field, and set a default `index` of `main`.",
    "difficulty": "hard",
    "category": "exporter-config",
    "basePoints": 300,
    "inputLogs": [
      "{\"body\":\"Deploy started\",\"attributes\":{\"level\":\"info\",\"environment\":\"production\",\"service\":\"api\"}}",
      "{\"body\":\"Debug metric collected\",\"attributes\":{\"level\":\"debug\",\"environment\":\"staging\",\"service\":\"api\"}}",
      "{\"body\":\"Error in payment flow\",\"attributes\":{\"level\":\"error\",\"environment\":\"production\",\"error_code\":\"E402\"}}"
    ],
    "expectedBodies": [
      "Deploy started",
      "Debug metric collected",
      "Error in payment flow"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add a `splunk_hec` exporter with `token`, `endpoint`, and `sourcetype`",
      "Add `otel_attrs_to_hec_metadata` and list `environment` as a key",
      "Set a default `index` for logs without mapped attributes",
      "Wire it into `service.pipelines.logs.exporters`"
    ],
    "starterYaml": "exporters:\n  splunk_hec:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [filelog]\n      exporters: [splunk_hec]\n",
    "solutionExporters": {
      "splunk_hec": {
        "token": "abc123-token",
        "endpoint": "https://splunk-instance:8088",
        "sourcetype": "otel_logs",
        "index": "main",
        "otel_attrs_to_hec_metadata": [
          "environment"
        ]
      }
    }
  },
  {
    "id": "level-65",
    "title": "Elasticsearch Logs",
    "description": "Export logs to Elasticsearch. Configure an **elasticsearch** exporter with endpoint `https://es-cluster:9200` and API key authentication (`api_key: base64encodedkey==`).",
    "difficulty": "medium",
    "category": "exporter-config",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"Index created\",\"attributes\":{\"level\":\"info\",\"index\":\"users\"}}",
      "{\"body\":\"Search query executed\",\"attributes\":{\"level\":\"info\",\"took_ms\":15}}",
      "{\"body\":\"Shard allocation failed\",\"attributes\":{\"level\":\"error\",\"shard_id\":3}}"
    ],
    "expectedBodies": [
      "Index created",
      "Search query executed",
      "Shard allocation failed"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add an `exporters` section with an `elasticsearch` exporter",
      "Set `endpoint` to the Elasticsearch cluster URL",
      "Set `api_key` for authentication",
      "Wire it into `service.pipelines.logs.exporters`"
    ],
    "starterYaml": "exporters:\n  elasticsearch:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [filelog]\n      exporters: [elasticsearch]\n",
    "solutionExporters": {
      "elasticsearch": {
        "endpoint": "https://es-cluster:9200",
        "api_key": "base64encodedkey=="
      }
    }
  },
  {
    "id": "level-66",
    "title": "Bodymap Mode",
    "description": "Configure an **elasticsearch** exporter using `bodymap` mapping mode for full control over the Elasticsearch document. Set `mapping.mode` to `bodymap` so the log body becomes the document source.",
    "difficulty": "hard",
    "category": "exporter-config",
    "basePoints": 300,
    "inputLogs": [
      "{\"body\":\"{\\\"message\\\":\\\"user signup\\\",\\\"event_type\\\":\\\"auth\\\"}\",\"attributes\":{\"level\":\"info\"}}",
      "{\"body\":\"{\\\"message\\\":\\\"payment processed\\\",\\\"amount\\\":49.99}\",\"attributes\":{\"level\":\"info\"}}",
      "{\"body\":\"Plain text log entry\",\"attributes\":{\"level\":\"warn\"}}"
    ],
    "expectedBodies": [
      "{\"message\":\"user signup\",\"event_type\":\"auth\"}",
      "{\"message\":\"payment processed\",\"amount\":49.99}",
      "Plain text log entry"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add an `elasticsearch` exporter with `endpoint` and `api_key`",
      "Add a `mapping` section and set `mode` to `bodymap`",
      "Wire it into `service.pipelines.logs.exporters`"
    ],
    "starterYaml": "exporters:\n  elasticsearch:\n    mapping:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [filelog]\n      exporters: [elasticsearch]\n",
    "solutionExporters": {
      "elasticsearch": {
        "endpoint": "https://es-cluster:9200",
        "api_key": "base64encodedkey==",
        "mapping": {
          "mode": "bodymap"
        }
      }
    }
  },
  {
    "id": "level-67",
    "title": "Kafka Consume Logs",
    "description": "Consume logs from Apache Kafka. Configure a **kafka** receiver that reads from `kafka-broker:9092` on the `logs-topic` topic using `raw` encoding for log data.",
    "difficulty": "medium",
    "category": "receiver-config",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"Consumed log entry 1\",\"attributes\":{\"level\":\"info\"}}",
      "{\"body\":\"Consumed log entry 2\",\"attributes\":{\"level\":\"warn\"}}",
      "{\"body\":\"Consumed log entry 3\",\"attributes\":{\"level\":\"error\"}}"
    ],
    "expectedBodies": [
      "Consumed log entry 1",
      "Consumed log entry 2",
      "Consumed log entry 3"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add a `receivers` section with a `kafka` receiver",
      "Set `brokers` to a list containing `kafka-broker:9092`",
      "Set `topic` to `logs-topic`",
      "Set `encoding` to `raw` for raw log consumption",
      "Wire it into `service.pipelines.logs.receivers`"
    ],
    "starterYaml": "receivers:\n  kafka:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [kafka]\n      exporters: [file]\n",
    "solutionReceivers": {
      "kafka": {
        "brokers": [
          "kafka-broker:9092"
        ],
        "topic": "logs-topic",
        "encoding": "raw"
      }
    }
  },
  {
    "id": "level-68",
    "title": "Kafka Regex Topics",
    "description": "Consume from multiple Kafka topics using regex patterns. Configure a **kafka** receiver with a `topic_regex` pattern to match all topics starting with `app-logs-` and exclude topics matching `app-logs-ignore-`.",
    "difficulty": "hard",
    "category": "receiver-config",
    "basePoints": 300,
    "inputLogs": [
      "{\"body\":\"Log from app-logs-web\",\"attributes\":{\"level\":\"info\"}}",
      "{\"body\":\"Log from app-logs-worker\",\"attributes\":{\"level\":\"warn\"}}",
      "{\"body\":\"Log from app-logs-db\",\"attributes\":{\"level\":\"error\"}}"
    ],
    "expectedBodies": [
      "Log from app-logs-web",
      "Log from app-logs-worker",
      "Log from app-logs-db"
    ],
    "requiredProcessors": [],
    "hints": [
      "Use `topic_regex` instead of a single `topic` for pattern matching",
      "Set `topic_regex` to `app-logs-.*` to match all app log topics",
      "Use `exclude_topics` to filter out specific matches",
      "Wire it into `service.pipelines.logs.receivers`"
    ],
    "starterYaml": "receivers:\n  kafka:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [kafka]\n      exporters: [file]\n",
    "solutionReceivers": {
      "kafka": {
        "brokers": [
          "kafka-broker:9092"
        ],
        "topic_regex": "app-logs-.*",
        "exclude_topics": [
          "app-logs-ignore-.*"
        ],
        "encoding": "raw"
      }
    }
  },
  {
    "id": "level-69",
    "title": "Env Detector",
    "description": "Automatically detect resource attributes from environment variables. Configure a **resourcedetection** processor with the `env` detector to read `OTEL_RESOURCE_ATTRIBUTES` from the environment.",
    "difficulty": "easy",
    "category": "enrichment",
    "basePoints": 100,
    "inputLogs": [
      "{\"body\":\"Service starting\",\"attributes\":{\"level\":\"info\"}}",
      "{\"body\":\"Health check passed\",\"attributes\":{\"level\":\"info\"}}",
      "{\"body\":\"Shutdown initiated\",\"attributes\":{\"level\":\"warn\"}}"
    ],
    "expectedBodies": [
      "Service starting",
      "Health check passed",
      "Shutdown initiated"
    ],
    "requiredProcessors": [
      "resourcedetection"
    ],
    "hints": [
      "Use the **resourcedetection** processor",
      "Set `detectors` to a list containing `env`",
      "The `env` detector reads `OTEL_RESOURCE_ATTRIBUTES` automatically",
      "Wire it into `service.pipelines.logs.processors`"
    ],
    "starterYaml": "processors:\n  resourcedetection:\n    detectors: []\n\nservice:\n  pipelines:\n    logs:\n      processors: [resourcedetection]\n",
    "solutionProcessors": {
      "resourcedetection": {
        "detectors": [
          "env"
        ]
      }
    }
  },
  {
    "id": "level-70",
    "title": "Cloud Detection Chain",
    "description": "Chain multiple resource detectors with fallback. Configure a **resourcedetection** processor with detectors `env`, `gcp`, and `ec2` in order, setting `override: false` so earlier detectors take priority.",
    "difficulty": "medium",
    "category": "enrichment",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"Starting in cloud environment\",\"attributes\":{\"level\":\"info\"}}",
      "{\"body\":\"Fetching config from cloud\",\"attributes\":{\"level\":\"info\"}}",
      "{\"body\":\"Cloud metadata refreshed\",\"attributes\":{\"level\":\"info\"}}"
    ],
    "expectedBodies": [
      "Starting in cloud environment",
      "Fetching config from cloud",
      "Cloud metadata refreshed"
    ],
    "requiredProcessors": [
      "resourcedetection"
    ],
    "hints": [
      "Use the **resourcedetection** processor with multiple detectors",
      "List detectors in priority order: `env`, `gcp`, `ec2`",
      "Set `override: false` so earlier detectors have priority",
      "Wire it into `service.pipelines.logs.processors`"
    ],
    "starterYaml": "processors:\n  resourcedetection:\n    detectors: []\n\nservice:\n  pipelines:\n    logs:\n      processors: [resourcedetection]\n",
    "solutionProcessors": {
      "resourcedetection": {
        "detectors": [
          "env",
          "gcp",
          "ec2"
        ],
        "override": false
      }
    }
  },
  {
    "id": "level-71",
    "title": "Group by Service",
    "description": "Group log records by `service.name` into separate resource scopes. Configure a **groupbyattrs** processor with `keys: [service.name]` to split logs into groups by service.",
    "difficulty": "medium",
    "category": "transformation",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"Request received\",\"attributes\":{\"level\":\"info\",\"service.name\":\"api\",\"endpoint\":\"/users\"}}",
      "{\"body\":\"Query executed\",\"attributes\":{\"level\":\"info\",\"service.name\":\"db\",\"query\":\"SELECT\"}}",
      "{\"body\":\"Response sent\",\"attributes\":{\"level\":\"info\",\"service.name\":\"api\",\"status\":200}}"
    ],
    "expectedBodies": [
      "Request received",
      "Query executed",
      "Response sent"
    ],
    "requiredProcessors": [
      "groupbyattrs"
    ],
    "hints": [
      "Use the **groupbyattrs** processor",
      "Set `keys` to include `service.name`",
      "This groups log records into separate resources by the specified attributes",
      "Wire it into `service.pipelines.logs.processors`"
    ],
    "starterYaml": "processors:\n  groupbyattrs:\n    keys: []\n\nservice:\n  pipelines:\n    logs:\n      processors: [groupbyattrs]\n",
    "solutionProcessors": {
      "groupbyattrs": {
        "keys": [
          "service.name"
        ]
      }
    }
  },
  {
    "id": "level-72",
    "title": "Compaction Mode",
    "description": "Merge duplicate Resource and Scope combinations. Configure a **groupbyattrs** processor with an empty `keys` list to trigger compaction mode, which merges log records sharing the same Resource+Scope into a single scope.",
    "difficulty": "hard",
    "category": "transformation",
    "basePoints": 300,
    "inputLogs": [
      "{\"body\":\"Log entry A\",\"attributes\":{\"level\":\"info\",\"service.name\":\"api\"}}",
      "{\"body\":\"Log entry B\",\"attributes\":{\"level\":\"info\",\"service.name\":\"api\"}}",
      "{\"body\":\"Log entry C\",\"attributes\":{\"level\":\"warn\",\"service.name\":\"db\"}}"
    ],
    "expectedBodies": [
      "Log entry A",
      "Log entry B",
      "Log entry C"
    ],
    "requiredProcessors": [
      "groupbyattrs"
    ],
    "hints": [
      "Use the **groupbyattrs** processor",
      "Leave `keys` as an empty list to enable compaction mode",
      "Compaction mode merges duplicate Resource+Scope combinations",
      "Wire it into `service.pipelines.logs.processors`"
    ],
    "starterYaml": "processors:\n  groupbyattrs:\n    keys: []\n\nservice:\n  pipelines:\n    logs:\n      processors: [groupbyattrs]\n",
    "solutionProcessors": {
      "groupbyattrs": {
        "keys": []
      }
    }
  },
  {
    "id": "level-73",
    "title": "Sample Logs by Percentage",
    "description": "Reduce log volume by sampling. Configure a **probabilistic_sampler** processor to sample 25% of all log records using `sampling_percentage: 25`.",
    "difficulty": "medium",
    "category": "performance",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"Keep or drop? Entry 1\",\"attributes\":{\"level\":\"info\"}}",
      "{\"body\":\"Keep or drop? Entry 2\",\"attributes\":{\"level\":\"info\"}}",
      "{\"body\":\"Keep or drop? Entry 3\",\"attributes\":{\"level\":\"info\"}}",
      "{\"body\":\"Keep or drop? Entry 4\",\"attributes\":{\"level\":\"info\"}}"
    ],
    "expectedBodies": [
      "Keep or drop? Entry 1",
      "Keep or drop? Entry 2",
      "Keep or drop? Entry 3",
      "Keep or drop? Entry 4"
    ],
    "requiredProcessors": [
      "probabilistic_sampler"
    ],
    "hints": [
      "Use the **probabilistic_sampler** processor",
      "Set `sampling_percentage` to 25 for ~25% sampling rate",
      "The sampler uses a hash-based algorithm for consistent decisions",
      "Wire it into `service.pipelines.logs.processors`"
    ],
    "starterYaml": "processors:\n  probabilistic_sampler:\n\nservice:\n  pipelines:\n    logs:\n      processors: [probabilistic_sampler]\n",
    "solutionProcessors": {
      "probabilistic_sampler": {
        "sampling_percentage": 25
      }
    }
  },
  {
    "id": "level-74",
    "title": "Priority Sampling",
    "description": "Keep critical logs at full fidelity while sampling the rest. Configure a **probabilistic_sampler** processor with `sampling_percentage: 10` that also checks for `sampling_priority` attribute — logs with `sampling_priority >= 5` should always be kept.",
    "difficulty": "hard",
    "category": "performance",
    "basePoints": 300,
    "inputLogs": [
      "{\"body\":\"Routine health check\",\"attributes\":{\"level\":\"info\",\"sampling_priority\":1}}",
      "{\"body\":\"Critical payment failure\",\"attributes\":{\"level\":\"error\",\"sampling_priority\":10,\"error_code\":\"E500\"}}",
      "{\"body\":\"Debug trace log\",\"attributes\":{\"level\":\"debug\",\"sampling_priority\":2}}",
      "{\"body\":\"Security alert\",\"attributes\":{\"level\":\"warn\",\"sampling_priority\":8,\"alert\":\"unauthorized_access\"}}"
    ],
    "expectedBodies": [
      "Routine health check",
      "Critical payment failure",
      "Debug trace log",
      "Security alert"
    ],
    "requiredProcessors": [
      "probabilistic_sampler"
    ],
    "hints": [
      "Use the **probabilistic_sampler** processor",
      "Set `sampling_percentage` to 10 for base sampling rate",
      "Use `sampling_priority` to keep high-value logs regardless of percentage",
      "Set a threshold value for `sampling_priority` to bypass sampling",
      "Wire it into `service.pipelines.logs.processors`"
    ],
    "starterYaml": "processors:\n  probabilistic_sampler:\n\nservice:\n  pipelines:\n    logs:\n      processors: [probabilistic_sampler]\n",
    "solutionProcessors": {
      "probabilistic_sampler": {
        "sampling_percentage": 10,
        "sampling_priority": 5
      }
    }
  },
  {
    "id": "level-75",
    "title": "CPU Usage",
    "description": "Collect CPU metrics from the host machine. Configure a **hostmetrics** receiver with a `cpu` scraper to collect CPU utilization metrics.",
    "difficulty": "easy",
    "category": "metrics-receiver",
    "basePoints": 120,
    "inputLogs": [
      "{\"body\":\"cpu.utilization 0.45\",\"attributes\":{\"metric\":\"cpu\",\"state\":\"user\",\"host\":\"localhost\"}}",
      "{\"body\":\"cpu.utilization 0.30\",\"attributes\":{\"metric\":\"cpu\",\"state\":\"system\",\"host\":\"localhost\"}}",
      "{\"body\":\"cpu.utilization 0.25\",\"attributes\":{\"metric\":\"cpu\",\"state\":\"idle\",\"host\":\"localhost\"}}"
    ],
    "expectedBodies": [
      "cpu.utilization 0.45",
      "cpu.utilization 0.30",
      "cpu.utilization 0.25"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add a `receivers` section with a `hostmetrics` receiver",
      "Set `collection_interval` to `30s` (or leave default)",
      "Add a `scrapers` section with `cpu` enabled",
      "Wire into `service.pipelines.logs.receivers`"
    ],
    "starterYaml": "receivers:\n  hostmetrics:\n    scrapers:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [hostmetrics]\n      exporters: [file]\n",
    "solutionReceivers": {
      "hostmetrics": {
        "scrapers": {
          "cpu": null
        }
      }
    }
  },
  {
    "id": "level-76",
    "title": "Disk Metrics",
    "description": "Collect disk and filesystem metrics. Configure a **hostmetrics** receiver with `disk` and `filesystem` scrapers to monitor disk I/O and usage.",
    "difficulty": "easy",
    "category": "metrics-receiver",
    "basePoints": 120,
    "inputLogs": [
      "{\"body\":\"disk.io 1024\",\"attributes\":{\"metric\":\"disk\",\"device\":\"sda\",\"direction\":\"write\"}}",
      "{\"body\":\"disk.usage 50000\",\"attributes\":{\"metric\":\"filesystem\",\"device\":\"sda1\",\"state\":\"used\"}}",
      "{\"body\":\"disk.usage 100000\",\"attributes\":{\"metric\":\"filesystem\",\"device\":\"sda1\",\"state\":\"free\"}}"
    ],
    "expectedBodies": [
      "disk.io 1024",
      "disk.usage 50000",
      "disk.usage 100000"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add a `hostmetrics` receiver with a `scrapers` section",
      "Enable both `disk` and `filesystem` scrapers",
      "Wire into `service.pipelines.logs.receivers`"
    ],
    "starterYaml": "receivers:\n  hostmetrics:\n    scrapers:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [hostmetrics]\n      exporters: [file]\n",
    "solutionReceivers": {
      "hostmetrics": {
        "scrapers": {
          "disk": null,
          "filesystem": null
        }
      }
    }
  },
  {
    "id": "level-77",
    "title": "Network Metrics",
    "description": "Collect network metrics with device filtering. Configure a **hostmetrics** receiver with a `network` scraper that only monitors the `eth0` interface.",
    "difficulty": "medium",
    "category": "metrics-receiver",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"network.io 500\",\"attributes\":{\"metric\":\"network\",\"device\":\"eth0\",\"direction\":\"transmit\"}}",
      "{\"body\":\"network.io 300\",\"attributes\":{\"metric\":\"network\",\"device\":\"eth0\",\"direction\":\"receive\"}}",
      "{\"body\":\"network.errors 0\",\"attributes\":{\"metric\":\"network\",\"device\":\"eth0\"}}"
    ],
    "expectedBodies": [
      "network.io 500",
      "network.io 300",
      "network.errors 0"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add a `hostmetrics` receiver with a `network` scraper",
      "Use `include` to filter by device name `eth0`",
      "Set `include.device` to a list containing `eth0`",
      "Wire into `service.pipelines.logs.receivers`"
    ],
    "starterYaml": "receivers:\n  hostmetrics:\n    scrapers:\n      network:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [hostmetrics]\n      exporters: [file]\n",
    "solutionReceivers": {
      "hostmetrics": {
        "scrapers": {
          "network": {
            "include": {
              "devices": [
                "eth0"
              ]
            }
          }
        }
      }
    }
  },
  {
    "id": "level-78",
    "title": "Custom Collection",
    "description": "Optimize metric collection frequency. Configure a **hostmetrics** receiver with a `collection_interval` of `10s` and enable `cpu`, `memory`, and `disk` scrapers.",
    "difficulty": "medium",
    "category": "metrics-receiver",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"cpu 0.35 memory 0.60 disk 0.20\",\"attributes\":{\"host\":\"localhost\",\"interval\":\"10s\"}}",
      "{\"body\":\"cpu 0.55 memory 0.62 disk 0.21\",\"attributes\":{\"host\":\"localhost\",\"interval\":\"10s\"}}",
      "{\"body\":\"cpu 0.40 memory 0.58 disk 0.19\",\"attributes\":{\"host\":\"localhost\",\"interval\":\"10s\"}}"
    ],
    "expectedBodies": [
      "cpu 0.35 memory 0.60 disk 0.20",
      "cpu 0.55 memory 0.62 disk 0.21",
      "cpu 0.40 memory 0.58 disk 0.19"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add a `hostmetrics` receiver with `collection_interval: 10s`",
      "Enable `cpu`, `memory`, and `disk` in the `scrapers` section",
      "Wire into `service.pipelines.logs.receivers`"
    ],
    "starterYaml": "receivers:\n  hostmetrics:\n    collection_interval:\n    scrapers:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [hostmetrics]\n      exporters: [file]\n",
    "solutionReceivers": {
      "hostmetrics": {
        "collection_interval": "10s",
        "scrapers": {
          "cpu": null,
          "memory": null,
          "disk": null
        }
      }
    }
  },
  {
    "id": "level-79",
    "title": "Scrape Endpoint",
    "description": "Scrape metrics from a Prometheus endpoint. Configure a **prometheus** receiver to scrape `http://localhost:9090/metrics`.",
    "difficulty": "easy",
    "category": "metrics-receiver",
    "basePoints": 120,
    "inputLogs": [
      "{\"body\":\"http_requests_total 100\",\"attributes\":{\"job\":\"collector\",\"instance\":\"localhost:9090\"}}",
      "{\"body\":\"http_requests_duration_ms 42\",\"attributes\":{\"job\":\"collector\",\"instance\":\"localhost:9090\"}}",
      "{\"body\":\"up 1\",\"attributes\":{\"job\":\"collector\",\"instance\":\"localhost:9090\"}}"
    ],
    "expectedBodies": [
      "http_requests_total 100",
      "http_requests_duration_ms 42",
      "up 1"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add a `receivers` section with a `prometheus` receiver",
      "Add a `config` section with `scrape_configs`",
      "Set `job_name` to something descriptive",
      "Set `static_configs.targets` to the endpoint",
      "Wire into `service.pipelines.logs.receivers`"
    ],
    "starterYaml": "receivers:\n  prometheus:\n    config:\n      scrape_configs:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [prometheus]\n      exporters: [file]\n",
    "solutionReceivers": {
      "prometheus": {
        "config": {
          "scrape_configs": [
            {
              "job_name": "collector",
              "static_configs": [
                {
                  "targets": [
                    "localhost:9090"
                  ]
                }
              ]
            }
          ]
        }
      }
    }
  },
  {
    "id": "level-80",
    "title": "Multiple Targets",
    "description": "Scrape metrics from two different endpoints. Configure a **prometheus** receiver with two scrape jobs: one for the app on `:8080` and one for the collector on `:9090`.",
    "difficulty": "medium",
    "category": "metrics-receiver",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"app_requests 50\",\"attributes\":{\"job\":\"app\",\"instance\":\"app:8080\"}}",
      "{\"body\":\"collector_up 1\",\"attributes\":{\"job\":\"otel-collector\",\"instance\":\"collector:9090\"}}",
      "{\"body\":\"app_errors 2\",\"attributes\":{\"job\":\"app\",\"instance\":\"app:8080\"}}"
    ],
    "expectedBodies": [
      "app_requests 50",
      "collector_up 1",
      "app_errors 2"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add a `prometheus` receiver with `scrape_configs` containing two jobs",
      "Each job needs a unique `job_name` and `static_configs` with targets",
      "First job: `app` on `app:8080`",
      "Second job: `otel-collector` on `collector:9090`",
      "Wire into `service.pipelines.logs.receivers`"
    ],
    "starterYaml": "receivers:\n  prometheus:\n    config:\n      scrape_configs:\n        - job_name: app\n          static_configs:\n            - targets: []\n        - job_name: otel-collector\n          static_configs:\n            - targets: []\n\nservice:\n  pipelines:\n    logs:\n      receivers: [prometheus]\n      exporters: [file]\n",
    "solutionReceivers": {
      "prometheus": {
        "config": {
          "scrape_configs": [
            {
              "job_name": "app",
              "static_configs": [
                {
                  "targets": [
                    "app:8080"
                  ]
                }
              ]
            },
            {
              "job_name": "otel-collector",
              "static_configs": [
                {
                  "targets": [
                    "collector:9090"
                  ]
                }
              ]
            }
          ]
        }
      }
    }
  },
  {
    "id": "level-81",
    "title": "TLS Scrape",
    "description": "Scrape a Prometheus endpoint secured with TLS. Configure a **prometheus** receiver with `tls_config` using `insecure_skip_verify: true` to scrape `https://internal-metrics:9090/metrics`.",
    "difficulty": "hard",
    "category": "metrics-receiver",
    "basePoints": 300,
    "inputLogs": [
      "{\"body\":\"tls_metrics_total 200\",\"attributes\":{\"job\":\"secure-app\",\"instance\":\"internal-metrics:9090\"}}",
      "{\"body\":\"tls_scrape_duration 1.5\",\"attributes\":{\"job\":\"secure-app\",\"instance\":\"internal-metrics:9090\"}}"
    ],
    "expectedBodies": [
      "tls_metrics_total 200",
      "tls_scrape_duration 1.5"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add a `prometheus` receiver with a scrape job targeting the HTTPS endpoint",
      "Add `scheme: https` to the scrape config",
      "Add `tls_config` with `insecure_skip_verify: true`",
      "Use `job_name: secure-app`",
      "Wire into `service.pipelines.logs.receivers`"
    ],
    "starterYaml": "receivers:\n  prometheus:\n    config:\n      scrape_configs:\n        - job_name: secure-app\n          static_configs:\n            - targets: []\n\nservice:\n  pipelines:\n    logs:\n      receivers: [prometheus]\n      exporters: [file]\n",
    "solutionReceivers": {
      "prometheus": {
        "config": {
          "scrape_configs": [
            {
              "job_name": "secure-app",
              "scheme": "https",
              "tls_config": {
                "insecure_skip_verify": true
              },
              "static_configs": [
                {
                  "targets": [
                    "internal-metrics:9090"
                  ]
                }
              ]
            }
          ]
        }
      }
    }
  },
  {
    "id": "level-82",
    "title": "MySQL Metrics",
    "description": "Collect metrics from a MySQL database. Configure a **mysql** receiver with endpoint `localhost:3306` and username `otel` to gather database performance metrics.",
    "difficulty": "medium",
    "category": "metrics-receiver",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"mysql.queries 1500\",\"attributes\":{\"metric\":\"mysql\",\"database\":\"app_db\",\"user\":\"otel\"}}",
      "{\"body\":\"mysql.connections 25\",\"attributes\":{\"metric\":\"mysql\",\"state\":\"active\"}}",
      "{\"body\":\"mysql.innodb.row_locks 0\",\"attributes\":{\"metric\":\"mysql\",\"database\":\"app_db\"}}"
    ],
    "expectedBodies": [
      "mysql.queries 1500",
      "mysql.connections 25",
      "mysql.innodb.row_locks 0"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add a `receivers` section with a `mysql` receiver",
      "Set `endpoint` to `localhost:3306`",
      "Set `username` to `otel`",
      "Set `password` to an empty string or placeholder",
      "Wire into `service.pipelines.logs.receivers`"
    ],
    "starterYaml": "receivers:\n  mysql:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [mysql]\n      exporters: [file]\n",
    "solutionReceivers": {
      "mysql": {
        "endpoint": "localhost:3306",
        "username": "otel",
        "password": ""
      }
    }
  },
  {
    "id": "level-83",
    "title": "Redis Metrics",
    "description": "Collect metrics from a Redis instance. Configure a **redis** receiver with endpoint `localhost:6379` to gather Redis performance and memory metrics.",
    "difficulty": "medium",
    "category": "metrics-receiver",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"redis.memory.used 2000000\",\"attributes\":{\"metric\":\"redis\",\"host\":\"localhost:6379\"}}",
      "{\"body\":\"redis.cpu.sys 12.5\",\"attributes\":{\"metric\":\"redis\",\"host\":\"localhost:6379\"}}",
      "{\"body\":\"redis.keyspace.hits 5000\",\"attributes\":{\"metric\":\"redis\",\"host\":\"localhost:6379\"}}"
    ],
    "expectedBodies": [
      "redis.memory.used 2000000",
      "redis.cpu.sys 12.5",
      "redis.keyspace.hits 5000"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add a `receivers` section with a `redis` receiver",
      "Set `endpoint` to `localhost:6379`",
      "Optionally set `password` to empty string",
      "Set `collection_interval` to `10s`",
      "Wire into `service.pipelines.logs.receivers`"
    ],
    "starterYaml": "receivers:\n  redis:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [redis]\n      exporters: [file]\n",
    "solutionReceivers": {
      "redis": {
        "endpoint": "localhost:6379",
        "password": "",
        "collection_interval": "10s"
      }
    }
  },
  {
    "id": "level-84",
    "title": "HTTP Check",
    "description": "Monitor endpoint availability with HTTP checks. Configure an **httpcheck** receiver that pings `https://example.com` and `https://status.example.com` every 30 seconds.",
    "difficulty": "easy",
    "category": "metrics-receiver",
    "basePoints": 120,
    "inputLogs": [
      "{\"body\":\"httpcheck.status 1\",\"attributes\":{\"target\":\"https://example.com\",\"status\":\"up\"}}",
      "{\"body\":\"httpcheck.duration 0.3\",\"attributes\":{\"target\":\"https://example.com\"}}",
      "{\"body\":\"httpcheck.status 1\",\"attributes\":{\"target\":\"https://status.example.com\",\"status\":\"up\"}}"
    ],
    "expectedBodies": [
      "httpcheck.status 1",
      "httpcheck.duration 0.3",
      "httpcheck.status 1"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add a `receivers` section with an `httpcheck` receiver",
      "Set `targets` to a list of URLs to check",
      "Set `collection_interval` to `30s`",
      "Wire into `service.pipelines.logs.receivers`"
    ],
    "starterYaml": "receivers:\n  httpcheck:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [httpcheck]\n      exporters: [file]\n",
    "solutionReceivers": {
      "httpcheck": {
        "targets": [
          "https://example.com",
          "https://status.example.com"
        ],
        "collection_interval": "30s"
      }
    }
  },
  {
    "id": "level-85",
    "title": "Kubelet Stats",
    "description": "Collect metrics from a Kubernetes kubelet. Configure a **kubeletstats** receiver that connects to `http://kubelet:10250` using `serviceAccount` authentication.",
    "difficulty": "hard",
    "category": "metrics-receiver",
    "basePoints": 300,
    "inputLogs": [
      "{\"body\":\"k8s.pod.cpu.usage 0.5\",\"attributes\":{\"metric\":\"kubelet\",\"pod\":\"nginx-abc\",\"node\":\"node1\"}}",
      "{\"body\":\"k8s.pod.memory.usage 256\",\"attributes\":{\"metric\":\"kubelet\",\"pod\":\"api-xyz\",\"node\":\"node1\"}}",
      "{\"body\":\"k8s.node.disk.usage 60\",\"attributes\":{\"metric\":\"kubelet\",\"node\":\"node1\"}}"
    ],
    "expectedBodies": [
      "k8s.pod.cpu.usage 0.5",
      "k8s.pod.memory.usage 256",
      "k8s.node.disk.usage 60"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add a `receivers` section with a `kubeletstats` receiver",
      "Set `endpoint` to the kubelet URL",
      "Set `auth_type` to `serviceAccount`",
      "Set `collection_interval` to `30s`",
      "Wire into `service.pipelines.logs.receivers`"
    ],
    "starterYaml": "receivers:\n  kubeletstats:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [kubeletstats]\n      exporters: [file]\n",
    "solutionReceivers": {
      "kubeletstats": {
        "endpoint": "http://kubelet:10250",
        "auth_type": "serviceAccount",
        "collection_interval": "30s"
      }
    }
  },
  {
    "id": "level-86",
    "title": "Filter by Name",
    "description": "Keep only CPU metrics. Configure a **filter** processor with a `metrics` section that includes metrics matching `cpu.*` and drops everything else.",
    "difficulty": "easy",
    "category": "metrics-processing",
    "basePoints": 120,
    "inputLogs": [
      "{\"body\":\"cpu.utilization 0.45\",\"attributes\":{\"metric\":\"cpu.utilization\"}}",
      "{\"body\":\"memory.usage 1000\",\"attributes\":{\"metric\":\"memory.usage\"}}",
      "{\"body\":\"cpu.time 2000\",\"attributes\":{\"metric\":\"cpu.time\"}}"
    ],
    "expectedBodies": [
      "cpu.utilization 0.45",
      "cpu.time 2000"
    ],
    "requiredProcessors": [
      "filter"
    ],
    "hints": [
      "Use the **filter** processor with a `metrics` section",
      "Set `include.match_type: regexp`",
      "Use `metric_names: [cpu.*]` to match CPU metrics",
      "Wire into `service.pipelines.logs.processors`"
    ],
    "starterYaml": "processors:\n  filter:\n    metrics:\n\nservice:\n  pipelines:\n    logs:\n      processors: [filter]\n",
    "solutionProcessors": {
      "filter": {
        "metrics": {
          "include": {
            "match_type": "regexp",
            "metric_names": [
              "cpu.*"
            ]
          }
        }
      }
    }
  },
  {
    "id": "level-87",
    "title": "Filter by Resource",
    "description": "Keep only metrics from production hosts. Configure a **filter** processor with a `metrics` section that includes metrics where the resource attribute `environment` equals `production`.",
    "difficulty": "medium",
    "category": "metrics-processing",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"cpu.utilization 0.45\",\"attributes\":{\"metric\":\"cpu\",\"environment\":\"production\"}}",
      "{\"body\":\"cpu.utilization 0.30\",\"attributes\":{\"metric\":\"cpu\",\"environment\":\"staging\"}}",
      "{\"body\":\"memory.usage 1000\",\"attributes\":{\"metric\":\"memory\",\"environment\":\"production\"}}"
    ],
    "expectedBodies": [
      "cpu.utilization 0.45",
      "memory.usage 1000"
    ],
    "requiredProcessors": [
      "filter"
    ],
    "hints": [
      "Use the **filter** processor with `metrics` section",
      "Use `include.match_type: strict`",
      "Add `resource_attributes` with key `environment` and value `production`",
      "Wire into `service.pipelines.logs.processors`"
    ],
    "starterYaml": "processors:\n  filter:\n    metrics:\n\nservice:\n  pipelines:\n    logs:\n      processors: [filter]\n",
    "solutionProcessors": {
      "filter": {
        "metrics": {
          "include": {
            "match_type": "strict",
            "resource_attributes": [
              {
                "key": "environment",
                "value": "production"
              }
            ]
          }
        }
      }
    }
  },
  {
    "id": "level-88",
    "title": "Convert to Delta",
    "description": "Convert cumulative metrics to delta metrics. Configure a **cumulativetodelta** processor to convert all incoming cumulative metrics to delta format.",
    "difficulty": "easy",
    "category": "metrics-processing",
    "basePoints": 120,
    "inputLogs": [
      "{\"body\":\"http_requests_total 100\",\"attributes\":{\"metric\":\"http_requests_total\",\"type\":\"cumulative\"}}",
      "{\"body\":\"http_requests_total 150\",\"attributes\":{\"metric\":\"http_requests_total\",\"type\":\"cumulative\"}}",
      "{\"body\":\"http_requests_total 220\",\"attributes\":{\"metric\":\"http_requests_total\",\"type\":\"cumulative\"}}"
    ],
    "expectedBodies": [
      "http_requests_total 100",
      "http_requests_total 150",
      "http_requests_total 220"
    ],
    "requiredProcessors": [
      "cumulativetodelta"
    ],
    "hints": [
      "Use the **cumulativetodelta** processor",
      "No extra config needed — it converts all cumulative metrics by default",
      "Wire into `service.pipelines.logs.processors`"
    ],
    "starterYaml": "processors:\n  cumulativetodelta:\n\nservice:\n  pipelines:\n    logs:\n      processors: [cumulativetodelta]\n",
    "solutionProcessors": {
      "cumulativetodelta": null
    }
  },
  {
    "id": "level-89",
    "title": "Selective Convert",
    "description": "Only convert specific metrics to delta. Configure a **cumulativetodelta** processor that only converts metrics matching `system.cpu.*` and leaves all other metrics untouched.",
    "difficulty": "medium",
    "category": "metrics-processing",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"system.cpu.time 5000\",\"attributes\":{\"metric\":\"system.cpu.time\",\"type\":\"cumulative\"}}",
      "{\"body\":\"system.memory.usage 10000\",\"attributes\":{\"metric\":\"system.memory.usage\",\"type\":\"cumulative\"}}",
      "{\"body\":\"system.cpu.time 5200\",\"attributes\":{\"metric\":\"system.cpu.time\",\"type\":\"cumulative\"}}"
    ],
    "expectedBodies": [
      "system.cpu.time 5000",
      "system.memory.usage 10000",
      "system.cpu.time 5200"
    ],
    "requiredProcessors": [
      "cumulativetodelta"
    ],
    "hints": [
      "Use the **cumulativetodelta** processor",
      "Add an `include` section with `metric_names`",
      "Set `match_type` to `regexp` and list the metric patterns",
      "Wire into `service.pipelines.logs.processors`"
    ],
    "starterYaml": "processors:\n  cumulativetodelta:\n\nservice:\n  pipelines:\n    logs:\n      processors: [cumulativetodelta]\n",
    "solutionProcessors": {
      "cumulativetodelta": {
        "include": {
          "match_type": "regexp",
          "metric_names": [
            "system.cpu.*"
          ]
        }
      }
    }
  },
  {
    "id": "level-90",
    "title": "Basic Rate",
    "description": "Convert delta metrics to rates. Configure a **deltatorate** processor to convert all incoming delta metrics to rate (per-second) values.",
    "difficulty": "medium",
    "category": "metrics-processing",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"network.packets 1000\",\"attributes\":{\"metric\":\"network.packets\",\"type\":\"delta\"}}",
      "{\"body\":\"network.packets 1200\",\"attributes\":{\"metric\":\"network.packets\",\"type\":\"delta\"}}",
      "{\"body\":\"network.packets 900\",\"attributes\":{\"metric\":\"network.packets\",\"type\":\"delta\"}}"
    ],
    "expectedBodies": [
      "network.packets 1000",
      "network.packets 1200",
      "network.packets 900"
    ],
    "requiredProcessors": [
      "deltatorate"
    ],
    "hints": [
      "Use the **deltatorate** processor",
      "No extra config needed for basic rate conversion",
      "Wire into `service.pipelines.logs.processors`"
    ],
    "starterYaml": "processors:\n  deltatorate:\n\nservice:\n  pipelines:\n    logs:\n      processors: [deltatorate]\n",
    "solutionProcessors": {
      "deltatorate": null
    }
  },
  {
    "id": "level-91",
    "title": "Custom Rate",
    "description": "Convert deltas to rates with a custom label. Configure a **deltatorate** processor that adds a `host` label to the output rate metrics using `addition_label: host`.",
    "difficulty": "hard",
    "category": "metrics-processing",
    "basePoints": 300,
    "inputLogs": [
      "{\"body\":\"disk.io.ops 500\",\"attributes\":{\"metric\":\"disk.io.ops\",\"type\":\"delta\",\"host\":\"server01\"}}",
      "{\"body\":\"disk.io.ops 550\",\"attributes\":{\"metric\":\"disk.io.ops\",\"type\":\"delta\",\"host\":\"server01\"}}"
    ],
    "expectedBodies": [
      "disk.io.ops 500",
      "disk.io.ops 550"
    ],
    "requiredProcessors": [
      "deltatorate"
    ],
    "hints": [
      "Use the **deltatorate** processor",
      "Set `addition_label` to `host` to copy the host attribute into the rate metric",
      "Optionally set a custom rate calculation",
      "Wire into `service.pipelines.logs.processors`"
    ],
    "starterYaml": "processors:\n  deltatorate:\n\nservice:\n  pipelines:\n    logs:\n      processors: [deltatorate]\n",
    "solutionProcessors": {
      "deltatorate": {
        "addition_label": "host"
      }
    }
  },
  {
    "id": "level-92",
    "title": "Rename Metric",
    "description": "Rename a metric using OTTL. Use the **transform** processor with a `metric_statements` context to rename `old.metric.name` to `new.metric.name`.",
    "difficulty": "easy",
    "category": "metrics-ottl",
    "basePoints": 120,
    "inputLogs": [
      "{\"body\":\"old.metric.name 42\",\"attributes\":{\"metric\":\"old.metric.name\"}}",
      "{\"body\":\"old.metric.name 15\",\"attributes\":{\"metric\":\"old.metric.name\"}}"
    ],
    "expectedBodies": [
      "old.metric.name 42",
      "old.metric.name 15"
    ],
    "requiredProcessors": [
      "transform"
    ],
    "hints": [
      "Use the **transform** processor with a `metric_statements` section",
      "Use `set(metric.name, \"new.metric.name\")` to rename",
      "Wire into `service.pipelines.logs.processors`"
    ],
    "starterYaml": "processors:\n  transform:\n    metric_statements:\n      - context: metric\n        statements:\n\nservice:\n  pipelines:\n    logs:\n      processors: [transform]\n",
    "solutionProcessors": {
      "transform": {
        "metric_statements": [
          {
            "context": "metric",
            "statements": [
              "set(metric.name, \"new.metric.name\")"
            ]
          }
        ]
      }
    }
  },
  {
    "id": "level-93",
    "title": "Set Description",
    "description": "Add a custom description to a metric. Use the **transform** processor to set `metric.description` to `\"Custom metric description\"`.",
    "difficulty": "easy",
    "category": "metrics-ottl",
    "basePoints": 120,
    "inputLogs": [
      "{\"body\":\"my.metric 100\",\"attributes\":{\"metric\":\"my.metric\"}}",
      "{\"body\":\"my.metric 200\",\"attributes\":{\"metric\":\"my.metric\"}}"
    ],
    "expectedBodies": [
      "my.metric 100",
      "my.metric 200"
    ],
    "requiredProcessors": [
      "transform"
    ],
    "hints": [
      "Use the **transform** processor with `metric_statements`",
      "Use `set(metric.description, \"description text\")`",
      "Wire into `service.pipelines.logs.processors`"
    ],
    "starterYaml": "processors:\n  transform:\n    metric_statements:\n      - context: metric\n        statements:\n\nservice:\n  pipelines:\n    logs:\n      processors: [transform]\n",
    "solutionProcessors": {
      "transform": {
        "metric_statements": [
          {
            "context": "metric",
            "statements": [
              "set(metric.description, \"Custom metric description\")"
            ]
          }
        ]
      }
    }
  },
  {
    "id": "level-94",
    "title": "Keep Attributes",
    "description": "Keep only specific data point attributes. Use the **transform** processor to call `keep_keys(data_point.attributes, [\"host\", \"dc\"])` so only `host` and `dc` attributes survive.",
    "difficulty": "medium",
    "category": "metrics-ottl",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"cpu.utilization 0.5\",\"attributes\":{\"metric\":\"cpu\",\"host\":\"web-1\",\"dc\":\"us-east\",\"env\":\"prod\",\"version\":\"1.0\"}}",
      "{\"body\":\"memory.usage 500\",\"attributes\":{\"metric\":\"mem\",\"host\":\"web-1\",\"dc\":\"us-east\",\"env\":\"prod\",\"version\":\"1.0\"}}"
    ],
    "expectedBodies": [
      "cpu.utilization 0.5",
      "memory.usage 500"
    ],
    "requiredProcessors": [
      "transform"
    ],
    "hints": [
      "Use the **transform** processor with a `metric_statements` context",
      "Use `keep_keys(data_point.attributes, [\"host\", \"dc\"])`",
      "This drops all attributes except the listed ones",
      "Wire into `service.pipelines.logs.processors`"
    ],
    "starterYaml": "processors:\n  transform:\n    metric_statements:\n      - context: metric\n        statements:\n\nservice:\n  pipelines:\n    logs:\n      processors: [transform]\n",
    "solutionProcessors": {
      "transform": {
        "metric_statements": [
          {
            "context": "metric",
            "statements": [
              "keep_keys(data_point.attributes, [\"host\", \"dc\"])"
            ]
          }
        ]
      }
    }
  },
  {
    "id": "level-95",
    "title": "Scale Values",
    "description": "Scale metric values by a factor using OTTL. Use the **transform** processor with `scale_metric(0.001)` to convert bytes to kilobytes.",
    "difficulty": "medium",
    "category": "metrics-ottl",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"network.bytes_sent 1024000\",\"attributes\":{\"metric\":\"network.bytes_sent\",\"unit\":\"bytes\"}}",
      "{\"body\":\"network.bytes_sent 2048000\",\"attributes\":{\"metric\":\"network.bytes_sent\",\"unit\":\"bytes\"}}"
    ],
    "expectedBodies": [
      "network.bytes_sent 1024000",
      "network.bytes_sent 2048000"
    ],
    "requiredProcessors": [
      "transform"
    ],
    "hints": [
      "Use the **transform** processor with `metric_statements`",
      "Use `scale_metric(0.001)` to divide all values by 1000",
      "This converts bytes to kilobytes",
      "Wire into `service.pipelines.logs.processors`"
    ],
    "starterYaml": "processors:\n  transform:\n    metric_statements:\n      - context: metric\n        statements:\n\nservice:\n  pipelines:\n    logs:\n      processors: [transform]\n",
    "solutionProcessors": {
      "transform": {
        "metric_statements": [
          {
            "context": "metric",
            "statements": [
              "scale_metric(0.001)"
            ]
          }
        ]
      }
    }
  },
  {
    "id": "level-96",
    "title": "Group by Host",
    "description": "Group metrics by hostname into separate resources. Configure a **groupbyattrs** processor with `keys: [host.name]` to split metrics into groups by their source host.",
    "difficulty": "medium",
    "category": "metrics-processing",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"cpu.utilization 0.5\",\"attributes\":{\"metric\":\"cpu\",\"host.name\":\"web-01\"}}",
      "{\"body\":\"cpu.utilization 0.3\",\"attributes\":{\"metric\":\"cpu\",\"host.name\":\"web-02\"}}",
      "{\"body\":\"memory.usage 1000\",\"attributes\":{\"metric\":\"memory\",\"host.name\":\"web-01\"}}"
    ],
    "expectedBodies": [
      "cpu.utilization 0.5",
      "cpu.utilization 0.3",
      "memory.usage 1000"
    ],
    "requiredProcessors": [
      "groupbyattrs"
    ],
    "hints": [
      "Use the **groupbyattrs** processor",
      "Set `keys` to include `host.name`",
      "This groups data points into separate resources by host",
      "Wire into `service.pipelines.logs.processors`"
    ],
    "starterYaml": "processors:\n  groupbyattrs:\n    keys: []\n\nservice:\n  pipelines:\n    logs:\n      processors: [groupbyattrs]\n",
    "solutionProcessors": {
      "groupbyattrs": {
        "keys": [
          "host.name"
        ]
      }
    }
  },
  {
    "id": "level-97",
    "title": "Compact Metrics",
    "description": "Merge duplicate metric Resource+Scope combinations. Configure a **groupbyattrs** processor with an empty `keys` list to trigger compaction mode for metrics.",
    "difficulty": "hard",
    "category": "metrics-processing",
    "basePoints": 300,
    "inputLogs": [
      "{\"body\":\"cpu.utilization 0.5\",\"attributes\":{\"metric\":\"cpu\",\"host\":\"web-01\"}}",
      "{\"body\":\"cpu.utilization 0.3\",\"attributes\":{\"metric\":\"cpu\",\"host\":\"web-02\"}}",
      "{\"body\":\"memory.usage 1000\",\"attributes\":{\"metric\":\"memory\",\"host\":\"web-01\"}}"
    ],
    "expectedBodies": [
      "cpu.utilization 0.5",
      "cpu.utilization 0.3",
      "memory.usage 1000"
    ],
    "requiredProcessors": [
      "groupbyattrs"
    ],
    "hints": [
      "Use the **groupbyattrs** processor",
      "Leave `keys` as an empty list to enable compaction mode",
      "This merges data points sharing the same Resource+Scope",
      "Wire into `service.pipelines.logs.processors`"
    ],
    "starterYaml": "processors:\n  groupbyattrs:\n    keys: []\n\nservice:\n  pipelines:\n    logs:\n      processors: [groupbyattrs]\n",
    "solutionProcessors": {
      "groupbyattrs": {
        "keys": []
      }
    }
  },
  {
    "id": "level-98",
    "title": "Prometheus Export",
    "description": "Expose metrics on a Prometheus scrape endpoint. Configure a **prometheus** exporter that serves metrics on port `:8889`.",
    "difficulty": "medium",
    "category": "metrics-exporter",
    "basePoints": 200,
    "inputLogs": [
      "{\"body\":\"prometheus.scrape 1\",\"attributes\":{\"exporter\":\"prometheus\",\"port\":8889}}",
      "{\"body\":\"prometheus.scrape 2\",\"attributes\":{\"exporter\":\"prometheus\",\"port\":8889}}"
    ],
    "expectedBodies": [
      "prometheus.scrape 1",
      "prometheus.scrape 2"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add an `exporters` section with a `prometheus` exporter",
      "Set `endpoint` to the address and port to listen on",
      "Wire into `service.pipelines.logs.exporters`"
    ],
    "starterYaml": "exporters:\n  prometheus:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [hostmetrics]\n      exporters: [prometheus]\n",
    "solutionExporters": {
      "prometheus": {
        "endpoint": "0.0.0.0:8889"
      }
    }
  },
  {
    "id": "level-99",
    "title": "Const Labels",
    "description": "Add constant labels to all Prometheus metrics. Configure a **prometheus** exporter that adds `environment: production` and `team: platform` as constant labels to every exported metric.",
    "difficulty": "hard",
    "category": "metrics-exporter",
    "basePoints": 300,
    "inputLogs": [
      "{\"body\":\"cpu.utilization 0.5\",\"attributes\":{\"metric\":\"cpu\",\"env\":\"production\",\"team\":\"platform\"}}",
      "{\"body\":\"memory.usage 1000\",\"attributes\":{\"metric\":\"memory\",\"env\":\"production\",\"team\":\"platform\"}}"
    ],
    "expectedBodies": [
      "cpu.utilization 0.5",
      "memory.usage 1000"
    ],
    "requiredProcessors": [],
    "hints": [
      "Add a `prometheus` exporter with `endpoint`",
      "Add `const_labels` as a map of key-value pairs",
      "Set labels for `environment` and `team`",
      "Wire into `service.pipelines.logs.exporters`"
    ],
    "starterYaml": "exporters:\n  prometheus:\n    const_labels:\n\nservice:\n  pipelines:\n    logs:\n      receivers: [hostmetrics]\n      exporters: [prometheus]\n",
    "solutionExporters": {
      "prometheus": {
        "endpoint": "0.0.0.0:8889",
        "const_labels": {
          "environment": "production",
          "team": "platform"
        }
      }
    }
  }
] as Challenge[];
