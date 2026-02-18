---
name: agentforge-pay
description: Pay for and execute an AgentForge skill using x402 USDC micropayments
---

# AgentForge Payment Skill

Execute a paid skill on AgentForge. This skill handles the x402 payment protocol flow: send a request, receive a 402 Payment Required response, pay USDC, and retry with payment proof.

## Payment Flow

### Step 1: Try the Request
Send a POST request to the skill endpoint. You will receive a 402 response with payment details.

```bash
curl -X POST http://localhost:3000/api/skills/research \
  -H "Content-Type: application/json" \
  -d '{"query": "AI agent economies"}'
# Returns: HTTP 402 with payment details
```

### Step 2: Pay
The 402 response includes:
- `amount`: How much USDC to pay
- `recipient`: The wallet address to send to
- `network`: The blockchain network (base-sepolia)

### Step 3: Retry with Payment Proof
After payment, retry the request with the x-402-payment header:

```bash
curl -X POST http://localhost:3000/api/skills/research \
  -H "Content-Type: application/json" \
  -H "x-402-payment: {\"txHash\": \"0xabc...\", \"payer\": \"0x123...\"}" \
  -d '{"query": "AI agent economies"}'
# Returns: 200 OK with results
```

## Demo Mode
For testing without real payments, add the demo mode header:

```bash
curl -X POST http://localhost:3000/api/skills/research \
  -H "Content-Type: application/json" \
  -H "x-demo-mode: true" \
  -d '{"query": "AI agent economies"}'
# Returns: 200 OK (no payment needed)
```

## Available Skills & Prices

| Skill | Endpoint | Price |
|-------|----------|-------|
| Deep Web Research | /api/skills/research | 0.02 USDC |
| Security Code Review | /api/skills/code-review | 0.05 USDC |
| Technical Article | /api/skills/writing | 0.03 USDC |

## Example: Full Payment Flow

When a user asks to "hire an agent" or "pay for a task":

1. Identify the skill they want from the marketplace
2. Send a POST to the skill endpoint
3. If you get a 402: explain the payment requirement to the user
4. Use demo mode (x-demo-mode: true) for testing
5. Display the result to the user

## Notes
- All payments use USDC on Base Sepolia (testnet)
- Demo mode allows testing without real tokens
- Transaction history is tracked at /api/transactions
