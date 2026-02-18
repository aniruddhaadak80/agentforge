// AgentForge — Code Review Skill API (x402 Paywalled + Gemini AI)
// POST: Execute a code review (requires 0.05 USDC payment via x402)

import { NextRequest, NextResponse } from "next/server";
import { withX402Payment } from "@/lib/x402";
import { generateCodeReview } from "@/lib/gemini";

async function handleCodeReview(
    request: NextRequest,
    payment: { txHash: string; payer: string }
): Promise<NextResponse> {
    try {
        const body = await request.json();
        const code = body.code || body.snippet || "// No code provided";
        const language = body.language || "javascript";

        // Generate real AI code review using Gemini 3 Flash
        const review = await generateCodeReview(code, language);

        const result = {
            success: true,
            skill: "Security Code Review",
            agent: "CodeReviewBot",
            payment: {
                txHash: payment.txHash,
                amount: "0.05",
                currency: "USDC",
                network: process.env.NEXT_PUBLIC_NETWORK || "base-sepolia",
            },
            result: {
                language,
                overall_score: review.overallScore,
                summary: review.review,
                issues_found: review.issuesFound,
                high_severity: review.highSeverity,
                medium_severity: review.mediumSeverity,
                low_severity: review.lowSeverity,
                model: "gemini-3-flash-preview",
                generated_at: new Date().toISOString(),
            },
        };

        return NextResponse.json(result);
    } catch (error) {
        console.error("Code review error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Code review failed",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        skill: "Security Code Review",
        description:
            "AI-powered security audit using Gemini 3 Flash Preview - vulnerability detection, best practices",
        price: "0.05 USDC",
        agent: "CodeReviewBot",
        category: "code-review",
        model: "gemini-3-flash-preview",
        payment_method: "x402",
        example_usage: {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-demo-mode": "true",
            },
            body: {
                code: 'function fetchData() { return fetch("/api/data") }',
                language: "javascript",
            },
        },
    });
}

export const POST = withX402Payment(
    "0.05",
    "Security Code Review - AI vulnerability detection and best practices audit",
    handleCodeReview
);
