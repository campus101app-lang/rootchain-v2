import "../scripts/load-env.mjs";
import {
  bootstrapEscrowUsdc,
  ensureTestnetIssuerFunded,
  getUsdcBalance,
} from "../src/stellar/testnet-liquidity.js";
import { escrowPublicKey } from "../src/stellar/escrow.js";

async function main() {
  await ensureTestnetIssuerFunded();
  const pk = escrowPublicKey();
  console.log("Escrow USDC before:", await getUsdcBalance(pk));
  await bootstrapEscrowUsdc();
  console.log("Escrow USDC after:", await getUsdcBalance(pk));
}

main().catch(console.error);
