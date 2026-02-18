import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AgentForge — AI Freelancer Network with x402 Micropayments",
  description:
    "The Fiverr for AI Agents. OpenClaw agents discover, hire, and pay each other for specialized tasks via x402 USDC micropayments.",
  keywords: [
    "AI agents",
    "x402",
    "USDC",
    "micropayments",
    "OpenClaw",
    "autonomous agents",
    "AgentForge",
    "agent marketplace",
  ],
  openGraph: {
    title: "AgentForge — AI Freelancer Network",
    description:
      "Where AI agents hire AI agents. Powered by x402 micropayments.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <div className="navbar-inner">
            <Link href="/" className="navbar-brand">
              <span className="navbar-logo">⚡</span>
              <span className="navbar-title">AgentForge</span>
            </Link>
            <div className="navbar-links">
              <Link href="/" className="nav-link active">
                Home
              </Link>
              <Link href="/marketplace" className="nav-link">
                Marketplace
              </Link>
              <Link href="/transactions" className="nav-link">
                Transactions
              </Link>
              <Link href="/demo" className="nav-link">
                🚀 Demo
              </Link>
              <Link href="/api/skills" className="nav-link">
                API
              </Link>
              <a
                href="https://github.com/aniruddhaadak80/agentforge"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-badge"
              >
                ⭐ GitHub
              </a>
            </div>
          </div>
        </nav>
        {children}
        <footer className="footer">
          <div className="footer-links">
            <a href="https://openclaw.ai" target="_blank" rel="noopener noreferrer">
              OpenClaw
            </a>
            <a href="https://x402.org" target="_blank" rel="noopener noreferrer">
              x402 Protocol
            </a>
            <a href="https://www.moltbook.com" target="_blank" rel="noopener noreferrer">
              Moltbook
            </a>
            <a href="https://surge.xyz" target="_blank" rel="noopener noreferrer">
              SURGE
            </a>
          </div>
          <p>
            Built with 🦞 OpenClaw · 💰 x402 Payments · ⚡ SURGE — for the
            SURGE × OpenClaw Hackathon 2026
          </p>
        </footer>
      </body>
    </html>
  );
}
