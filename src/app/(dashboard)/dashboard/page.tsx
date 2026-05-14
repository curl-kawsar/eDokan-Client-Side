"use client";

import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Bike, Boxes, ClipboardList, DollarSign, Users, WalletCards } from "lucide-react";
import { api } from "@/lib/api";
import type { DashboardOverview } from "@/lib/types";
import { bnNumber, formatDate, formatTaka } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api<DashboardOverview>("/dashboard/overview").then((r) => r.data),
  });

  if (isLoading) return <div>ড্যাশবোর্ড লোড হচ্ছে...</div>;
  if (!data) return <div>ডেটা পাওয়া যায়নি</div>;

  const stats = [
    { label: "গ্রাহক", value: data.counts.customers, icon: Users },
    { label: "যানবাহন", value: data.counts.vehicles, icon: Bike },
    { label: "পার্টস", value: data.counts.parts, icon: Boxes },
    { label: "চলমান কাজ", value: data.counts.inProgressJobs, icon: ClipboardList },
  ];

  return (
    <>
      <PageHeader title="ড্যাশবোর্ড" description="আজকের কাজ, আয়-ব্যয় ও স্টকের দ্রুত সারাংশ" />

      <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <CardContent className="flex items-center justify-between gap-2 p-4 sm:p-6">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground sm:text-sm">{item.label}</p>
                  <p className="mt-1 text-xl font-bold sm:mt-2 sm:text-3xl">{bnNumber(item.value)}</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-2 text-primary sm:rounded-2xl sm:p-3">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-3 grid gap-3 sm:mt-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <DollarSign className="h-5 w-5 text-primary" />
              আজকের আয়
            </CardTitle>
            <CardDescription>আজ গৃহীত পেমেন্ট</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <p className="text-2xl font-bold text-primary sm:text-3xl">
              {formatTaka(data.finance.todayRevenue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">এই মাসের আয়</CardTitle>
            <CardDescription>চলতি মাসের মোট পেমেন্ট</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <p className="text-2xl font-bold sm:text-3xl">{formatTaka(data.finance.monthRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <WalletCards className="h-5 w-5 text-amber-600" />
              মোট বকেয়া
            </CardTitle>
            <CardDescription>অপরিশোধিত ইনভয়েস</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <p className="text-2xl font-bold text-amber-600 sm:text-3xl">
              {formatTaka(data.finance.totalDue)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-3 grid gap-3 sm:mt-4 sm:gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>গত ১৪ দিনের আয়</CardTitle>
          </CardHeader>
          <CardContent className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueSeries}>
                <defs>
                  <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(v) => formatDate(v)} />
                <YAxis tickFormatter={(v) => bnNumber(v)} />
                <Tooltip formatter={(v) => formatTaka(Number(v))} labelFormatter={(v) => formatDate(String(v))} />
                <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="url(#revenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>লো স্টক</CardTitle>
            <CardDescription>যেসব পার্টস দ্রুত কিনতে হবে</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground">লো স্টক নেই</p>
            ) : (
              data.lowStock.map((part) => (
                <div key={part.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-semibold">{part.nameBn ?? part.name}</p>
                    <p className="text-xs text-muted-foreground">{part.sku}</p>
                  </div>
                  <Badge variant="warning">{bnNumber(part.stockQty)} {part.unit}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
