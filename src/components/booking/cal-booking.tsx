"use client";

import { useEffect } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";

export function CalBooking({ calLink }: { calLink: string }) {
  useEffect(() => {
    (async () => {
      const cal = await getCalApi();
      cal("ui", {
        theme: "dark",
        cssVarsPerTheme: {
          dark: { "cal-brand": "#2ecc71" },
          light: { "cal-brand": "#2ecc71" },
        },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-line/70 bg-navy/40">
      <Cal
        calLink={calLink}
        style={{ width: "100%", height: "100%", minHeight: "640px" }}
        config={{ theme: "dark", layout: "month_view" }}
      />
    </div>
  );
}
