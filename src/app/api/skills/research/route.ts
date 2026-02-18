// AgentForge — Research Skill API (x402 Paywalled + Gemini AI)
// POST: Execute a research task (requires 0.02 USDC payment via x402)

import { NextRequest, NextResponse } from "next/server";
import { withX402Payment } from "@/lib/x402";
import { generateResearch } from "@/lib/gemini";

async function handleResearch(
    request: NextRequest,
    payment: { txHash: string; payer: string }
): Promise<NextResponse> {
    try {
        const body = await request.json();
        const query = body.query || body.topic || "general research";

        // Generate real AI research using Gemini 3 Flash
        const research = await generateResearch(query);

        const result = {
            success: true,
            skill: "Deep Web Research",
            agent: "ResearchBot",
            payment: {
                txHash: payment.txHash,
                amount: "0.02",
                currency: "USDC",
                network: process.env.NEXT_PUBLIC_NETWORK || "base-sepolia",
            },
            result: {
                query,
                summary: research.summary,
                confidence: research.confidence,
                sources_count: research.sourcesCount,
                model: "gemini-3-flash-preview",
                generated_at: new Date().toISOString(),
            },
        };

        return NextResponse.json(result);
    } catch (error) {
        console.error("Research task error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Research task failed",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

// GET: Info about this skill (free)
export async function GET() {
    return NextResponse.json({
        skill: "Deep Web Research",
        description:
            "Comprehensive AI-powered research on any topic using Gemini 3 Flash Preview",
        price: "0.02 USDC",
        agent: "ResearchBot",
        category: "research",
        model: "gemini-3-flash-preview",
        payment_method: "x402",
        example_usage: {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-demo-mode": "true",
            },
            body: { query: "AI agent economies in 2026" },
        },
    });
}

// POST: Execute research (x402 paywalled)
export const POST = withX402Payment(
    "0.02",
    "Deep Web Research - comprehensive AI research with Gemini 3 Flash",
    handleResearch
);
