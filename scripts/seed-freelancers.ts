/**
 * Seed Redis with test freelancer profiles and gigs.
 * Run: bun run scripts/seed-freelancers.ts
 */
import { Redis } from "@upstash/redis";
import type { FreelancerProfile, Gig } from "../lib/freelancer-types";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  console.error("❌ Faltan UPSTASH_REDIS_REST_URL o UPSTASH_REDIS_REST_TOKEN en .env");
  process.exit(1);
}

const redis = new Redis({ url, token });
const PREFIX = "freelancer:";

const seedProfiles: FreelancerProfile[] = [
  {
    address: "0x1234567890abcdef1234567890abcdef12345678",
    firstName: "Alex",
    lastName: "Rivers",
    bio: "Senior blockchain engineer specializing in secure smart contract development and cross-chain protocol design. 6+ years building in Web3, with a focus on DeFi and infrastructure tooling.",
    skills: ["Smart Contracts", "Rust", "Solidity", "React", "TypeScript", "DeFi Protocols"],
    gigs: [
      {
        id: "gig-audit-001",
        title: "Smart Contract Audit",
        description: "Full security audit of your Solidity contracts. Includes automated analysis, manual review, and detailed report with remediation steps.",
        price: "2500",
        deliveryTime: "2 weeks",
        tags: ["Solidity", "Security", "DeFi"],
      },
      {
        id: "gig-staking-002",
        title: "Staking Protocol Development",
        description: "Custom staking contract with rewards distribution, emergency pause, and upgradeability. Tested with Foundry.",
        price: "5000",
        deliveryTime: "1 month",
        tags: ["Solidity", "Staking", "Foundry"],
      },
    ],
    hourlyRate: "120",
    settlementFrequency: "Weekly",
    registeredAt: new Date().toISOString(),
  },
  {
    address: "0xabcdef1234567890abcdef1234567890abcdef12",
    firstName: "Satoshi",
    lastName: "Nakamoto",
    bio: "Smart contracts & Web3 developer. 5+ años con Solidity, Rust y auditorías on-chain. Experiencia en DeFi (AMMs, lending, staking) y NFTs.",
    skills: ["Solidity", "Rust", "Foundry", "OpenZeppelin", "ERC-721"],
    gigs: [
      {
        id: "gig-nft-001",
        title: "NFT Collection Smart Contract",
        description: "ERC-721A collection with mint phases, allowlist, and royalty enforcement. Gas-optimized for large drops.",
        price: "1500",
        deliveryTime: "1 week",
        tags: ["NFT", "ERC-721", "Solidity"],
      },
      {
        id: "gig-defi-002",
        title: "DEX Integration",
        description: "Integrate Uniswap V3 or custom AMM into your protocol. Price oracles, swap routing, and liquidity management.",
        price: "3500",
        deliveryTime: "2 weeks",
        tags: ["DeFi", "Uniswap", "AMM"],
      },
    ],
    hourlyRate: "95",
    settlementFrequency: "Weekly",
    registeredAt: new Date().toISOString(),
  },
  {
    address: "0x9876543210fedcba9876543210fedcba98765432",
    firstName: "Maria",
    lastName: "Chen",
    bio: "Full-stack Web3 developer. Frontend (React, Next.js) + backend + smart contracts. End-to-end dApp delivery.",
    skills: ["React", "Next.js", "Solidity", "Ethers.js", "Wagmi"],
    gigs: [
      {
        id: "gig-dapp-001",
        title: "dApp Frontend Development",
        description: "Complete React/Next.js frontend for your Web3 project. Wallet connection, contract interactions, responsive UI.",
        price: "2800",
        deliveryTime: "2 weeks",
        tags: ["React", "Next.js", "Web3"],
      },
      {
        id: "gig-dao-002",
        title: "DAO Governance Module",
        description: "On-chain voting with delegation, proposal creation, and time-locked execution. Compatible with OpenZeppelin Governor.",
        price: "4200",
        deliveryTime: "3 weeks",
        tags: ["Governance", "DAO", "Solidity"],
      },
    ],
    hourlyRate: "85",
    settlementFrequency: "Monthly",
    registeredAt: new Date().toISOString(),
  },
  {
    address: "0xfedcba0987654321fedcba0987654321fedcba09",
    firstName: "Jordan",
    lastName: "Kim",
    bio: "Rust & Substrate specialist. Building parachains and pallets. Former Parity contributor.",
    skills: ["Rust", "Substrate", "Polkadot", "ink!", "WASM"],
    gigs: [
      {
        id: "gig-substrate-001",
        title: "Substrate Pallet Development",
        description: "Custom pallet for your blockchain logic. Storage, extrinsics, events, and unit tests.",
        price: "6000",
        deliveryTime: "1 month",
        tags: ["Substrate", "Rust", "Blockchain"],
      },
    ],
    hourlyRate: "150",
    settlementFrequency: "Real-time / Per block",
    registeredAt: new Date().toISOString(),
  },
];

async function seed() {
  console.log("🌱 Seeding freelancer profiles...\n");

  for (const profile of seedProfiles) {
    const key = `${PREFIX}${profile.address.toLowerCase()}`;
    await redis.set(key, JSON.stringify(profile));
    const name = [profile.firstName, profile.lastName].join(" ");
    const gigCount = profile.gigs.length;
    console.log(`  ✓ ${name} (${profile.address.slice(0, 10)}...) — ${gigCount} gig(s)`);
  }

  console.log("\n✅ Seed completado. Visita /hire para ver los gigs.");
}

seed().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
