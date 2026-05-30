"use client";

import { useMemo, useRef } from "react";

const KEYWORDS = new Set([
  "def",
  "return",
  "if",
  "else",
  "elif",
  "for",
  "while",
  "in",
  "not",
  "and",
  "or",
  "True",
  "False",
  "None",
  "class",
  "import",
  "from",
  "pass",
  "break",
  "continue",
  "lambda",
  "with",
  "as",
  "try",
  "except",
  "finally",
  "raise",
  "yield",
  "is",
  "del",
  "global",
  "nonlocal",
]);

const BUILTINS = new Set([
  "len",
  "range",
  "print",
  "int",
  "str",
  "list",
  "dict",
  "set",
  "min",
  "max",
  "sum",
  "abs",
  "sorted",
  "enumerate",
  "zip",
  "map",
  "filter",
  "bool",
  "float",
]);

function tokenizeLine(line: string): { text: string; className: string }[] {
  const tokens: { text: string; className: string }[] = [];
  let i = 0;

  while (i < line.length) {
    const ch = line[i];

    if (ch === "#") {
      tokens.push({ text: line.slice(i), className: "text-zinc-500 italic" });
      break;
    }

    if (ch === '"' || ch === "'") {
      const quote = ch;
      let j = i + 1;
      while (j < line.length && line[j] !== quote) j++;
      j = Math.min(j + 1, line.length);
      tokens.push({ text: line.slice(i, j), className: "text-amber-300/90" });
      i = j;
      continue;
    }

    if (/[0-9]/.test(ch)) {
      let j = i + 1;
      while (j < line.length && /[0-9.]/.test(line[j])) j++;
      tokens.push({ text: line.slice(i, j), className: "text-violet-400" });
      i = j;
      continue;
    }

    if (/[a-zA-Z_]/.test(ch)) {
      let j = i + 1;
      while (j < line.length && /[a-zA-Z0-9_]/.test(line[j])) j++;
      const word = line.slice(i, j);
      let className = "text-zinc-300";
      if (KEYWORDS.has(word)) className = "text-sky-400 font-medium";
      else if (BUILTINS.has(word)) className = "text-teal-400";
      tokens.push({ text: word, className });
      i = j;
      continue;
    }

    if ("()[]{}:,".includes(ch)) {
      tokens.push({ text: ch, className: "text-zinc-500" });
      i++;
      continue;
    }

    tokens.push({ text: ch, className: "text-zinc-300" });
    i++;
  }

  return tokens;
}

function HighlightedCode({ code }: { code: string }) {
  const lines = code.split("\n");
  return (
    <>
      {lines.map((line, li) => (
        <div key={li} className="whitespace-pre">
          {tokenizeLine(line).map((tok, ti) => (
            <span key={ti} className={tok.className}>
              {tok.text}
            </span>
          ))}
          {li < lines.length - 1 ? "\n" : null}
        </div>
      ))}
    </>
  );
}

export function PythonEditor({
  value,
  onChange,
  minHeight = 220,
}: {
  value: string;
  onChange: (v: string) => void;
  minHeight?: number;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);

  const lineCount = useMemo(() => value.split("\n").length, [value]);

  const syncScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  return (
    <div className="relative font-mono text-sm bg-[#0d1117]">
      <div
        className="absolute left-0 top-0 bottom-0 w-10 border-r border-zinc-800/80 bg-[#0a0e12]/60 text-right pr-2 pt-4 text-xs text-zinc-600 select-none pointer-events-none z-10"
        aria-hidden
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} className="leading-6 h-6">
            {i + 1}
          </div>
        ))}
      </div>

      <pre
        ref={highlightRef}
        aria-hidden
        className="absolute inset-0 pl-14 pr-4 pt-4 pb-4 m-0 overflow-auto pointer-events-none leading-6"
      >
        <HighlightedCode code={value.endsWith("\n") ? value + " " : value} />
      </pre>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        className="relative w-full pl-14 pr-4 pt-4 pb-4 bg-transparent text-transparent caret-zinc-100 focus:outline-none resize-y leading-6"
        style={{ minHeight }}
      />
    </div>
  );
}
