"use client";

import { useEffect } from "react";

type AlertSeenTrackerProps = {
  cardId: string;
};

export function AlertSeenTracker({ cardId }: AlertSeenTrackerProps) {
  useEffect(() => {
    void fetch("/api/alerts/seen", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ cardId })
    });
  }, [cardId]);

  return null;
}
