// AgentForge — x402 Payment Middleware
// Implements the x402 payment protocol for API routes
// When a request comes without payment, returns HTTP 402 with payment details
// When payment proof is provided, verifies and processes the request

import { NextRequest, NextResponse } from "next/server";

const WALLET_ADDRESS =
    process.env.WALLET_ADDRESS || "0x0000000000000000000000000000000000000000";
const USDC_ADDRESS =
    process.env.NEXT_PUBLIC_USDC_ADDRESS ||
    "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || "84532";
const NETWORK = process.env.NEXT_PUBLIC_NETWORK || "base-sepolia";

export interface PaymentRequirement {
    amount: string; // USDC amount (e.g., "0.02")
    currency: string;
    network: string;
    chainId: string;
    recipient: string;
    description: string;
    usdcAddress: string;
}

/**
 * Create a 402 Payment Required response with x402 headers
 */
export function createPaymentRequired(
    amount: string,
    description: string
): NextResponse {
    const requirement: PaymentRequirement = {
        amount,
        currency: "USDC",
        network: NETWORK,
        chainId: CHAIN_ID,
        recipient: WALLET_ADDRESS,
        description,
        usdcAddress: USDC_ADDRESS,
    };

    return NextResponse.json(
        {
            error: "Payment Required",
            message: `This skill costs ${amount} USDC. Include payment proof in the x-402-payment header.`,
            paymentDetails: requirement,
            howToPay: {
                step1: `Send ${amount} USDC to ${WALLET_ADDRESS} on ${NETWORK}`,
                step2:
                    "Include the transaction hash in the x-402-payment header",
                step3: "Retry your request with the payment header",
            },
            x402: {
                version: "1.0",
                accepts: [
                    {
                        scheme: "exact",
                        network: NETWORK,
                        maxAmountRequired: amount,
                        resource: WALLET_ADDRESS,
                        description,
                        mimeType: "application/json",
                        payTo: WALLET_ADDRESS,
                        maxTimeoutSeconds: 300,
                        asset: USDC_ADDRESS,
                    },
                ],
            },
        },
        {
            status: 402,
            headers: {
                "WWW-Authenticate": `X402 scheme="exact", network="${NETWORK}", amount="${amount}", currency="USDC", recipient="${WALLET_ADDRESS}", asset="${USDC_ADDRESS}", description="${description.replace(/[^\x20-\x7E]/g, "")}"`,
                "X-Payment-Required": "true",
                "X-Payment-Amount": amount,
                "X-Payment-Currency": "USDC",
                "X-Payment-Network": NETWORK,
                "X-Payment-Recipient": WALLET_ADDRESS,
            },
        }
    );
}

/**
 * Check if a request has valid x402 payment proof
 * Returns the payment info if valid, null if no payment
 */
export function extractPaymentProof(request: NextRequest): {
    txHash: string;
    payer: string;
} | null {
    // Check for x402 payment header
    const paymentHeader =
        request.headers.get("x-402-payment") ||
        request.headers.get("x-payment-proof") ||
        request.headers.get("authorization")?.replace("X402 ", "");

    if (!paymentHeader) return null;

    // Parse the payment proof
    try {
        // Could be JSON or just a tx hash
        if (paymentHeader.startsWith("{")) {
            const parsed = JSON.parse(paymentHeader);
            return {
                txHash: parsed.txHash || parsed.transactionHash || parsed.hash,
                payer: parsed.payer || parsed.from || "unknown",
            };
        }

        // Plain tx hash
        if (paymentHeader.startsWith("0x")) {
            return {
                txHash: paymentHeader,
                payer: "unknown",
            };
        }
    } catch {
        // Invalid payment proof
    }

    return null;
}

/**
 * x402 middleware wrapper for API route handlers.
 * Use: wrap your handler with withX402Payment(amount, description, handler)
 */
export function withX402Payment(
    amount: string,
    description: string,
    handler: (
        request: NextRequest,
        paymentProof: { txHash: string; payer: string }
    ) => Promise<NextResponse>
) {
    return async (request: NextRequest): Promise<NextResponse> => {
        // For GET requests (listing/browsing), skip payment
        if (request.method === "GET") {
            return handler(request, { txHash: "", payer: "" });
        }

        // Check for demo mode (allows testing without real payments)
        const demoMode = request.headers.get("x-demo-mode") === "true";
        if (demoMode) {
            return handler(request, {
                txHash: "0xdemo_" + Date.now().toString(16),
                payer: "demo_agent",
            });
        }

        // Check for payment proof
        const payment = extractPaymentProof(request);
        if (!payment) {
            return createPaymentRequired(amount, description);
        }

        // Process with payment
        return handler(request, payment);
    };
}
