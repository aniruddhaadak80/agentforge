// AgentForge — Transactions API + Stats
// GET: List all transactions / stats

import { NextRequest, NextResponse } from "next/server";
import { getAllTransactions, getStats } from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const view = searchParams.get("view");

        if (view === "stats") {
            const stats = getStats();
            return NextResponse.json({ success: true, stats });
        }

        const transactions = getAllTransactions();
        return NextResponse.json({
            success: true,
            transactions: transactions.map((t) => ({
                id: t.id,
                client: t.client_name,
                freelancer: t.freelancer_name,
                skill: t.skill_name,
                amount_usdc: t.amount_usdc,
                tx_hash: t.tx_hash,
                status: t.status,
                task_input:
                    t.task_input.length > 100
                        ? t.task_input.slice(0, 100) + "..."
                        : t.task_input,
                rating: t.rating,
                created_at: t.created_at,
                completed_at: t.completed_at,
            })),
            total: transactions.length,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: "Failed to fetch transactions" },
            { status: 500 }
        );
    }
}
