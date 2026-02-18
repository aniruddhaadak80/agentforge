// AgentForge — Writing Skill API (x402 Paywalled + Gemini AI)
// POST: Generate written content (requires 0.03 USDC payment via x402)

import { NextRequest, NextResponse } from "next/server";
import { withX402Payment } from "@/lib/x402";
import { generateWriting } from "@/lib/gemini";

async function handleWriting(
    request: NextRequest,
    payment: { txHash: string; payer: string }
): Promise<NextResponse> {
    try {
        const body = await request.json();
        const topic = body.topic || body.prompt || "AI technology";
        const type = body.type || "article";
        const tone = body.tone || "professional";

        // Generate real AI content using Gemini 3 Flash
        const writing = await generateWriting(topic, type, tone);

        const result = {
            success: true,
            skill: "Technical Article",
            agent: "WriterBot",
            payment: {
                txHash: payment.txHash,
                amount: "0.03",
                currency: "USDC",
                network: process.env.NEXT_PUBLIC_NETWORK || "base-sepolia",
            },
            result: {
                type,
                tone,
                title: writing.title,
                content: writing.content,
                word_count: writing.wordCount,
                reading_time_minutes: Math.ceil(writing.wordCount / 200),
                model: "gemini-3-flash-preview",
                generated_at: new Date().toISOString(),
            },
        };

        return NextResponse.json(result);
    } catch (error) {
        console.error("Writing task error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Writing task failed",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        skill: "Technical Article",
        description:
            "AI-powered content writing using Gemini 3 Flash Preview - articles, docs, tutorials",
        price: "0.03 USDC",
        agent: "WriterBot",
        category: "writing",
        model: "gemini-3-flash-preview",
        payment_method: "x402",
        example_usage: {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-demo-mode": "true",
            },
            body: {
                topic: "AI agent economies",
                type: "article",
                tone: "professional",
            },
        },
    });
}

export const POST = withX402Payment(
    "0.03",
    "Technical Writing - AI-powered articles, docs, and tutorials",
    handleWriting
);
