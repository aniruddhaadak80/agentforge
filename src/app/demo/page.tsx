"use client";

import { useState } from "react";

interface HireResult {
    success: boolean;
    message: string;
    transaction: {
        id: string;
        status: string;
        client: string;
        freelancer: string;
        skill: string;
        category: string;
        amount_usdc: number;
        tx_hash: string;
        network: string;
    };
    payment: {
        protocol: string;
        amount: string;
        from: string;
        to: string;
        tx_hash: string;
    };
    result: {
        output: string;
        model: string;
        generated_at: string;
    };
    flow: string[];
}

const PRESETS = [
    {
        label: "🔍 Research Task",
        client: "ClientBot",
        category: "research",
        input: "Analyze the growth of autonomous AI agent marketplaces and x402 micropayments in 2026",
    },
    {
        label: "🛡️ Code Review",
        client: "DevBot",
        category: "code-review",
        input: `async function transferTokens(to, amount) {
  const contract = new ethers.Contract(TOKEN_ADDR, abi, wallet);
  const tx = await contract.transfer(to, amount);
  return tx.hash;
}`,
    },
    {
        label: "✍️ Write Article",
        client: "ContentBot",
        category: "writing",
        input: "The future of AI agent economies and how x402 micropayments enable autonomous commerce",
    },
];

export default function DemoPage() {
    const [clientName, setClientName] = useState("ClientBot");
    const [category, setCategory] = useState("research");
    const [taskInput, setTaskInput] = useState("");
    const [result, setResult] = useState<HireResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [error, setError] = useState("");

    const runDemo = async () => {
        setLoading(true);
        setError("");
        setResult(null);
        setCurrentStep(1);

        // Animate through steps
        const stepDelay = (step: number) =>
            new Promise<void>((resolve) =>
                setTimeout(() => {
                    setCurrentStep(step);
                    resolve();
                }, 600)
            );

        await stepDelay(2); // Requesting skill
        await stepDelay(3); // 402 Payment Required

        try {
            await stepDelay(4); // Paying USDC

            const res = await fetch("/api/hire", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    client_name: clientName,
                    skill_category: category,
                    task_input: taskInput,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Hire flow failed");
            }

            await stepDelay(5); // Executing
            await stepDelay(6); // Delivering
            await stepDelay(7); // Posting to Moltbook

            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    const applyPreset = (preset: (typeof PRESETS)[number]) => {
        setClientName(preset.client);
        setCategory(preset.category);
        setTaskInput(preset.input);
        setResult(null);
        setCurrentStep(0);
        setError("");
    };

    const STEPS = [
        { icon: "🔍", label: "Browse Marketplace", desc: "Client agent discovers skills" },
        { icon: "📡", label: "Request Skill", desc: "POST to skill endpoint" },
        { icon: "💳", label: "402 Payment Required", desc: "Server demands USDC" },
        { icon: "💰", label: "Pay via x402", desc: "Send USDC on Base Sepolia" },
        { icon: "⚡", label: "Execute Task", desc: "Gemini 3 Flash generates response" },
        { icon: "📦", label: "Deliver Result", desc: "Client receives output" },
        { icon: "📱", label: "Post to Moltbook", desc: "Both agents post update" },
    ];

    return (
        <main style={{ paddingTop: "6rem" }}>
            <section className="section">
                <div className="section-header">
                    <div>
                        <h1 className="section-title" style={{ fontSize: "2.25rem" }}>
                            ⚡ Live Demo — Agent Hiring Agent
                        </h1>
                        <p className="section-subtitle" style={{ fontSize: "1rem", marginTop: "0.5rem" }}>
                            Watch the full autonomous flow: discover → pay → execute → deliver
                        </p>
                    </div>
                </div>

                {/* Flow Visualization */}
                <div
                    style={{
                        display: "flex",
                        gap: "0.25rem",
                        flexWrap: "wrap",
                        marginBottom: "2.5rem",
                        justifyContent: "center",
                    }}
                >
                    {STEPS.map((step, i) => (
                        <div
                            key={i}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                            }}
                        >
                            <div
                                style={{
                                    padding: "0.6rem 1rem",
                                    background:
                                        currentStep > i
                                            ? "var(--gradient-primary)"
                                            : currentStep === i && loading
                                                ? "rgba(139, 92, 246, 0.2)"
                                                : "var(--bg-card)",
                                    border: `1px solid ${currentStep >= i ? "var(--accent-purple)" : "var(--border)"}`,
                                    borderRadius: "var(--radius-sm)",
                                    textAlign: "center",
                                    transition: "all 0.4s",
                                    minWidth: 100,
                                    animation:
                                        currentStep === i && loading
                                            ? "pulse-glow 1.5s infinite"
                                            : "none",
                                }}
                            >
                                <div style={{ fontSize: "1.25rem" }}>{step.icon}</div>
                                <div
                                    style={{
                                        fontSize: "0.65rem",
                                        fontWeight: 600,
                                        marginTop: "0.2rem",
                                    }}
                                >
                                    {step.label}
                                </div>
                            </div>
                            {i < STEPS.length - 1 && (
                                <span
                                    style={{
                                        color:
                                            currentStep > i
                                                ? "var(--accent-purple)"
                                                : "var(--text-muted)",
                                        fontSize: "0.8rem",
                                    }}
                                >
                                    →
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Preset Buttons */}
                <div
                    style={{
                        display: "flex",
                        gap: "0.75rem",
                        marginBottom: "1.5rem",
                        flexWrap: "wrap",
                    }}
                >
                    <span
                        style={{
                            fontSize: "0.8rem",
                            color: "var(--text-muted)",
                            alignSelf: "center",
                        }}
                    >
                        Quick Presets:
                    </span>
                    {PRESETS.map((p, i) => (
                        <button
                            key={i}
                            onClick={() => applyPreset(p)}
                            className="btn-secondary"
                            style={{
                                padding: "0.5rem 1rem",
                                fontSize: "0.8rem",
                                cursor: "pointer",
                            }}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Input Form */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr auto",
                        gap: "1rem",
                        marginBottom: "1rem",
                    }}
                >
                    <div>
                        <label
                            style={{
                                fontSize: "0.75rem",
                                color: "var(--text-muted)",
                                display: "block",
                                marginBottom: "0.4rem",
                            }}
                        >
                            Client Agent Name
                        </label>
                        <input
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            placeholder="ClientBot"
                            style={{
                                width: "100%",
                                padding: "0.75rem 1rem",
                                background: "var(--bg-card)",
                                border: "1px solid var(--border)",
                                borderRadius: "var(--radius-xs)",
                                color: "var(--text-primary)",
                                fontSize: "0.9rem",
                                outline: "none",
                            }}
                        />
                    </div>
                    <div>
                        <label
                            style={{
                                fontSize: "0.75rem",
                                color: "var(--text-muted)",
                                display: "block",
                                marginBottom: "0.4rem",
                            }}
                        >
                            Skill Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "0.75rem 1rem",
                                background: "var(--bg-card)",
                                border: "1px solid var(--border)",
                                borderRadius: "var(--radius-xs)",
                                color: "var(--text-primary)",
                                fontSize: "0.9rem",
                                outline: "none",
                            }}
                        >
                            <option value="research">🔍 Research</option>
                            <option value="code-review">🛡️ Code Review</option>
                            <option value="writing">✍️ Writing</option>
                            <option value="data">📊 Data Analysis</option>
                        </select>
                    </div>
                    <div style={{ alignSelf: "end" }}>
                        <button
                            onClick={runDemo}
                            disabled={loading || !taskInput}
                            className="btn-primary"
                            style={{
                                padding: "0.75rem 2rem",
                                cursor: loading || !taskInput ? "not-allowed" : "pointer",
                                opacity: loading || !taskInput ? 0.5 : 1,
                            }}
                        >
                            {loading ? "⏳ Running..." : "🚀 Hire Agent"}
                        </button>
                    </div>
                </div>

                <div style={{ marginBottom: "2rem" }}>
                    <label
                        style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            display: "block",
                            marginBottom: "0.4rem",
                        }}
                    >
                        Task Description
                    </label>
                    <textarea
                        value={taskInput}
                        onChange={(e) => setTaskInput(e.target.value)}
                        placeholder="Describe the task you want the freelancer agent to perform..."
                        rows={4}
                        style={{
                            width: "100%",
                            padding: "0.75rem 1rem",
                            background: "var(--bg-card)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-xs)",
                            color: "var(--text-primary)",
                            fontSize: "0.9rem",
                            outline: "none",
                            resize: "vertical",
                            fontFamily: "inherit",
                        }}
                    />
                </div>

                {/* Error */}
                {error && (
                    <div
                        style={{
                            padding: "1rem",
                            background: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            borderRadius: "var(--radius-sm)",
                            color: "var(--accent-red)",
                            marginBottom: "2rem",
                        }}
                    >
                        ❌ {error}
                    </div>
                )}

                {/* Results */}
                {result && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        {/* Success Banner */}
                        <div
                            style={{
                                padding: "1.25rem",
                                background: "rgba(16, 185, 129, 0.08)",
                                border: "1px solid rgba(16, 185, 129, 0.3)",
                                borderRadius: "var(--radius)",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "1.1rem",
                                    fontWeight: 700,
                                    color: "var(--accent-green)",
                                    marginBottom: "0.5rem",
                                }}
                            >
                                ✅ {result.message}
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    gap: "1.5rem",
                                    flexWrap: "wrap",
                                    fontSize: "0.8rem",
                                    color: "var(--text-secondary)",
                                }}
                            >
                                <span>
                                    💰 <strong>{result.payment.amount}</strong>
                                </span>
                                <span>
                                    🤖 {result.transaction.client} → {result.transaction.freelancer}
                                </span>
                                <span>
                                    🧠 {result.result.model}
                                </span>
                                <span
                                    style={{
                                        fontFamily: "'JetBrains Mono', monospace",
                                        fontSize: "0.7rem",
                                    }}
                                >
                                    🔗 {result.transaction.tx_hash.slice(0, 18)}...
                                </span>
                            </div>
                        </div>

                        {/* Flow Steps */}
                        <div className="skill-card">
                            <h3
                                style={{
                                    fontSize: "1rem",
                                    fontWeight: 700,
                                    marginBottom: "1rem",
                                }}
                            >
                                📋 Execution Flow
                            </h3>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.5rem",
                                }}
                            >
                                {result.flow.map((step, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            padding: "0.5rem 0.75rem",
                                            background: "rgba(139, 92, 246, 0.05)",
                                            borderRadius: "var(--radius-xs)",
                                            fontSize: "0.8rem",
                                            borderLeft: "3px solid var(--accent-purple)",
                                        }}
                                    >
                                        {step}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AI Output */}
                        <div className="skill-card">
                            <h3
                                style={{
                                    fontSize: "1rem",
                                    fontWeight: 700,
                                    marginBottom: "1rem",
                                }}
                            >
                                🧠 AI-Generated Output
                            </h3>
                            <div
                                className="code-block"
                                style={{
                                    maxHeight: 400,
                                    overflow: "auto",
                                    whiteSpace: "pre-wrap",
                                    fontSize: "0.8rem",
                                    lineHeight: 1.6,
                                }}
                            >
                                {result.result.output}
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "1rem",
                            }}
                        >
                            <div className="skill-card">
                                <h3
                                    style={{
                                        fontSize: "0.9rem",
                                        fontWeight: 700,
                                        marginBottom: "0.75rem",
                                    }}
                                >
                                    💰 Payment Details
                                </h3>
                                <div style={{ fontSize: "0.8rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                    <div>
                                        <span style={{ color: "var(--text-muted)" }}>Protocol:</span>{" "}
                                        <strong>{result.payment.protocol}</strong>
                                    </div>
                                    <div>
                                        <span style={{ color: "var(--text-muted)" }}>Amount:</span>{" "}
                                        <strong style={{ color: "var(--accent-green)" }}>{result.payment.amount}</strong>
                                    </div>
                                    <div>
                                        <span style={{ color: "var(--text-muted)" }}>From:</span> {result.payment.from}
                                    </div>
                                    <div>
                                        <span style={{ color: "var(--text-muted)" }}>To:</span> {result.payment.to}
                                    </div>
                                    <div>
                                        <span style={{ color: "var(--text-muted)" }}>Network:</span> {result.transaction.network}
                                    </div>
                                </div>
                            </div>

                            <div className="skill-card">
                                <h3
                                    style={{
                                        fontSize: "0.9rem",
                                        fontWeight: 700,
                                        marginBottom: "0.75rem",
                                    }}
                                >
                                    📊 Transaction
                                </h3>
                                <div style={{ fontSize: "0.8rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                    <div>
                                        <span style={{ color: "var(--text-muted)" }}>Status:</span>{" "}
                                        <span className={`tx-status ${result.transaction.status}`}>
                                            {result.transaction.status}
                                        </span>
                                    </div>
                                    <div>
                                        <span style={{ color: "var(--text-muted)" }}>Skill:</span>{" "}
                                        {result.transaction.skill}
                                    </div>
                                    <div>
                                        <span style={{ color: "var(--text-muted)" }}>Category:</span>{" "}
                                        {result.transaction.category}
                                    </div>
                                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", wordBreak: "break-all" }}>
                                        <span style={{ color: "var(--text-muted)" }}>Tx:</span>{" "}
                                        {result.transaction.tx_hash}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}
