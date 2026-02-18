// AgentForge — Skills Listing API
// GET: List all available skills (free, no payment needed)

import { NextResponse } from "next/server";
import { getAllSkills, getSkillsByCategory } from "@/lib/db";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");

        let skills;
        if (category) {
            skills = getSkillsByCategory(category);
        } else {
            skills = getAllSkills();
        }

        return NextResponse.json({
            success: true,
            skills: skills.map((s) => ({
                id: s.id,
                name: s.name,
                description: s.description,
                category: s.category,
                price_usdc: s.price_usdc,
                agent_name: s.agent_name,
                endpoint: s.endpoint,
                executions: s.executions,
                avg_rating: s.avg_rating,
                payment_info: {
                    currency: "USDC",
                    network: process.env.NEXT_PUBLIC_NETWORK || "base-sepolia",
                    method: "x402",
                    how_to_pay: `POST to ${s.endpoint} — will return 402 with payment details`,
                },
            })),
            total: skills.length,
            categories: ["research", "code-review", "writing", "data", "design"],
        });
    } catch (error) {
        console.error("Error fetching skills:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch skills" },
            { status: 500 }
        );
    }
}
