// AgentForge — Wallet Utilities
// Handles wallet creation, USDC transfers, and x402 payment verification on Base Sepolia

import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

// Base Sepolia RPC
const BASE_SEPOLIA_RPC = "https://sepolia.base.org";
const USDC_ADDRESS =
  process.env.NEXT_PUBLIC_USDC_ADDRESS ||
  "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

// Minimal ERC-20 ABI for USDC
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

export function getProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
}

export function getWallet(): ethers.Wallet {
  const privateKey = process.env.WALLET_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("WALLET_PRIVATE_KEY not set in .env.local");
  }
  return new ethers.Wallet(privateKey, getProvider());
}

export function getUSDCContract(
  signerOrProvider?: ethers.Signer | ethers.Provider
): ethers.Contract {
  const provider = signerOrProvider || getProvider();
  return new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
}

/** Generate a new random wallet and return address + private key */
export function generateWallet(): { address: string; privateKey: string } {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
}

/** Auto-generate wallet if not set in .env.local */
export function ensureWallet(): { address: string; privateKey: string } {
  if (process.env.WALLET_PRIVATE_KEY && process.env.WALLET_ADDRESS) {
    return {
      address: process.env.WALLET_ADDRESS,
      privateKey: process.env.WALLET_PRIVATE_KEY,
    };
  }

  const wallet = generateWallet();
  console.log("🔑 Generated new wallet:");
  console.log(`   Address: ${wallet.address}`);
  console.log(
    `   Get test USDC: https://faucet.circle.com (paste address above)`
  );

  // Try to update .env.local
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    let envContent = "";
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf-8");
    }
    envContent = envContent.replace(
      /WALLET_PRIVATE_KEY=.*/,
      `WALLET_PRIVATE_KEY=${wallet.privateKey}`
    );
    envContent = envContent.replace(
      /WALLET_ADDRESS=.*/,
      `WALLET_ADDRESS=${wallet.address}`
    );
    fs.writeFileSync(envPath, envContent);
  } catch {
    // Silently ignore if we can't write
  }

  return wallet;
}

/** Get USDC balance for an address */
export async function getUSDCBalance(address: string): Promise<string> {
  const contract = getUSDCContract();
  const balance = await contract.balanceOf(address);
  const decimals = await contract.decimals();
  return ethers.formatUnits(balance, decimals);
}

/** Transfer USDC to an address */
export async function transferUSDC(
  to: string,
  amountUSDC: string
): Promise<string> {
  const wallet = getWallet();
  const contract = getUSDCContract(wallet);
  const decimals = await contract.decimals();
  const amount = ethers.parseUnits(amountUSDC, decimals);
  const tx = await contract.transfer(to, amount);
  const receipt = await tx.wait();
  return receipt.hash;
}

/** Verify a payment transaction on-chain */
export async function verifyPayment(
  txHash: string,
  expectedTo: string,
  expectedAmountUSDC: string
): Promise<boolean> {
  try {
    const provider = getProvider();
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt || receipt.status !== 1) return false;

    // Check if USDC transfer log exists
    const contract = getUSDCContract();
    const decimals = await contract.decimals();
    const expectedAmount = ethers.parseUnits(expectedAmountUSDC, decimals);

    // Parse transfer events
    const iface = new ethers.Interface([
      "event Transfer(address indexed from, address indexed to, uint256 value)",
    ]);

    for (const log of receipt.logs) {
      try {
        const parsed = iface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });
        if (
          parsed &&
          parsed.name === "Transfer" &&
          parsed.args.to.toLowerCase() === expectedTo.toLowerCase() &&
          parsed.args.value >= expectedAmount
        ) {
          return true;
        }
      } catch {
        continue;
      }
    }
    return false;
  } catch {
    return false;
  }
}
