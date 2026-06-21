import { PaymentStatusCard } from "@/components/payments/payment-status-card";

type WalletSuccessPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function WalletSuccessPage({ searchParams }: WalletSuccessPageProps) {
  const params = await searchParams;

  return (
    <PaymentStatusCard
      variant="success"
      title="Your coin top-up was completed successfully."
      description={
        params.message ||
        "Your payment was verified on the server and the matching coins were added to your wallet."
      }
      primaryHref="/wallet"
      primaryLabel="Return to wallet"
      secondaryHref="/dashboard"
      secondaryLabel="Browse update cards"
    />
  );
}
