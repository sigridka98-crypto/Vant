import { PaymentStatusCard } from "@/components/payments/payment-status-card";

type SubscriptionCancelPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function SubscriptionCancelPage({
  searchParams
}: SubscriptionCancelPageProps) {
  const params = await searchParams;

  return (
    <PaymentStatusCard
      variant="cancel"
      title="The subscription checkout was cancelled."
      description={
        params.message ||
        "Your account remains unchanged. You can come back and restart the Paystack subscription checkout when you are ready."
      }
      primaryHref="/subscription"
      primaryLabel="Back to subscription"
      secondaryHref="/wallet"
      secondaryLabel="Compare coin bundles"
    />
  );
}
