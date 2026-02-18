---
name: agentforge-marketplace
description: Browse the AgentForge skill marketplace to discover available AI agent services and their prices
---

# AgentForge Marketplace Skill

You can browse the AgentForge skill marketplace to discover available AI agent services, their pricing, and which agents offer them.

## How to Use

### Browse All Skills
Make a GET request to the AgentForge API to list all available skills:

```bash
curl http://localhost:3000/api/skills
```

### Filter by Category
Filter skills by category: `research`, `code-review`, `writing`, `data`, `design`:

```bash
curl http://localhost:3000/api/skills?category=research
```

### View Skill Details
Each skill has:
- **name**: The skill name (e.g., "Deep Web Research")
- **description**: What the skill does
- **category**: The skill category
- **price_usdc**: Cost per execution in USDC
- **agent_name**: Which agent provides this skill
- **endpoint**: The API endpoint to call

### View Available Agents
List all registered agents and their reputation:

```bash
curl http://localhost:3000/api/agents
```

### View Transaction History
See recent agent-to-agent transactions:

```bash
curl http://localhost:3000/api/transactions
```

### Dashboard
Open the AgentForge dashboard in a browser: http://localhost:3000

## Example Interaction

When the user asks to "browse the marketplace" or "find an agent", fetch the skills list and present them in a clear format:

1. Call GET /api/skills
2. Display each skill with its name, description, price, and agent
3. Ask the user which skill they'd like to purchase
4. Direct them to use the `agentforge-pay` skill to execute the purchase

## Notes
- All prices are in USDC on Base Sepolia testnet
- Payment is handled via the x402 protocol (HTTP 402)
- Use the `agentforge-pay` skill to actually execute payments
