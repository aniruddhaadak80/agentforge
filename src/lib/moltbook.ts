// AgentForge — Moltbook API Client
// Posts agent activity updates to the Moltbook social network

const MOLTBOOK_BASE_URL = "https://www.moltbook.com/api/v1";

interface MoltbookPost {
    id: string;
    title: string;
    content: string;
    submolt: string;
    created_at: string;
}

function getApiKey(): string {
    const key = process.env.MOLTBOOK_API_KEY;
    if (!key) {
        console.warn("⚠️ MOLTBOOK_API_KEY not set — Moltbook posting disabled");
        return "";
    }
    return key;
}

function headers(): HeadersInit {
    return {
        Authorization: `Bearer ${getApiKey()}`,
        "Content-Type": "application/json",
    };
}

/**
 * Register a new agent on Moltbook
 */
export async function registerAgent(
    name: string,
    description: string
): Promise<{
    api_key: string;
    claim_url: string;
    verification_code: string;
} | null> {
    try {
        const res = await fetch(`${MOLTBOOK_BASE_URL}/agents/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.agent;
    } catch (error) {
        console.error("Moltbook registration failed:", error);
        return null;
    }
}

/**
 * Create a post on Moltbook
 */
export async function createPost(
    title: string,
    content: string,
    submolt: string = "general"
): Promise<MoltbookPost | null> {
    if (!getApiKey()) return null;

    try {
        const res = await fetch(`${MOLTBOOK_BASE_URL}/posts`, {
            method: "POST",
            headers: headers(),
            body: JSON.stringify({ title, content, submolt_name: submolt }),
        });
        if (!res.ok) {
            console.error("Moltbook post failed:", res.status, await res.text());
            return null;
        }
        return await res.json();
    } catch (error) {
        console.error("Moltbook post failed:", error);
        return null;
    }
}

/**
 * Create a link post on Moltbook
 */
export async function createLinkPost(
    title: string,
    url: string,
    submolt: string = "general"
): Promise<MoltbookPost | null> {
    if (!getApiKey()) return null;

    try {
        const res = await fetch(`${MOLTBOOK_BASE_URL}/posts`, {
            method: "POST",
            headers: headers(),
            body: JSON.stringify({ title, url, submolt_name: submolt }),
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error("Moltbook link post failed:", error);
        return null;
    }
}

/**
 * Post a transaction update to Moltbook
 */
export async function postTransactionUpdate(data: {
    clientName: string;
    freelancerName: string;
    skillName: string;
    amountUSDC: number;
    txHash: string;
}): Promise<void> {
    const title = `🤝 Agent Transaction: ${data.skillName}`;
    const content = `**${data.clientName}** hired **${data.freelancerName}** for "${data.skillName}"

💰 Payment: ${data.amountUSDC} USDC via x402
🔗 Tx: \`${data.txHash.slice(0, 20)}...\`
🏗️ Powered by AgentForge — the AI freelancer marketplace

#AgentForge #x402 #OpenClaw #SURGE`;

    await createPost(title, content);
}

/**
 * Post a build-in-public update
 */
export async function postBuildUpdate(
    milestone: string,
    details: string
): Promise<void> {
    const title = `🔨 AgentForge Build Update: ${milestone}`;
    const content = `${details}

🦞 Built with OpenClaw | 💰 Powered by x402 + USDC
#AgentForge #BuildInPublic #OpenClaw #SURGE`;

    await createPost(title, content);
}

/**
 * Get the feed from Moltbook
 */
export async function getFeed(
    sort: "hot" | "new" | "top" | "rising" = "hot",
    limit: number = 25
): Promise<MoltbookPost[]> {
    if (!getApiKey()) return [];

    try {
        const res = await fetch(
            `${MOLTBOOK_BASE_URL}/posts?sort=${sort}&limit=${limit}`,
            { headers: headers() }
        );
        if (!res.ok) return [];
        const data = await res.json();
        return data.posts || data || [];
    } catch {
        return [];
    }
}
