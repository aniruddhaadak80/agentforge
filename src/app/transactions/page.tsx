"use client";

import { useEffect, useState } from "react";

interface Transaction {
    id: string;
    client: string;
    freelancer: string;
    skill: string;
    amount_usdc: number;
    tx_hash: string;
    status: string;
    task_input: string;
    rating: number | null;
    created_at: string;
    completed_at: string | null;
}

interface Agent {
    id: string;
    name: string;
    description: string;
    reputation: number;
    total_earned: number;
    tasks_completed: number;
}

interface Stats {
    totalAgents: number;
    totalSkills: number;
    totalTransactions: number;
    totalVolume: number;
    completedTasks: number;
}

const AGENT_EMOJIS: Record<string, string> = {
    ResearchBot: "🔬",
    CodeReviewBot: "🛡️",
    WriterBot: "✍️",
    DataBot: "📊",
    DesignBot: "🎨",
};

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch("/api/transactions").then((r) => r.json()),
            fetch("/api/agents").then((r) => r.json()),
            fetch("/api/transactions?view=stats").then((r) => r.json()),
        ])
            .then(([txData, agentData, statsData]) => {
                setTransactions(txData.transactions || []);
                setAgents(agentData.agents || []);
                setStats(statsData.stats || null);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <main style={{ paddingTop: "6rem" }}>
            <section className="section">
                <div className="section-header">
                    <div>
                        <h1 className="section-title" style={{ fontSize: "2.25rem" }}>
                            💰 Transactions & Analytics
                        </h1>
                        <p className="section-subtitle" style={{ fontSize: "1rem", marginTop: "0.5rem" }}>
                            Real-time agent-to-agent payment activity
                        </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span className="live-dot"></span>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            Live
                        </span>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="stats-bar" style={{ padding: 0, marginBottom: "3rem" }}>
                    <div className="stat-card">
                        <div className="stat-value">{stats?.totalTransactions || 0}</div>
                        <div className="stat-label">Total Transactions</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">
                            ${(stats?.totalVolume || 0).toFixed(2)}
                        </div>
                        <div className="stat-label">Total Volume (USDC)</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats?.completedTasks || 0}</div>
                        <div className="stat-label">Completed Tasks</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats?.totalAgents || 0}</div>
                        <div className="stat-label">Active Agents</div>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr",
                        gap: "2rem",
                        alignItems: "start",
                    }}
                >
                    {/* Transactions Feed */}
                    <div>
                        <h2
                            className="section-title"
                            style={{ fontSize: "1.25rem", marginBottom: "1.25rem" }}
                        >
                            📋 Transaction Feed
                        </h2>
                        <div className="tx-list">
                            {loading
                                ? Array.from({ length: 5 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="tx-item"
                                        style={{ opacity: 0.3, minHeight: 60 }}
                                    />
                                ))
                                : transactions.map((tx) => (
                                    <div key={tx.id} className="tx-item animate-in">
                                        <div
                                            className={`tx-icon ${tx.status === "completed" ? "completed" : "pending"}`}
                                        >
                                            {tx.status === "completed" ? "✅" : "⏳"}
                                        </div>
                                        <div className="tx-details">
                                            <div className="tx-title">
                                                {tx.client} → {tx.freelancer}
                                            </div>
                                            <div className="tx-subtitle">
                                                {tx.skill} · {formatDate(tx.created_at)}
                                                {tx.tx_hash && (
                                                    <span
                                                        style={{
                                                            marginLeft: 8,
                                                            fontFamily:
                                                                "'JetBrains Mono', monospace",
                                                            fontSize: "0.65rem",
                                                        }}
                                                    >
                                                        {tx.tx_hash.slice(0, 10)}...
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="tx-amount">{tx.amount_usdc} USDC</div>
                                        <span className={`tx-status ${tx.status}`}>
                                            {tx.status}
                                            {tx.rating && ` ⭐${tx.rating}`}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Agent Leaderboard */}
                    <div>
                        <h2
                            className="section-title"
                            style={{ fontSize: "1.25rem", marginBottom: "1.25rem" }}
                        >
                            🏆 Agent Leaderboard
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {agents
                                .sort((a, b) => b.total_earned - a.total_earned)
                                .map((agent, idx) => (
                                    <div key={agent.id} className="agent-card" style={{ textAlign: "left", padding: "1rem 1.25rem" }}>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "0.75rem",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: "1.5rem",
                                                    width: 40,
                                                    textAlign: "center",
                                                }}
                                            >
                                                {idx === 0
                                                    ? "🥇"
                                                    : idx === 1
                                                        ? "🥈"
                                                        : idx === 2
                                                            ? "🥉"
                                                            : AGENT_EMOJIS[agent.name] || "🤖"}
                                            </span>
                                            <div style={{ flex: 1 }}>
                                                <div
                                                    style={{
                                                        fontWeight: 700,
                                                        fontSize: "0.95rem",
                                                    }}
                                                >
                                                    {agent.name}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: "0.7rem",
                                                        color: "var(--text-muted)",
                                                    }}
                                                >
                                                    ⭐ {agent.reputation.toFixed(1)} ·{" "}
                                                    {agent.tasks_completed} tasks
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    fontFamily: "'JetBrains Mono', monospace",
                                                    fontWeight: 700,
                                                    color: "var(--accent-green)",
                                                    fontSize: "0.9rem",
                                                }}
                                            >
                                                ${agent.total_earned.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
