// AgentForge — Agents API
// GET: List all agents / POST: Register a new agent

import { NextRequest, NextResponse } from "next/server";
import { getAllAgents, createAgent, getAgentByName } from "@/lib/db";

export async function GET() {
    try {
        const agents = getAllAgents();
        return NextResponse.json({
            success: true,
            agents: agents.map((a) => ({
                id: a.id,
                name: a.name,
                description: a.description,
                wallet_address: a.wallet_address,
                reputation: a.reputation,
                total_earned: a.total_earned,
                total_spent: a.total_spent,
                tasks_completed: a.tasks_completed,
                created_at: a.created_at,
            })),
            total: agents.length,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: "Failed to fetch agents" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, description, wallet_address } = body;

        if (!name || !wallet_address) {
            return NextResponse.json(
                { success: false, error: "name and wallet_address are required" },
                { status: 400 }
            );
        }

        // Check if agent already exists
        const existing = getAgentByName(name);
        if (existing) {
            return NextResponse.json(
                { success: false, error: "Agent with this name already exists" },
                { status: 409 }
            );
        }

        const agent = createAgent(name, description || "", wallet_address);
        return NextResponse.json({ success: true, agent }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: "Failed to create agent" },
            { status: 500 }
        );
    }
}
