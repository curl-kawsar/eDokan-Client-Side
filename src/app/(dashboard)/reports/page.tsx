"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CalendarRange, DollarSign, Receipt, TrendingDown, TrendingUp, WalletCards } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, qs } from "@/lib/api";
import { bnNumber, formatDate, formatTaka } from "@/lib/utils";

type ReportData = {
  summary: {
    range: { from: string; to: string };
    revenue: number;
    expense: number;
    profit: number;
    totalDue: number;
    invoiceCount: number;
  };
  revenueSeries: { date: string; total: number }[];
  topCustomers: { id: string; name: string; phone: string; paid: number; invoiceCount: number }[];
  topParts: { name: string; qty: number; revenue: number }[];
};

function firstOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0]!;
}

function today() {
  return new Date().toISOString().split("T")[0]!;
}

const PRESETS = [
  { id: "today", label: "আজ" },
  { id: "7d", label: "৭ দিন" },
  { id: "30d", label: "৩০ দিন" },
  { id: "month", label: "এই মাস" },
];

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0]!;
}

export default function ReportsPage() {
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(today());

  const url = useMemo(() => `/reports/overview${qs({ from, to })}`, [from, to]);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["reports", from, to],
    queryFn: () => api<ReportData>(url).then((r) => r.data),
  });

  function applyPreset(id: string) {
    if (id === "today") {
      setFrom(today());
      setTo(today());
    } else if (id === "7d") {
      setFrom(daysAgo(6));
      setTo(today());
    } else if (id === "30d") {
      setFrom(daysAgo(29));
      setTo(today());
    } else if (id === "month") {
      setFrom(firstOfMonth());
      setTo(today());
    }
  }

  return (
    <>
      <PageHeader
        title="রিপোর্ট"
        description="আয়, ব্যয়, লাভ, শীর্ষ গ্রাহক ও শীর্ষ পার্টস"
      />

      <Card className="mb-4">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid w-full grid-cols-2 gap-3 sm:max-w-md">
            <div className="space-y-1">
              <Label className="text-xs">শুরু</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">শেষ</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <Button key={p.id} size="sm" variant="outline" onClick={() => applyPreset(p.id)}>
                <CalendarRange className="h-4 w-4" /> {p.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">রিপোর্ট লোড হচ্ছে...</p>
      ) : isError || !data ? (
        <p className="text-sm text-destructive">রিপোর্ট লোড করা যায়নি</p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<DollarSign className="h-5 w-5" />}
              label="মোট আয়"
              value={formatTaka(data.summary.revenue)}
              tone="primary"
            />
            <StatCard
              icon={<TrendingDown className="h-5 w-5" />}
              label="মোট ব্যয়"
              value={formatTaka(data.summary.expense)}
              tone="warning"
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5" />}
              label="নীট লাভ"
              value={formatTaka(data.summary.profit)}
              tone={data.summary.profit >= 0 ? "success" : "destructive"}
            />
            <StatCard
              icon={<WalletCards className="h-5 w-5" />}
              label="বকেয়া"
              value={formatTaka(data.summary.totalDue)}
              tone="muted"
            />
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>আয়ের ধারা</CardTitle>
                <CardDescription>
                  {formatDate(data.summary.range.from)} — {formatDate(data.summary.range.to)} (
                  <Receipt className="inline h-3 w-3" /> {bnNumber(data.summary.invoiceCount)} ইনভয়েস)
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {data.revenueSeries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">এই সময়সীমায় কোনো আয় নেই</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.revenueSeries}>
                      <defs>
                        <linearGradient id="reportRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(v) => formatDate(v)}
                        minTickGap={20}
                        fontSize={12}
                      />
                      <YAxis tickFormatter={(v) => bnNumber(v)} fontSize={12} />
                      <Tooltip
                        formatter={(v) => formatTaka(Number(v))}
                        labelFormatter={(v) => formatDate(String(v))}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="hsl(var(--primary))"
                        fill="url(#reportRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>শীর্ষ পার্টস</CardTitle>
                <CardDescription>বিক্রির পরিমাণ অনুযায়ী</CardDescription>
              </CardHeader>
              <CardContent>
                {data.topParts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">তথ্য নেই</p>
                ) : (
                  <ul className="space-y-3">
                    {data.topParts.map((p) => (
                      <li
                        key={p.name}
                        className="flex items-center justify-between gap-3 rounded-lg border p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{bnNumber(p.qty)} টি</p>
                        </div>
                        <p className="text-sm font-semibold text-primary">
                          {formatTaka(p.revenue)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>শীর্ষ গ্রাহক</CardTitle>
              <CardDescription>সর্বাধিক পেমেন্ট গ্রহণের ভিত্তিতে</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {data.topCustomers.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">তথ্য নেই</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>গ্রাহক</TableHead>
                      <TableHead>ফোন</TableHead>
                      <TableHead>ইনভয়েস</TableHead>
                      <TableHead>প্রাপ্ত</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.topCustomers.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-semibold">{c.name}</TableCell>
                        <TableCell>{c.phone}</TableCell>
                        <TableCell>{bnNumber(c.invoiceCount)}</TableCell>
                        <TableCell className="font-semibold text-primary">
                          {formatTaka(c.paid)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "primary" | "warning" | "success" | "destructive" | "muted";
}) {
  const tones: Record<typeof tone, string> = {
    primary: "bg-primary/10 text-primary",
    warning: "bg-amber-100 text-amber-700",
    success: "bg-emerald-100 text-emerald-700",
    destructive: "bg-rose-100 text-rose-700",
    muted: "bg-slate-100 text-slate-700",
  };
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 truncate text-xl font-bold sm:text-2xl">{value}</p>
        </div>
        <div className={`rounded-xl p-3 ${tones[tone]}`}>{icon}</div>
      </CardContent>
    </Card>
  );
}
