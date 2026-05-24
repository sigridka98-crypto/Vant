import { PaymentStatusCard } from "@/components/payments/payment-status-card";

type WalletCancelPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function WalletCancelPage({ searchParams }: WalletCancelPageProps) {
  const params = await searchParams;

  return (
    <PaymentStatusCard
      variant="cancel"
      title="The coin top-up was cancelled."
      description={
        params.message ||
        "No wallet value was added. You can return to the wallet and try Stripe or Paystack again when you are ready."
      }
      primaryHref="/wallet"
      primaryLabel="Back to wallet"
      secondaryHref="/dashboard"
      secondaryLabel="Back to dashboard"
    />
  );
}
