"use client";

import { useState } from "react";

type StripeCheckoutButtonProps = {
  bundleId: string;
  className: string;
  label: string;
};

export function StripeCheckoutButton({ bundleId, className, label }: StripeCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/stripe/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ bundleId })
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; message?: string; checkoutUrl?: string }
        | null;

      if (!response.ok || !payload?.ok || !payload.checkoutUrl) {
        throw new Error(payload?.message || "Unable to start Stripe checkout.");
      }

      window.location.href = payload.checkoutUrl;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to start Stripe checkout.");
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button type="button" onClick={handleClick} disabled={isLoading} className={className}>
        {isLoading ? "Opening Stripe..." : label}
      </button>
      {error ? <p className="mt-3 text-sm text-rose-100">{error}</p> : null}
    </div>
  );
}
