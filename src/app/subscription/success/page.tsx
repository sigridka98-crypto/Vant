import { PaymentStatusCard } from "@/components/payments/payment-status-card";

type SubscriptionSuccessPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function SubscriptionSuccessPage({
  searchParams
}: SubscriptionSuccessPageProps) {
  const params = await searchParams;

  return (
    <PaymentStatusCard
      variant="success"
      title="Your subscription was activated successfully."
      description={
        params.message ||
        "Your Paystack subscription payment was verified on the server and full access has been enabled for your account."
      }
      primaryHref="/subscription"
      primaryLabel="Return to subscription"
      secondaryHref="/dashboard"
      secondaryLabel="Go to dashboard"
    />
  );
}
