"use client";

import { useState } from "react";
import { Delete } from "lucide-react";

const OPERATORS = ["+", "−", "×", "÷"] as const;

function isOperator(char: string): boolean {
  return (OPERATORS as readonly string[]).includes(char);
}

// Evaluates a simple left-to-right expression string (e.g. "12×85÷65−2")
// with standard × ÷ before + − precedence. No parentheses — this is a
// quick-math tool, not a scientific calculator.
function calculate(expression: string): number {
  const tokens = expression.match(/\d+\.?\d*|[+−×÷]/g) ?? [];

  const stage: (number | "+" | "−")[] = [];
  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];
    if (token === "×" || token === "÷") {
      const prev = stage.pop();
      const next = Number(tokens[++i]);
      if (typeof prev !== "number") throw new Error("Invalid expression");
      stage.push(token === "×" ? prev * next : prev / next);
    } else if (token === "+" || token === "−") {
      stage.push(token);
    } else {
      stage.push(Number(token));
    }
    i++;
  }

  let result = typeof stage[0] === "number" ? stage[0] : NaN;
  for (let j = 1; j < stage.length; j += 2) {
    const op = stage[j];
    const val = stage[j + 1];
    if (typeof val !== "number") throw new Error("Invalid expression");
    result = op === "+" ? result + val : result - val;
  }
  return result;
}

function formatResult(n: number): string {
  if (!Number.isFinite(n)) return "Error";
  const rounded = Math.round(n * 1e6) / 1e6;
  return String(rounded);
}

export default function CalculatorPage() {
  const [expression, setExpression] = useState("");
  const [justEvaluated, setJustEvaluated] = useState(false);

  function pressDigit(digit: string) {
    if (justEvaluated) {
      setExpression(digit);
      setJustEvaluated(false);
      return;
    }
    setExpression((prev) => prev + digit);
  }

  function pressDecimal() {
    if (justEvaluated) {
      setExpression("0.");
      setJustEvaluated(false);
      return;
    }
    setExpression((prev) => {
      const segments = prev.split(/[+−×÷]/);
      const current = segments[segments.length - 1];
      if (current.includes(".")) return prev;
      return prev + (current === "" ? "0." : ".");
    });
  }

  function pressOperator(op: (typeof OPERATORS)[number]) {
    setExpression((prev) => {
      if (prev === "") return prev;
      const last = prev.slice(-1);
      if (isOperator(last)) return prev.slice(0, -1) + op;
      return prev + op;
    });
    setJustEvaluated(false);
  }

  function pressBackspace() {
    setExpression((prev) => prev.slice(0, -1));
    setJustEvaluated(false);
  }

  function pressClear() {
    setExpression("");
    setJustEvaluated(false);
  }

  function pressEquals() {
    if (!expression) return;
    const trimmed = isOperator(expression.slice(-1)) ? expression.slice(0, -1) : expression;
    if (!trimmed) return;
    try {
      setExpression(formatResult(calculate(trimmed)));
    } catch {
      setExpression("Error");
    }
    setJustEvaluated(true);
  }

  const operatorButton = "border border-accent/50 font-serif text-xl text-accent transition-colors hover:bg-accent-soft";
  const digitButton = "border border-border font-serif text-xl text-foreground transition-colors hover:bg-accent-soft";
  const utilButton = "border border-border font-serif text-xl text-muted transition-colors hover:bg-accent-soft";

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-5 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-serif text-3xl text-foreground">Calculator</h1>
        <p className="text-[15px] text-muted">Quick math — nothing here is saved.</p>
      </header>

      <div className="flex flex-col gap-4">
        <div className="flex min-h-24 items-end justify-end overflow-x-auto border border-border bg-background px-4 py-6">
          <span className="font-serif text-4xl tabular-nums text-foreground">
            {expression || "0"}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <button type="button" onClick={() => pressOperator("÷")} className={`h-16 ${operatorButton}`}>
            ÷
          </button>
          <button type="button" onClick={() => pressOperator("×")} className={`h-16 ${operatorButton}`}>
            ×
          </button>
          <button type="button" onClick={() => pressOperator("−")} className={`h-16 ${operatorButton}`}>
            −
          </button>
          <button type="button" onClick={() => pressOperator("+")} className={`h-16 ${operatorButton}`}>
            +
          </button>

          <button type="button" onClick={() => pressDigit("7")} className={`h-16 ${digitButton}`}>
            7
          </button>
          <button type="button" onClick={() => pressDigit("8")} className={`h-16 ${digitButton}`}>
            8
          </button>
          <button type="button" onClick={() => pressDigit("9")} className={`h-16 ${digitButton}`}>
            9
          </button>
          <button
            type="button"
            onClick={pressBackspace}
            aria-label="Backspace"
            className={`flex h-16 items-center justify-center ${utilButton}`}
          >
            <Delete className="h-5 w-5" strokeWidth={2} />
          </button>

          <button type="button" onClick={() => pressDigit("4")} className={`h-16 ${digitButton}`}>
            4
          </button>
          <button type="button" onClick={() => pressDigit("5")} className={`h-16 ${digitButton}`}>
            5
          </button>
          <button type="button" onClick={() => pressDigit("6")} className={`h-16 ${digitButton}`}>
            6
          </button>
          <button type="button" onClick={pressClear} className={`h-16 ${utilButton}`}>
            C
          </button>

          <button type="button" onClick={() => pressDigit("1")} className={`h-16 ${digitButton}`}>
            1
          </button>
          <button type="button" onClick={() => pressDigit("2")} className={`h-16 ${digitButton}`}>
            2
          </button>
          <button type="button" onClick={() => pressDigit("3")} className={`h-16 ${digitButton}`}>
            3
          </button>
          <button
            type="button"
            onClick={pressEquals}
            className="row-span-2 bg-accent font-serif text-2xl text-background transition-colors hover:bg-accent/90"
          >
            =
          </button>

          <button type="button" onClick={pressDecimal} className={`h-16 ${digitButton}`}>
            .
          </button>
          <button type="button" onClick={() => pressDigit("0")} className={`col-span-2 h-16 ${digitButton}`}>
            0
          </button>
        </div>
      </div>
    </main>
  );
}
