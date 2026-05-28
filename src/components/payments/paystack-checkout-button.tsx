"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    Paystack?: new () => {
      resumeTransaction: (
        accessCode: string,
        options?: {
          onSuccess?: (transaction: { reference: string }) => void;
          onCancel?: () => void;
          onLoad?: () => void;
          onError?: (error: { message?: string }) => void;
        }
      ) => void;
    };
  }
}

type PaystackCheckoutButtonProps =
  {
    flow: "wallet";
    bundleId: string;
    className: string;
    label: string;
  };

export function PaystackCheckoutButton(props: PaystackCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptReady, setIsScriptReady] = useState(false);
  const [error, setError] = useState("");

  const ensurePaystackLoaded = async (timeoutMs = 2500) => {
    if (typeof window === "undefined") {
      throw new Error("Paystack checkout is unavailable on the server.");
    }

    if (window.Paystack) {
      setIsScriptReady(true);
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-paystack-inline="true"]'
    );

    await new Promise<void>((resolve, reject) => {
      let settled = false;
      let timeoutId: number | undefined;

      const finish = (callback: () => void) => {
        if (settled) {
          return;
        }

        settled = true;
        if (timeoutId) {
          window.clearTimeout(timeoutId);
        }
        callback();
      };

      const handleSuccess = () => {
        if (window.Paystack) {
          finish(() => {
            setIsScriptReady(true);
            resolve();
          });
        } else {
          finish(() => reject(new Error("Paystack checkout did not finish loading.")));
        }
      };

      const handleError = () => {
        finish(() => reject(new Error("Unable to load Paystack checkout right now.")));
      };

      timeoutId = window.setTimeout(() => {
        finish(() => reject(new Error("Paystack popup did not load in time.")));
      }, timeoutMs);

      if (existingScript) {
        existingScript.addEventListener("load", handleSuccess, { once: true });
        existingScript.addEventListener("error", handleError, { once: true });
        if (window.Paystack) {
          handleSuccess();
        }

        return;
      }

      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v2/inline.js";
      script.async = true;
      script.dataset.paystackInline = "true";
      script.addEventListener("load", handleSuccess, { once: true });
      script.addEventListener("error", handleError, { once: true });
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.Paystack) {
      setIsScriptReady(true);
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-paystack-inline="true"]'
    );

    if (existingScript) {
      const handleExistingLoad = () => {
        if (window.Paystack) {
          setIsScriptReady(true);
        }
      };

      existingScript.addEventListener("load", handleExistingLoad);

      return () => {
        existingScript.removeEventListener("load", handleExistingLoad);
      };
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v2/inline.js";
    script.async = true;
    script.dataset.paystackInline = "true";
    script.onload = () => {
      if (window.Paystack) {
        setIsScriptReady(true);
      }
    };
    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, []);

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

      if (!response.ok || !result.ok || !result.accessCode) {
        throw new Error(result.message || "Unable to start Paystack checkout.");
      }

      try {
        await ensurePaystackLoaded();
      } catch {
        if (result.authorizationUrl) {
          window.location.href = result.authorizationUrl;
          return;
        }
      }

      if (!window.Paystack) {
        throw new Error("Paystack popup is unavailable right now.");
      }

      const popup = new window.Paystack();

      popup.resumeTransaction(result.accessCode, {
        onSuccess: (transaction) => {
          window.location.href = `/api/paystack/callback?reference=${encodeURIComponent(transaction.reference)}`;
        },
        onCancel: () => {
          window.location.href = "/wallet/cancel";
        },
        onError: (popupError) => {
          setError(popupError.message || "Unable to continue Paystack checkout.");
          setIsLoading(false);
        }
      });
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
        {isLoading ? "Opening Paystack..." : isScriptReady ? props.label : `${props.label}`}
      </button>
      {!isScriptReady && !error ? (
        <p className="mt-3 text-sm text-text-secondary">
          Loading secure Paystack checkout...
        </p>
      ) : null}
      {error ? <p className="mt-3 text-sm text-rose-100">{error}</p> : null}
    </div>
  );
}
