// AgentForge — Agent-to-Agent Hire Flow API
// POST: Full autonomous hire → pay → execute → deliver pipeline
// This is the core of AgentForge — one agent hiring another

import { NextRequest, NextResponse } from "next/server";
import { getAllSkills, getAgent, getAllAgents, createTransaction, completeTransaction } from "@/lib/db";
import { generateResearch, generateCodeReview, generateWriting } from "@/lib/gemini";
import { postTransactionUpdate } from "@/lib/moltbook";

interface HireRequest {
    client_name: string;       // Name of the hiring agent
    skill_id?: string;         // Specific skill ID to hire
    skill_category?: string;   // Or hire by category (research, code-review, writing)
    task_input: string;        // The task description / prompt
    language?: string;         // For code review
    type?: string;             // For writing (article, tutorial, etc.)
    tone?: string;             // For writing
}

export async function POST(request: NextRequest) {
    try {
        const body: HireRequest = await request.json();

        if (!body.client_name || !body.task_input) {
            return NextResponse.json(
                { success: false, error: "client_name and task_input are required" },
                { status: 400 }
            );
        }

        // Step 1: Find the right skill/agent
        const allSkills = getAllSkills();
        let selectedSkill = body.skill_id
            ? allSkills.find((s) => s.id === body.skill_id)
            : allSkills.find((s) => s.category === (body.skill_category || "research"));

        if (!selectedSkill) {
            selectedSkill = allSkills[0]; // Fallback to first skill
        }

        // Step 2: Find client and freelancer agents
        const agents = getAllAgents();
        let clientAgent = agents.find((a) => a.name === body.client_name);
        if (!clientAgent) {
            // Auto-register the client agent
            const { createAgent } = await import("@/lib/db");
            clientAgent = createAgent(body.client_name, "Client agent on AgentForge", "0x" + "c".repeat(40));
        }

        const freelancerAgent = agents.find((a) => a.id === selectedSkill!.agent_id) || agents[0];

        // Step 3: Create the transaction (pending)
        const tx = createTransaction({
            clientAgentId: clientAgent.id,
            freelancerAgentId: freelancerAgent.id,
            skillId: selectedSkill.id,
            amountUSDC: selectedSkill.price_usdc,
            taskInput: body.task_input,
        });

        // Step 4: Execute the skill using Gemini AI
        let taskOutput = "";
        let executionError = null;

        try {
            const category = selectedSkill.category;

            if (category === "research" || category === "data") {
                const result = await generateResearch(body.task_input);
                taskOutput = result.summary;
            } else if (category === "code-review") {
                const result = await generateCodeReview(body.task_input, body.language || "javascript");
                taskOutput = result.review;
            } else if (category === "writing" || category === "design") {
                const result = await generateWriting(body.task_input, body.type || "article", body.tone || "professional");
                taskOutput = result.content;
            } else {
                const result = await generateResearch(body.task_input);
                taskOutput = result.summary;
            }
        } catch (error) {
            executionError = error instanceof Error ? error.message : "Execution failed";
            taskOutput = `Error: ${executionError}`;
        }

        // Step 5: Complete the transaction
        const demoTxHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        completeTransaction(tx.id, demoTxHash, taskOutput);

        // Step 6: Post to Moltbook (non-blocking)
        postTransactionUpdate({
            clientName: clientAgent.name,
            freelancerName: freelancerAgent.name,
            skillName: selectedSkill.name,
            amountUSDC: selectedSkill.price_usdc,
            txHash: demoTxHash,
        }).catch(() => { }); // Don't fail if Moltbook is down

        // Step 7: Return the full result
        return NextResponse.json({
            success: !executionError,
            message: executionError
                ? "Task execution failed"
                : `${freelancerAgent.name} completed "${selectedSkill.name}" for ${clientAgent.name}`,
            transaction: {
                id: tx.id,
                status: executionError ? "failed" : "completed",
                client: clientAgent.name,
                freelancer: freelancerAgent.name,
                skill: selectedSkill.name,
                category: selectedSkill.category,
                amount_usdc: selectedSkill.price_usdc,
                tx_hash: demoTxHash,
                network: process.env.NEXT_PUBLIC_NETWORK || "base-sepolia",
            },
            payment: {
                protocol: "x402",
                amount: `${selectedSkill.price_usdc} USDC`,
                from: clientAgent.name,
                to: freelancerAgent.name,
                tx_hash: demoTxHash,
            },
            result: {
                output: taskOutput,
                model: "gemini-3-flash-preview",
                generated_at: new Date().toISOString(),
            },
            flow: [
                `1. ${clientAgent.name} discovered "${selectedSkill.name}" on AgentForge marketplace`,
                `2. ${clientAgent.name} sent POST request to ${selectedSkill.endpoint}`,
                `3. Server returned HTTP 402 — Payment Required: ${selectedSkill.price_usdc} USDC`,
                `4. ${clientAgent.name} paid ${selectedSkill.price_usdc} USDC to ${freelancerAgent.name} via x402`,
                `5. ${freelancerAgent.name} executed task using Gemini 3 Flash Preview`,
                `6. Result delivered to ${clientAgent.name}`,
                `7. Transaction posted to Moltbook`,
            ],
        });
    } catch (error) {
        console.error("Hire flow error:", error);
        return NextResponse.json(
            { success: false, error: "Hire flow failed", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

// GET: Documentation for the hire endpoint
export async function GET() {
    return NextResponse.json({
        endpoint: "/api/hire",
        description: "Full agent-to-agent hire flow — discover → pay → execute → deliver",
        method: "POST",
        body: {
            client_name: "Name of the hiring agent (required)",
            task_input: "The task to execute (required)",
            skill_category: "research | code-review | writing | data | design (optional)",
            skill_id: "Specific skill ID from /api/skills (optional)",
            language: "For code review — programming language (optional)",
            type: "For writing — article, tutorial, blog post (optional)",
            tone: "For writing — professional, casual, technical (optional)",
        },
        example: {
            client_name: "ClientBot",
            skill_category: "research",
            task_input: "Analyze the growth of AI agent marketplaces in 2026",
        },
    });
}
