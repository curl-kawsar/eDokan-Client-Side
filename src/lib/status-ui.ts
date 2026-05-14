import type { VariantProps } from "class-variance-authority";
import type { badgeVariants } from "@/components/ui/badge";
import type { Invoice, JobCard } from "@/lib/types";

export type StatusBadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export const JOB_STATUS_BN: Record<JobCard["status"], string> = {
  pending: "অপেক্ষমান",
  in_progress: "চলমান",
  completed: "সম্পন্ন",
  delivered: "ডেলিভারি",
  cancelled: "বাতিল",
};

export const INVOICE_STATUS_BN: Record<Invoice["status"], string> = {
  draft: "ড্রাফট",
  unpaid: "বকেয়া",
  partial: "আংশিক",
  paid: "পরিশোধিত",
  cancelled: "বাতিল",
};

export function jobStatusBadgeVariant(status: JobCard["status"]): StatusBadgeVariant {
  switch (status) {
    case "pending":
      return "secondary";
    case "in_progress":
      return "default";
    case "completed":
    case "delivered":
      return "success";
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
}

export function invoiceStatusBadgeVariant(status: Invoice["status"]): StatusBadgeVariant {
  switch (status) {
    case "draft":
      return "outline";
    case "unpaid":
    case "partial":
      return "warning";
    case "paid":
      return "success";
    case "cancelled":
      return "destructive";
    default:
      return "secondary";
  }
}

export function jobStatusLabel(status: string): string {
  return JOB_STATUS_BN[status as JobCard["status"]] ?? status;
}

export function invoiceStatusLabel(status: string): string {
  return INVOICE_STATUS_BN[status as Invoice["status"]] ?? status;
}
