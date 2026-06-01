import {
  Asset,
  BASE_FEE,
  Keypair,
  Memo,
  Operation,
  TransactionBuilder,
  Horizon,
} from "@stellar/stellar-sdk";
import {
  horizonUrl,
  networkPassphraseConst,
  USDC_CODE,
  usdcIssuer,
} from "./config.js";
import { escrowPublicKey } from "./escrow.js";

const server = () => new Horizon.Server(horizonUrl());

export function projectMemo(projectId: string): string {
  const short = projectId.replace(/-/g, "").slice(0, 12);
  return `RC${short}`;
}

export async function sendUsdcPayment(params: {
  fromSecret: string;
  amount: string;
  memo: string;
  destination?: string;
}): Promise<{ hash: string }> {
  const dest = params.destination ?? escrowPublicKey();
  const kp = Keypair.fromSecret(params.fromSecret);
  const usdc = new Asset(USDC_CODE, usdcIssuer());
  const account = await server().loadAccount(kp.publicKey());

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: networkPassphraseConst(),
  })
    .addOperation(
      Operation.payment({
        destination: dest,
        asset: usdc,
        amount: params.amount,
      }),
    )
    .addMemo(Memo.text(params.memo.slice(0, 28)))
    .setTimeout(180)
    .build();

  tx.sign(kp);
  const result = await server().submitTransaction(tx);
  return { hash: result.hash };
}

export async function verifyUsdcPayment(params: {
  txHash: string;
  fromPublicKey: string;
  amount: string;
  memo: string;
}): Promise<boolean> {
  const tx = await server().transactions().transaction(params.txHash).call();
  if (!tx.successful) return false;

  const memoOk = tx.memo_type === "text" && (tx.memo ?? "").startsWith(params.memo.slice(0, 28));
  if (!memoOk) return false;

  const payments = await server().payments().forTransaction(params.txHash).call();
  const dest = escrowPublicKey();

  return payments.records.some((p) => {
    if (p.type !== "payment") return false;
    return (
      "asset_code" in p &&
      p.asset_code === USDC_CODE &&
      p.asset_issuer === usdcIssuer() &&
      p.from === params.fromPublicKey &&
      p.to === dest &&
      Number(p.amount) >= Number(params.amount)
    );
  });
}
