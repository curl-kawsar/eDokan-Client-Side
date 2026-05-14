"use client";

import { type FormEvent, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import {
  INVOICE_STATUS_BN,
  invoiceStatusBadgeVariant,
  invoiceStatusLabel,
  jobStatusLabel,
} from "@/lib/status-ui";
import type { Invoice } from "@/lib/types";
import { formatDate, formatDateTime, formatTaka } from "@/lib/utils";

const PAYMENT_METHODS = ["cash", "bkash", "nagad", "rocket", "bank", "card", "other"] as const;

const METHOD_BN: Record<(typeof PAYMENT_METHODS)[number], string> = {
  cash: "নগদ",
  bkash: "বিকাশ",
  nagad: "নগাদ",
  rocket: "রকেট",
  bank: "ব্যাংক",
  card: "কার্ড",
  other: "অন্যান্য",
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<(typeof PAYMENT_METHODS)[number]>("cash");

  const { data, isLoading, error } = useQuery({
    queryKey: ["invoices", id],
    queryFn: () => api<Invoice>(`/invoices/${id}`).then((r) => r.data),
    enabled: Boolean(id),
  });

  const addPayment = useMutation({
    mutationFn: () =>
      api<Invoice>(`/invoices/${id}/payments`, {
        method: "POST",
        body: JSON.stringify({
          amount: Number(amount),
          method,
        }),
      }).then((r) => r.data),
    onSuccess: () => {
      toast.success("পেমেন্ট যুক্ত হয়েছে");
      setAmount("");
      queryClient.invalidateQueries({ queryKey: ["invoices", id] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const cancelInvoice = useMutation({
    mutationFn: () =>
      api<Invoice>(`/invoices/${id}/cancel`, { method: "POST" }).then((r) => r.data),
    onSuccess: () => {
      toast.success("ইনভয়েস বাতিল হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["invoices", id] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function onPaySubmit(e: FormEvent) {
    e.preventDefault();
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      toast.error("সঠিক পরিমাণ দিন");
      return;
    }
    addPayment.mutate();
  }

  if (isLoading) {
    return <p className="p-6 text-muted-foreground">লোড হচ্ছে...</p>;
  }
  if (error || !data) {
    return (
      <div className="p-6">
        <p className="text-destructive">ইনভয়েস পাওয়া যায়নি।</p>
        <Button asChild variant="link" className="mt-2 px-0">
          <Link href="/invoices">তালিকায় ফিরে যান</Link>
        </Button>
      </div>
    );
  }

  const canPay = data.status !== "cancelled" && data.status !== "paid" && Number(data.dueAmount) > 0;

  return (
    <>
      <PageHeader
        title={data.invoiceNo}
        description={`গ্রাহক: ${data.customer?.name ?? "-"}`}
        action={
          <div className="flex flex-wrap gap-2">
            {data.status !== "cancelled" && data.status !== "paid" ? (
              <Button
                variant="destructive"
                size="sm"
                disabled={cancelInvoice.isPending}
                onClick={() => {
                  if (window.confirm("ইনভয়েস বাতিল করবেন?")) cancelInvoice.mutate();
                }}
              >
                বাতিল
              </Button>
            ) : null}
            <Button variant="outline" size="sm" asChild>
              <Link href="/invoices">
                <ArrowLeft className="mr-2 h-4 w-4" />
                তালিকা
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
              <CardTitle>স্ট্যাটাস ও টাকা</CardTitle>
              <Badge variant={invoiceStatusBadgeVariant(data.status)}>
                {invoiceStatusLabel(data.status)}
              </Badge>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <span className="text-muted-foreground">মোট</span>
                <p className="font-medium">{formatTaka(data.total)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">পরিশোধিত</span>
                <p className="font-medium">{formatTaka(data.paidAmount)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">বকেয়া</span>
                <p className="font-medium">{formatTaka(data.dueAmount)}</p>
              </div>
              <div className="sm:col-span-3">
                <span className="text-muted-foreground">ইস্যু তারিখ</span>
                <p className="font-medium">{formatDate(data.issueDate)}</p>
              </div>
              {data.jobCard ? (
                <div className="sm:col-span-3 rounded-md border bg-muted/30 p-3">
                  <span className="text-muted-foreground">লিংক করা জব কার্ড</span>
                  <p className="mt-1 font-medium">
                    <Link className="text-primary underline-offset-4 hover:underline" href={`/job-cards/${data.jobCard.id}`}>
                      {data.jobCard.jobNo}
                    </Link>
                    <span className="text-muted-foreground"> · </span>
                    <span>{jobStatusLabel(data.jobCard.status)}</span>
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {data.payments?.length ? (
            <Card>
              <CardHeader>
                <CardTitle>পেমেন্ট ইতিহাস</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>তারিখ</TableHead>
                      <TableHead>পরিমাণ</TableHead>
                      <TableHead>মাধ্যম</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{formatDateTime(p.paidAt)}</TableCell>
                        <TableCell>{formatTaka(p.amount)}</TableCell>
                        <TableCell>{METHOD_BN[p.method as keyof typeof METHOD_BN] ?? p.method}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : null}

          {canPay ? (
            <Card>
              <CardHeader>
                <CardTitle>নতুন পেমেন্ট</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="flex max-w-md flex-col gap-4 sm:flex-row sm:items-end" onSubmit={onPaySubmit}>
                  <div className="flex-1 space-y-2">
                    <Label>পরিমাণ</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={`সর্বোচ্চ ${data.dueAmount}`}
                    />
                  </div>
                  <div className="w-full space-y-2 sm:w-40">
                    <Label>মাধ্যম</Label>
                    <Select value={method} onValueChange={(v) => setMethod(v as (typeof PAYMENT_METHODS)[number])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((m) => (
                          <SelectItem key={m} value={m}>
                            {METHOD_BN[m]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={addPayment.isPending}>
                    {addPayment.isPending ? "..." : "যুক্ত করুন"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : null}
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
