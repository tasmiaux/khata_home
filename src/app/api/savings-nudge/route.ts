import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

const MIN_ENTRIES = 4;
const LOOKBACK_DAYS = 14;
const MODEL = "claude-haiku-4-5-20251001";

// No Anthropic billing set up yet, so tips are generated locally from
// templates instead of a real API call. Flip this to false once credits
// are added at console.anthropic.com/settings/billing.
const USE_MOCK_TIP = true;

const NOT_ENOUGH_DATA_MESSAGE =
  "Add a few more expenses and I'll start spotting ways you can save.";
const SETUP_NEEDED_MESSAGE =
  "Add an ANTHROPIC_API_KEY to .env.local to enable savings tips.";
const UNAVAILABLE_MESSAGE = "Check back tomorrow for a fresh savings tip.";

const MOCK_TIP_TEMPLATES: ((category: string, savings: number) => string)[] = [
  (category, savings) =>
    `You've been leaning on ${category} lately — trimming a little there could save you around ₹${savings} this month.`,
  (category, savings) =>
    `${category} is your biggest spend right now — even easing up slightly could free up about ₹${savings}.`,
  (category, savings) =>
    `A small pullback on ${category} this month could quietly save you close to ₹${savings} — nice little win.`,
  (category, savings) =>
    `Your ${category} spending stands out a bit this month — cutting back there could put roughly ₹${savings} back in your pocket.`,
];

function generateMockTip(breakdown: CategoryBreakdown[]): string {
  const top = breakdown[0];
  const savings = Math.max(10, Math.round((top.total * 0.1) / 10) * 10);
  const template = MOCK_TIP_TEMPLATES[Math.floor(Math.random() * MOCK_TIP_TEMPLATES.length)];
  return template(top.category, savings);
}

type CategoryBreakdown = { category: string; total: number; count: number };

async function getRecentBreakdown(): Promise<CategoryBreakdown[]> {
  const { rows } = await pool.query(
    `SELECT category, SUM(amount) AS total, COUNT(*) AS count
     FROM expenses
     WHERE created_at >= now() - interval '${LOOKBACK_DAYS} days'
     GROUP BY category
     ORDER BY total DESC`
  );
  return rows.map((r) => ({
    category: r.category,
    total: Number(r.total),
    count: Number(r.count),
  }));
}

async function getCachedTip(): Promise<string | null> {
  const { rows } = await pool.query(
    `SELECT tip FROM savings_tip_cache WHERE id = 1 AND generated_on = CURRENT_DATE`
  );
  return rows[0]?.tip ?? null;
}

async function cacheTip(tip: string) {
  await pool.query(
    `INSERT INTO savings_tip_cache (id, tip, generated_on)
     VALUES (1, $1, CURRENT_DATE)
     ON CONFLICT (id) DO UPDATE SET tip = $1, generated_on = CURRENT_DATE`,
    [tip]
  );
}

async function generateTip(breakdown: CategoryBreakdown[]): Promise<string> {
  if (USE_MOCK_TIP) return generateMockTip(breakdown);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const summary = breakdown
    .map((c) => `${c.category}: ₹${c.total.toFixed(2)} across ${c.count} entries`)
    .join("; ");

  const prompt = `Here is a user's recent spending broken down by category over the last ${LOOKBACK_DAYS} days: ${summary}. Write one short, warm, encouraging sentence (under 25 words) suggesting a specific, realistic way they could save a bit more this month. Mention a real number if possible. Do not sound preachy or judgmental — sound supportive, like a helpful friend. Respond with only the sentence, no quotation marks, no preamble.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 80,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic API error: ${res.status}`);
  }

  const data = await res.json();
  const text = data.content?.find((b: { type: string }) => b.type === "text")?.text;
  if (!text) throw new Error("No text in Anthropic response");
  return text.trim().replace(/^["']|["']$/g, "");
}

export async function GET() {
  const breakdown = await getRecentBreakdown();
  const totalEntries = breakdown.reduce((sum, c) => sum + c.count, 0);

  if (totalEntries < MIN_ENTRIES) {
    return NextResponse.json({ tip: NOT_ENOUGH_DATA_MESSAGE, isFallback: true });
  }

  const cached = await getCachedTip();
  if (cached) {
    return NextResponse.json({ tip: cached, isFallback: false });
  }

  if (!USE_MOCK_TIP && !process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ tip: SETUP_NEEDED_MESSAGE, isFallback: true });
  }

  try {
    const tip = await generateTip(breakdown);
    await cacheTip(tip);
    return NextResponse.json({ tip, isFallback: false });
  } catch (err) {
    console.error("savings-nudge generation failed:", err);
    return NextResponse.json({ tip: UNAVAILABLE_MESSAGE, isFallback: true });
  }
}
