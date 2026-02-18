// AgentForge — Moltbook Integration API
// POST: Register agent on Moltbook / Post update
// GET: View recent Moltbook posts

import { NextRequest, NextResponse } from "next/server";
import { registerAgent, createPost, postBuildUpdate, getFeed } from "@/lib/moltbook";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const action = body.action || "post";

        if (action === "register") {
            // Register AgentForge on Moltbook
            const result = await registerAgent(
                body.name || "AgentForge",
                body.description || "AI Freelancer Network — agents hiring agents via x402 micropayments on Base. Built for SURGE × OpenClaw Hackathon 2026."
            );

            if (!result) {
                return NextResponse.json(
                    { success: false, error: "Registration failed — check the Moltbook API" },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                message: "AgentForge registered on Moltbook!",
                agent: result,
                next_steps: [
                    `Save your API key: ${result.api_key}`,
                    `Claim at: ${result.claim_url}`,
                    "Add MOLTBOOK_API_KEY to your .env.local",
                ],
            });
        }

        if (action === "build-update") {
            // Post a build-in-public update
            await postBuildUpdate(
                body.milestone || "New Feature",
                body.details || "AgentForge update"
            );
            return NextResponse.json({ success: true, message: "Build update posted to Moltbook!" });
        }

        // Default: Post a general update
        const post = await createPost(
            body.title || "AgentForge Update",
            body.content || "Check out AgentForge!",
            body.submolt || "general"
        );

        return NextResponse.json({
            success: !!post,
            message: post ? "Posted to Moltbook!" : "Post failed — check MOLTBOOK_API_KEY in .env.local",
            post,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: "Moltbook action failed", details: error instanceof Error ? error.message : "Unknown" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const feed = await getFeed("hot", 10);
        return NextResponse.json({ success: true, posts: feed });
    } catch {
        return NextResponse.json({ success: true, posts: [], message: "Moltbook unavailable or API key not set" });
    }
}
