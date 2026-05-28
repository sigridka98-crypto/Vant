"use client";

import { useState } from "react";

type PaystackCheckoutButtonProps =
  {
    flow: "wallet";
    bundleId: string;
    className: string;
    label: string;
  };

export function PaystackCheckoutButton(props: PaystackCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ flow: "wallet", bundleId: props.bundleId })
      });

      const raw = await response.text();
      const result = (raw ? JSON.parse(raw) : {}) as {
        ok?: boolean;
        message?: string;
        accessCode?: string;
        reference?: string;
        authorizationUrl?: string;
      };

      if (!response.ok || !result.ok || !result.authorizationUrl) {
        throw new Error(result.message || "Unable to start Paystack checkout.");
      }

      window.location.href = result.authorizationUrl;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to start Paystack checkout.");
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className={props.className}
      >
        {isLoading ? "Opening Paystack..." : props.label}
      </button>
      {error ? <p className="mt-3 text-sm text-rose-100">{error}</p> : null}
    </div>
  );
}
