// AgentForge — Database Layer
// Local SQLite database for agents, skills, and transactions

import Database from "better-sqlite3";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Types
export interface Agent {
    id: string;
    name: string;
    description: string;
    wallet_address: string;
    reputation: number;
    total_earned: number;
    total_spent: number;
    tasks_completed: number;
    created_at: string;
}

export interface Skill {
    id: string;
    name: string;
    description: string;
    category: string;
    price_usdc: number;
    agent_id: string;
    endpoint: string;
    executions: number;
    avg_rating: number;
    created_at: string;
}

export interface Transaction {
    id: string;
    client_agent_id: string;
    freelancer_agent_id: string;
    skill_id: string;
    amount_usdc: number;
    tx_hash: string;
    status: "pending" | "completed" | "failed" | "refunded";
    task_input: string;
    task_output: string;
    rating: number | null;
    created_at: string;
    completed_at: string | null;
}

let db: Database.Database | null = null;

export function getDb() {
    if (db) return db;

    // Check if we are in a Vercel environment
    const isVercel = process.env.VERCEL === "1";

    try {
        // In Vercel, we must use :memory: or /tmp, but :memory: is safer for stateless functions
        // For local dev, we use the file
        let dbPath = ":memory:";

        if (!isVercel) {
            const dbFile = path.join(process.cwd(), "agentforge.db");
            // Use standard file path for local dev
            dbPath = dbFile;
        }

        db = new Database(dbPath);

        // Enable WAL mode for better concurrency (only for file-based DBs)
        if (!isVercel) {
            db.pragma("journal_mode = WAL");
        }

        initializeDb(db);

        // Always seed in-memory DBs (Vercel) or if file DB is empty
        const agentCount = db.prepare("SELECT COUNT(*) as count FROM agents").get() as { count: number };
        if (isVercel || agentCount.count === 0) {
            console.log(isVercel ? "⚡ Vercel support: Seeding in-memory DB..." : "🌱 Seeding fresh database...");
            seedDatabase(db);
        }
    } catch (error) {
        console.error("Database initialization failed:", error);
        console.warn("⚠️ Falling back to in-memory database due to error");
        db = new Database(":memory:");
        initializeDb(db);
        seedDatabase(db);
    }

    return db;
}

function initializeDb(db: Database.Database) {
    db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      wallet_address TEXT NOT NULL,
      reputation REAL DEFAULT 5.0,
      total_earned REAL DEFAULT 0,
      total_spent REAL DEFAULT 0,
      tasks_completed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      category TEXT DEFAULT 'general',
      price_usdc REAL NOT NULL,
      agent_id TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      executions INTEGER DEFAULT 0,
      avg_rating REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (agent_id) REFERENCES agents(id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      client_agent_id TEXT NOT NULL,
      freelancer_agent_id TEXT NOT NULL,
      skill_id TEXT NOT NULL,
      amount_usdc REAL NOT NULL,
      tx_hash TEXT DEFAULT '',
      status TEXT DEFAULT 'pending',
      task_input TEXT DEFAULT '',
      task_output TEXT DEFAULT '',
      rating REAL,
      created_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT,
      FOREIGN KEY (client_agent_id) REFERENCES agents(id),
      FOREIGN KEY (freelancer_agent_id) REFERENCES agents(id),
      FOREIGN KEY (skill_id) REFERENCES skills(id)
    );
  `);

    // Seed with default agents and skills if empty
    const count = db.prepare("SELECT COUNT(*) as c FROM agents").get() as {
        c: number;
    };
    if (count.c === 0) {
        seedDatabase(db);
    }
}

function seedDatabase(db: Database.Database) {
    // Create default freelancer agents
    const agents = [
        {
            id: uuidv4(),
            name: "ResearchBot",
            description:
                "Expert research agent — deep web analysis, trend reports, competitive intelligence",
            wallet_address: "0x" + "1".repeat(40),
            reputation: 4.8,
        },
        {
            id: uuidv4(),
            name: "CodeReviewBot",
            description:
                "Senior code reviewer — security audits, performance analysis, best practices",
            wallet_address: "0x" + "2".repeat(40),
            reputation: 4.9,
        },
        {
            id: uuidv4(),
            name: "WriterBot",
            description:
                "Professional content writer — articles, documentation, marketing copy",
            wallet_address: "0x" + "3".repeat(40),
            reputation: 4.7,
        },
        {
            id: uuidv4(),
            name: "DataBot",
            description:
                "Data analysis specialist — visualizations, insights, statistical reports",
            wallet_address: "0x" + "4".repeat(40),
            reputation: 4.6,
        },
        {
            id: uuidv4(),
            name: "DesignBot",
            description:
                "UI/UX design agent — wireframes, mockups, design system creation",
            wallet_address: "0x" + "5".repeat(40),
            reputation: 4.5,
        },
    ];

    const insertAgent = db.prepare(
        `INSERT INTO agents (id, name, description, wallet_address, reputation) VALUES (?, ?, ?, ?, ?)`
    );

    const insertSkill = db.prepare(
        `INSERT INTO skills (id, name, description, category, price_usdc, agent_id, endpoint) VALUES (?, ?, ?, ?, ?, ?, ?)`
    );

    for (const agent of agents) {
        insertAgent.run(
            agent.id,
            agent.name,
            agent.description,
            agent.wallet_address,
            agent.reputation
        );
    }

    // Create skills for each agent
    const skills = [
        {
            name: "Deep Web Research",
            description:
                "Comprehensive research on any topic with sourced references and trend analysis",
            category: "research",
            price: 0.02,
            agentIdx: 0,
            endpoint: "/api/skills/research",
        },
        {
            name: "Market Intelligence",
            description:
                "Competitive analysis and market insights for any industry or product",
            category: "research",
            price: 0.03,
            agentIdx: 0,
            endpoint: "/api/skills/research",
        },
        {
            name: "Security Code Review",
            description:
                "Deep security audit of code — vulnerability detection, best practices, fixes",
            category: "code-review",
            price: 0.05,
            agentIdx: 1,
            endpoint: "/api/skills/code-review",
        },
        {
            name: "Performance Review",
            description:
                "Code optimization analysis — bottlenecks, memory leaks, efficiency improvements",
            category: "code-review",
            price: 0.04,
            agentIdx: 1,
            endpoint: "/api/skills/code-review",
        },
        {
            name: "Technical Article",
            description:
                "Professional technical writing — blog posts, docs, tutorials",
            category: "writing",
            price: 0.03,
            agentIdx: 2,
            endpoint: "/api/skills/writing",
        },
        {
            name: "Marketing Copy",
            description:
                "Compelling marketing content — landing pages, ad copy, email sequences",
            category: "writing",
            price: 0.02,
            agentIdx: 2,
            endpoint: "/api/skills/writing",
        },
        {
            name: "Data Analysis Report",
            description:
                "Statistical analysis and visualization from raw data sets",
            category: "data",
            price: 0.04,
            agentIdx: 3,
            endpoint: "/api/skills/research",
        },
        {
            name: "UI/UX Wireframe",
            description:
                "Design wireframes and user flow diagrams for web/mobile apps",
            category: "design",
            price: 0.03,
            agentIdx: 4,
            endpoint: "/api/skills/writing",
        },
    ];

    for (const skill of skills) {
        insertSkill.run(
            uuidv4(),
            skill.name,
            skill.description,
            skill.category,
            skill.price,
            agents[skill.agentIdx].id,
            skill.endpoint
        );
    }

    // Seed some demo transactions
    const insertTx = db.prepare(
        `INSERT INTO transactions (id, client_agent_id, freelancer_agent_id, skill_id, amount_usdc, tx_hash, status, task_input, task_output, rating, created_at, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const allSkills = db.prepare("SELECT * FROM skills").all() as Skill[];
    const demoTxs = [
        {
            clientIdx: 3,
            freelancerIdx: 0,
            skillIdx: 0,
            amount: 0.02,
            status: "completed",
            input: "Research the latest DeFi yield farming strategies for 2026",
            output:
                "Comprehensive report on DeFi yield farming: Top protocols include Aave v4, Uniswap v5, and Curve...",
            rating: 5,
            created: "2026-02-15T10:30:00",
            completed: "2026-02-15T10:31:00",
        },
        {
            clientIdx: 4,
            freelancerIdx: 1,
            skillIdx: 2,
            amount: 0.05,
            status: "completed",
            input: "Review this smart contract for vulnerabilities",
            output:
                "Security audit complete: Found 2 medium-risk issues — reentrancy in withdraw() and unchecked return...",
            rating: 5,
            created: "2026-02-16T14:00:00",
            completed: "2026-02-16T14:02:00",
        },
        {
            clientIdx: 0,
            freelancerIdx: 2,
            skillIdx: 4,
            amount: 0.03,
            status: "completed",
            input: "Write a blog post about AI agent economies",
            output:
                "# The Rise of Agent Economies\n\nAI agents are beginning to trade services...",
            rating: 4,
            created: "2026-02-17T09:00:00",
            completed: "2026-02-17T09:03:00",
        },
        {
            clientIdx: 2,
            freelancerIdx: 0,
            skillIdx: 1,
            amount: 0.03,
            status: "pending",
            input: "Market analysis for decentralized AI compute platforms",
            output: "",
            rating: null,
            created: "2026-02-18T08:00:00",
            completed: null,
        },
    ];

    for (const tx of demoTxs) {
        insertTx.run(
            uuidv4(),
            agents[tx.clientIdx].id,
            agents[tx.freelancerIdx].id,
            allSkills[tx.skillIdx]?.id || allSkills[0].id,
            tx.amount,
            tx.status === "completed"
                ? "0x" + Math.random().toString(16).slice(2, 66).padEnd(64, "0")
                : "",
            tx.status,
            tx.input,
            tx.output,
            tx.rating,
            tx.created,
            tx.completed
        );
    }

    // Update agent earnings
    db.prepare(
        `UPDATE agents SET total_earned = 0.02, tasks_completed = 1 WHERE name = 'ResearchBot'`
    ).run();
    db.prepare(
        `UPDATE agents SET total_earned = 0.05, tasks_completed = 1 WHERE name = 'CodeReviewBot'`
    ).run();
    db.prepare(
        `UPDATE agents SET total_earned = 0.03, tasks_completed = 1 WHERE name = 'WriterBot'`
    ).run();
}

// ========================
// CRUD Operations
// ========================

// Agents
export function getAllAgents(): Agent[] {
    return getDb()
        .prepare("SELECT * FROM agents ORDER BY reputation DESC")
        .all() as Agent[];
}

export function getAgent(id: string): Agent | undefined {
    return getDb().prepare("SELECT * FROM agents WHERE id = ?").get(id) as
        | Agent
        | undefined;
}

export function getAgentByName(name: string): Agent | undefined {
    return getDb().prepare("SELECT * FROM agents WHERE name = ?").get(name) as
        | Agent
        | undefined;
}

export function createAgent(
    name: string,
    description: string,
    walletAddress: string
): Agent {
    const id = uuidv4();
    getDb()
        .prepare(
            `INSERT INTO agents (id, name, description, wallet_address) VALUES (?, ?, ?, ?)`
        )
        .run(id, name, description, walletAddress);
    return getAgent(id)!;
}

// Skills
export function getAllSkills(): (Skill & { agent_name: string })[] {
    return getDb()
        .prepare(
            `SELECT s.*, a.name as agent_name FROM skills s JOIN agents a ON s.agent_id = a.id ORDER BY s.executions DESC`
        )
        .all() as (Skill & { agent_name: string })[];
}

export function getSkill(id: string): Skill | undefined {
    return getDb().prepare("SELECT * FROM skills WHERE id = ?").get(id) as
        | Skill
        | undefined;
}

export function getSkillsByCategory(
    category: string
): (Skill & { agent_name: string })[] {
    return getDb()
        .prepare(
            `SELECT s.*, a.name as agent_name FROM skills s JOIN agents a ON s.agent_id = a.id WHERE s.category = ? ORDER BY s.avg_rating DESC`
        )
        .all(category) as (Skill & { agent_name: string })[];
}

// Transactions
export function getAllTransactions(): (Transaction & {
    client_name: string;
    freelancer_name: string;
    skill_name: string;
})[] {
    return getDb()
        .prepare(
            `SELECT t.*, 
              c.name as client_name, 
              f.name as freelancer_name, 
              s.name as skill_name 
       FROM transactions t 
       JOIN agents c ON t.client_agent_id = c.id 
       JOIN agents f ON t.freelancer_agent_id = f.id 
       JOIN skills s ON t.skill_id = s.id 
       ORDER BY t.created_at DESC`
        )
        .all() as (Transaction & {
            client_name: string;
            freelancer_name: string;
            skill_name: string;
        })[];
}

export function createTransaction(data: {
    clientAgentId: string;
    freelancerAgentId: string;
    skillId: string;
    amountUSDC: number;
    taskInput: string;
}): Transaction {
    const id = uuidv4();
    getDb()
        .prepare(
            `INSERT INTO transactions (id, client_agent_id, freelancer_agent_id, skill_id, amount_usdc, task_input) VALUES (?, ?, ?, ?, ?, ?)`
        )
        .run(
            id,
            data.clientAgentId,
            data.freelancerAgentId,
            data.skillId,
            data.amountUSDC,
            data.taskInput
        );
    return getDb()
        .prepare("SELECT * FROM transactions WHERE id = ?")
        .get(id) as Transaction;
}

export function completeTransaction(
    id: string,
    txHash: string,
    output: string
): void {
    getDb()
        .prepare(
            `UPDATE transactions SET status = 'completed', tx_hash = ?, task_output = ?, completed_at = datetime('now') WHERE id = ?`
        )
        .run(txHash, output, id);
}

export function getStats(): {
    totalAgents: number;
    totalSkills: number;
    totalTransactions: number;
    totalVolume: number;
    completedTasks: number;
} {
    const db = getDb();
    const totalAgents = (
        db.prepare("SELECT COUNT(*) as c FROM agents").get() as { c: number }
    ).c;
    const totalSkills = (
        db.prepare("SELECT COUNT(*) as c FROM skills").get() as { c: number }
    ).c;
    const totalTransactions = (
        db.prepare("SELECT COUNT(*) as c FROM transactions").get() as { c: number }
    ).c;
    const totalVolume = (
        db
            .prepare(
                "SELECT COALESCE(SUM(amount_usdc), 0) as v FROM transactions WHERE status = 'completed'"
            )
            .get() as { v: number }
    ).v;
    const completedTasks = (
        db
            .prepare(
                "SELECT COUNT(*) as c FROM transactions WHERE status = 'completed'"
            )
            .get() as { c: number }
    ).c;
    return {
        totalAgents,
        totalSkills,
        totalTransactions,
        totalVolume,
        completedTasks,
    };
}
