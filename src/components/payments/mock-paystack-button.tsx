"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type MockPaystackButtonProps = {
  label: string;
  successHref: string;
  cancelHref: string;
  className: string;
};

export function MockPaystackButton({
  label,
  successHref,
  cancelHref,
  className
}: MockPaystackButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    window.setTimeout(() => {
      const shouldSucceed = window.confirm(
        "Mock Paystack flow: press OK to simulate a successful payment, or Cancel to simulate a cancelled checkout."
      );

      router.push(shouldSucceed ? successHref : cancelHref);
    }, 450);
  };

  return (
    <button type="button" onClick={handleClick} disabled={isLoading} className={className}>
      {isLoading ? "Opening Paystack..." : label}
    </button>
  );
}
