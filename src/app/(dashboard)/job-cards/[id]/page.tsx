"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { ActivityAudit } from "@/components/activity-audit";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { JOB_STATUS_BN, jobStatusBadgeVariant, jobStatusLabel } from "@/lib/status-ui";
import type { JobCard } from "@/lib/types";
import { formatDate, formatTaka } from "@/lib/utils";

const STATUS_ORDER = [
  "pending",
  "in_progress",
  "completed",
  "delivered",
  "cancelled",
] as const;

export default function JobCardDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["job-cards", id],
    queryFn: () => api<JobCard>(`/job-cards/${id}`).then((r) => r.data),
    enabled: Boolean(id),
  });

  const updateStatus = useMutation({
    mutationFn: (status: JobCard["status"]) =>
      api<JobCard>(`/job-cards/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }).then((r) => r.data),
    onSuccess: () => {
      toast.success("স্ট্যাটাস আপডেট হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["job-cards", id] });
      queryClient.invalidateQueries({ queryKey: ["job-cards"] });
      queryClient.invalidateQueries({ queryKey: ["lookup", "job-cards"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return <p className="p-6 text-muted-foreground">লোড হচ্ছে...</p>;
  }
  if (error || !data) {
    return (
      <div className="p-6">
        <p className="text-destructive">জব কার্ড পাওয়া যায়নি।</p>
        <Button asChild variant="link" className="mt-2 px-0">
          <Link href="/job-cards">তালিকায় ফিরে যান</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={data.jobNo}
        description={`গ্রাহক: ${data.customer?.name ?? "-"} · যান: ${data.vehicle?.registrationNo ?? "-"}`}
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/job-cards">
              <ArrowLeft className="mr-2 h-4 w-4" />
              তালিকা
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
              <CardTitle>স্ট্যাটাস</CardTitle>
              <Badge variant={jobStatusBadgeVariant(data.status)}>{jobStatusLabel(data.status)}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>স্ট্যাটাস পরিবর্তন</Label>
                <Select
                  value={data.status}
                  onValueChange={(v) => updateStatus.mutate(v as JobCard["status"])}
                  disabled={updateStatus.isPending}
                >
                  <SelectTrigger className="max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_ORDER.map((s) => (
                      <SelectItem key={s} value={s}>
                        {JOB_STATUS_BN[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>বিবরণ</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <span className="text-muted-foreground">তারিখ</span>
                <p className="font-medium">{formatDate(data.createdAt)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">মোট</span>
                <p className="font-medium">{formatTaka(data.total ?? 0)}</p>
              </div>
              {data.complaint ? (
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground">অভিযোগ</span>
                  <p className="mt-1 whitespace-pre-wrap">{data.complaint}</p>
                </div>
              ) : null}
              {data.diagnosis ? (
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground">ডায়াগনোসিস</span>
                  <p className="mt-1 whitespace-pre-wrap">{data.diagnosis}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit lg:sticky lg:top-4">
          <CardHeader>
            <CardTitle>কার্যকলাপ (অডিট)</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityAudit activities={data.activities} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
