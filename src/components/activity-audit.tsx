"use client";

import type { ActivityLog } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

const ACTION_BN: Record<string, string> = {
  created: "তৈরি",
  updated: "আপডেট",
  status_changed: "স্ট্যাটাস পরিবর্তন",
  deleted: "মুছে ফেলা",
  payment_received: "পেমেন্ট",
  cancelled: "বাতিল",
};

export function ActivityAudit({ activities }: { activities: ActivityLog[] | undefined }) {
  if (!activities?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        এখনো কোনো কার্যকলাপ নেই। স্ট্যাটাস বদলানো, আপডেট বা পেমেন্ট করলে এখানে দেখাবে।
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {activities.map((a) => (
        <li
          key={a.id}
          className="flex flex-col gap-0.5 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-medium text-foreground">
              {a.summary ?? ACTION_BN[a.action] ?? a.action}
            </span>
            <span className="text-xs text-muted-foreground">{formatDateTime(a.createdAt)}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {a.user?.name ?? "অজানা ব্যবহারকারী"}
            {a.user?.role ? ` · ${a.user.role}` : ""}
          </div>
        </li>
      ))}
    </ul>
  );
}
