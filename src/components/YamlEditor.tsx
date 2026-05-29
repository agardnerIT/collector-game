"use client";

import dynamic from "next/dynamic";
import { useRef, useEffect, useState } from "react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

interface YamlEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
}

export default function YamlEditor({ value, onChange }: YamlEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Auto-focus editor area so mobile users see the editor
    editorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  return (
    <div ref={editorRef} className="game-card">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">⚙️</span>
        <h3 className="text-sm font-bold text-gray-600">Your Config</h3>
      </div>
      <div className="rounded-2xl overflow-hidden border-2 border-candy-purple/30">
        <MonacoEditor
          height="320px"
          language="yaml"
          theme={dark ? "vs-dark" : "vs"}
          value={value}
          onChange={onChange}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            padding: { top: 12, bottom: 12 },
            fontFamily: "var(--font-geist-mono), monospace",
            tabSize: 2,
            renderWhitespace: "selection",
            bracketPairColorization: { enabled: true },
            guides: { indentation: true },
          }}
        />
      </div>
    </div>
  );
}
