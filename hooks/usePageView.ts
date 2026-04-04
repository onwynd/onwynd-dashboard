import { useEffect } from "react";
import client from "@/lib/api/client";

/**
 * usePageView
 * ───────────
 * Call this hook at the top of any sensitive dashboard page to automatically
 * record who viewed it and when. Fires once on mount.
 *
 * @param pageKey   A stable identifier e.g. "finance.statements"
 * @param recordId  Optional — when viewing a specific record (e.g. invoice ID)
 * @param recordType Optional — e.g. "App\\Models\\Invoice"
 */
export function usePageView(
  pageKey: string,
  recordId?: number,
  recordType?: string,
): void {
  useEffect(() => {
    client
      .post("/api/v1/page-views", {
        page_key:    pageKey,
        record_id:   recordId ?? null,
        record_type: recordType ?? null,
      })
      .catch(() => {
        // Silent — audit recording should never break the UI
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
