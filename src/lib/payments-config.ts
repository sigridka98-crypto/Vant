import type { CoinTopUpPack, CreditBundle } from "@/types";

export const MAX_WALLET_COINS = 100;

export const creditBundles: CreditBundle[] = [
  {
    id: "bundle-50",
    coins: 50,
    priceLabel: "50 coins",
    amountKobo: 312500,
    paystackAmountKobo: 312500,
    paystackPriceLabel: "NGN 3,125",
    diamondsBonus: 12
  }
];

export const topUpPack: CoinTopUpPack = {
  id: "coin-pack-50",
  name: "50 Coin Access Pack",
  priceLabel: "NGN 3,125",
  amountKobo: 312500,
  billingLabel: "one-time top-up",
  description: "A one-time 50 coin top-up that users spend across admin-priced locked update cards, with a wallet limit of 100 coins at a time.",
  features: [
    "50 coins added after successful payment",
    "Users can hold up to 100 coins at once",
    "Admin sets card prices in coins",
    "Each locked card deducts its own coin amount",
    "Users top up again when their balance runs low"
  ]
};
