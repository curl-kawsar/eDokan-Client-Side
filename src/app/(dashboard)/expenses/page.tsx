"use client";

import { useState, type FormEvent } from "react";
import { ModuleList } from "@/components/module-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatTaka } from "@/lib/utils";

type Expense = {
  id: string;
  title: string;
  category: string;
  amount: string;
  expenseDate: string;
  paymentMethod?: string | null;
};

const CATEGORIES = [
  { value: "rent", label: "ভাড়া" },
  { value: "salary", label: "বেতন" },
  { value: "utility", label: "বিদ্যুৎ/গ্যাস/পানি" },
  { value: "transport", label: "পরিবহন" },
  { value: "purchase", label: "ক্রয়" },
  { value: "maintenance", label: "মেরামত" },
  { value: "misc", label: "অন্যান্য" },
];

const PAYMENT_METHODS = [
  { value: "cash", label: "নগদ" },
  { value: "bkash", label: "বিকাশ" },
  { value: "nagad", label: "নগদ (Nagad)" },
  { value: "rocket", label: "রকেট" },
  { value: "bank", label: "ব্যাংক" },
  { value: "card", label: "কার্ড" },
  { value: "other", label: "অন্যান্য" },
];

export default function ExpensesPage() {
  return (
    <ModuleList<Expense>
      title="খরচ"
      description="দোকান ভাড়া, বেতন, বিদ্যুৎ বিল, ছোটখাটো খরচ ও দৈনিক ব্যয়"
      endpoint="/expenses"
      queryKey="expenses"
      addLabel="নতুন খরচ"
      columns={[
        { header: "শিরোনাম", cell: (row) => <span className="font-semibold">{row.title}</span> },
        {
          header: "ক্যাটাগরি",
          cell: (row) => CATEGORIES.find((c) => c.value === row.category)?.label ?? row.category,
        },
        { header: "পরিমাণ", cell: (row) => formatTaka(row.amount) },
        { header: "তারিখ", cell: (row) => formatDate(row.expenseDate) },
      ]}
      renderForm={({ onSubmit, pending }) => <ExpenseForm onSubmit={onSubmit} pending={pending} />}
    />
  );
}

function ExpenseForm({
  onSubmit,
  pending,
}: {
  onSubmit: (values: Record<string, unknown>) => void;
  pending: boolean;
}) {
  const [category, setCategory] = useState<string>("misc");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      title: form.get("title"),
      category,
      amount: Number(form.get("amount") || 0),
      paymentMethod,
      notes: form.get("notes") || null,
    });
    event.currentTarget.reset();
    setCategory("misc");
    setPaymentMethod("cash");
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
      <Field name="title" label="শিরোনাম" required />
      <Field name="amount" label="পরিমাণ" type="number" required />
      <div className="space-y-2">
        <Label>ক্যাটাগরি</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>পেমেন্ট মাধ্যম</Label>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>নোট</Label>
        <Textarea name="notes" />
      </div>
      <Button className="md:col-span-2" disabled={pending}>
        {pending ? "সংরক্ষণ হচ্ছে..." : "খরচ সংরক্ষণ করুন"}
      </Button>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input name={name} type={type} required={required} />
    </div>
  );
}
