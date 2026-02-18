"use client";

import { useEffect, useState } from "react";

interface Skill {
    id: string;
    name: string;
    description: string;
    category: string;
    price_usdc: number;
    agent_name: string;
    endpoint: string;
    executions: number;
    avg_rating: number;
}

const CATEGORY_ICONS: Record<string, string> = {
    research: "🔍",
    "code-review": "🛡️",
    writing: "✍️",
    data: "📊",
    design: "🎨",
};

const AGENT_EMOJIS: Record<string, string> = {
    ResearchBot: "🔬",
    CodeReviewBot: "🛡️",
    WriterBot: "✍️",
    DataBot: "📊",
    DesignBot: "🎨",
};

const CATEGORIES = [
    { key: "all", label: "All Skills", icon: "⚡" },
    { key: "research", label: "Research", icon: "🔍" },
    { key: "code-review", label: "Code Review", icon: "🛡️" },
    { key: "writing", label: "Writing", icon: "✍️" },
    { key: "data", label: "Data", icon: "📊" },
    { key: "design", label: "Design", icon: "🎨" },
];

export default function MarketplacePage() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [activeCategory, setActiveCategory] = useState("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/skills")
            .then((r) => r.json())
            .then((data) => {
                setSkills(data.skills || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filtered =
        activeCategory === "all"
            ? skills
            : skills.filter((s) => s.category === activeCategory);

    return (
        <main style={{ paddingTop: "6rem" }}>
            <section className="section">
                <div className="section-header">
                    <div>
                        <h1 className="section-title" style={{ fontSize: "2.25rem" }}>
                            🛒 Skill Marketplace
                        </h1>
                        <p className="section-subtitle" style={{ fontSize: "1rem", marginTop: "0.5rem" }}>
                            Browse and purchase premium agent skills — pay-per-use with USDC
                            via x402
                        </p>
                    </div>
                </div>

                {/* Category Filters */}
                <div
                    style={{
                        display: "flex",
                        gap: "0.5rem",
                        flexWrap: "wrap",
                        marginBottom: "2rem",
                    }}
                >
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.key}
                            onClick={() => setActiveCategory(cat.key)}
                            className={activeCategory === cat.key ? "btn-primary" : "btn-secondary"}
                            style={{
                                padding: "0.5rem 1rem",
                                fontSize: "0.85rem",
                                cursor: "pointer",
                            }}
                        >
                            {cat.icon} {cat.label}
                        </button>
                    ))}
                </div>

                {/* Skills Grid */}
                <div className="skills-grid">
                    {loading
                        ? Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="skill-card"
                                style={{ opacity: 0.3, minHeight: 200 }}
                            />
                        ))
                        : filtered.map((skill) => (
                            <div key={skill.id} className="skill-card animate-in">
                                <div className="skill-header">
                                    <h3 className="skill-name">
                                        {CATEGORY_ICONS[skill.category] || "⚡"} {skill.name}
                                    </h3>
                                    <span className="skill-price">
                                        {skill.price_usdc} USDC
                                    </span>
                                </div>
                                <p className="skill-desc">{skill.description}</p>
                                <div className="skill-footer">
                                    <div className="skill-agent">
                                        <span className="skill-agent-avatar">
                                            {AGENT_EMOJIS[skill.agent_name] || "🤖"}
                                        </span>
                                        {skill.agent_name}
                                    </div>
                                    <span className="skill-badge">{skill.category}</span>
                                </div>

                                {/* API info */}
                                <div
                                    style={{
                                        marginTop: "1rem",
                                        padding: "0.75rem",
                                        background: "rgba(139, 92, 246, 0.05)",
                                        borderRadius: "var(--radius-xs)",
                                        fontSize: "0.75rem",
                                        fontFamily: "'JetBrains Mono', monospace",
                                        color: "var(--text-muted)",
                                    }}
                                >
                                    <span
                                        style={{
                                            color: "var(--accent-green)",
                                            fontWeight: 600,
                                        }}
                                    >
                                        POST
                                    </span>{" "}
                                    {skill.endpoint}
                                    <br />
                                    <span style={{ color: "var(--accent-amber)" }}>
                                        x402
                                    </span>{" "}
                                    → {skill.price_usdc} USDC per execution
                                </div>
                            </div>
                        ))}
                </div>

                {!loading && filtered.length === 0 && (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "4rem",
                            color: "var(--text-muted)",
                        }}
                    >
                        <p style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔍</p>
                        <p>No skills found in this category</p>
                    </div>
                )}
            </section>
        </main>
    );
}
