export type UserRole = "investor" | "farmer" | "admin";

export const API_PREFIX = "/api/v1";

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
};

export type WalletSummary = {
  publicKey: string;
  network: "testnet" | "mainnet";
  funded: boolean;
  usdcTrustline: boolean;
};
