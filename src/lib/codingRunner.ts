export interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

declare global {
  interface Window {
    Sk?: {
      configure: (opts: Record<string, unknown>) => void;
      misceval: {
        asyncToPromise: (fn: () => unknown) => Promise<unknown>;
      };
      importMainWithBody: (
        name: string,
        canSuspend: boolean,
        body: string,
        canSkulpt: boolean
      ) => unknown;
      builtinFiles: { files: Record<string, string> };
    };
  }
}

const SKULPT_SOURCES = [
  "/skulpt/skulpt.min.js",
  "/skulpt/skulpt-stdlib.js",
] as const;

let skulptReady: Promise<void> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (window.Sk || src.includes("stdlib")) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error(`Failed to load ${src}`))
      );
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

export function ensureSkulpt(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Python runner only works in the browser."));
  }
  if (window.Sk) return Promise.resolve();

  if (!skulptReady) {
    skulptReady = (async () => {
      for (const src of SKULPT_SOURCES) {
        await loadScript(src);
      }
      if (!window.Sk) {
        throw new Error("Python runner failed to initialize.");
      }
    })().catch((err) => {
      skulptReady = null;
      throw err;
    });
  }

  return skulptReady;
}

export async function runPythonTests(
  userCode: string,
  tests: { name: string; code: string }[]
): Promise<TestResult[]> {
  await ensureSkulpt();
  const Sk = window.Sk!;

  const results: TestResult[] = [];

  for (const test of tests) {
    let output = "";
    Sk.configure({
      output: (text: string) => {
        output += text;
      },
      read: (file: string) => {
        if (Sk.builtinFiles?.files[file] === undefined) {
          throw new Error(`File not found: ${file}`);
        }
        return Sk.builtinFiles.files[file];
      },
    });

    const fullCode = `${userCode.trim()}\n\n${test.code}`;

    try {
      await Sk.misceval.asyncToPromise(() =>
        Sk.importMainWithBody("<stdin>", false, fullCode, true)
      );
      results.push({
        name: test.name,
        passed: true,
        message: "Passed",
      });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Test failed";
      results.push({
        name: test.name,
        passed: false,
        message: output.trim() || msg.replace(/^.*Error: /, ""),
      });
    }
  }

  return results;
}
