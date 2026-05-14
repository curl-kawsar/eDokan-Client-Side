"use client";

import { useState, type FormEvent } from "react";
import { ModuleList } from "@/components/module-list";
import { Badge } from "@/components/ui/badge";
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
import { useCustomerOptions, useJobCardOptions } from "@/hooks/use-lookups";
import type { Invoice, JobCard } from "@/lib/types";
import { formatDate, formatTaka } from "@/lib/utils";

const statusBn: Record<Invoice["status"], string> = {
  draft: "ড্রাফট",
  unpaid: "বকেয়া",
  partial: "আংশিক",
  paid: "পরিশোধিত",
  cancelled: "বাতিল",
};

const jobStatusBn: Record<JobCard["status"], string> = {
  pending: "অপেক্ষমান",
  in_progress: "চলমান",
  completed: "সম্পন্ন",
  delivered: "ডেলিভারি",
  cancelled: "বাতিল",
};

const NO_JOB_CARD = "__none__";

export default function InvoicesPage() {
  return (
    <ModuleList<Invoice>
      title="ইনভয়েস"
      description="বিল, পেমেন্ট, বকেয়া এবং বাংলাদেশি পেমেন্ট মাধ্যম ট্র্যাকিং"
      endpoint="/invoices"
      queryKey="invoices"
      addLabel="নতুন ইনভয়েস"
      columns={[
        { header: "ইনভয়েস", cell: (row) => <span className="font-semibold">{row.invoiceNo}</span> },
        { header: "গ্রাহক", cell: (row) => row.customer?.name ?? "-" },
        { header: "মোট", cell: (row) => formatTaka(row.total) },
        { header: "বকেয়া", cell: (row) => formatTaka(row.dueAmount) },
        {
          header: "স্ট্যাটাস",
          cell: (row) => (
            <Badge variant={row.status === "paid" ? "success" : "warning"}>
              {statusBn[row.status]}
            </Badge>
          ),
        },
        { header: "তারিখ", cell: (row) => formatDate(row.issueDate) },
      ]}
      renderForm={({ onSubmit, pending }) => <InvoiceForm onSubmit={onSubmit} pending={pending} />}
    />
  );
}

function InvoiceForm({
  onSubmit,
  pending,
}: {
  onSubmit: (values: Record<string, unknown>) => void;
  pending: boolean;
}) {
  const customers = useCustomerOptions();
  const [customerId, setCustomerId] = useState<string>("");
  const jobCards = useJobCardOptions(customerId || null);
  const [jobCardId, setJobCardId] = useState<string>(NO_JOB_CARD);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customerId) return;
    const form = new FormData(event.currentTarget);
    const subtotal = Number(form.get("subtotal") || 0);
    const discount = Number(form.get("discount") || 0);
    const tax = Number(form.get("tax") || 0);
    onSubmit({
      customerId,
      jobCardId: jobCardId === NO_JOB_CARD ? null : jobCardId,
      subtotal,
      discount,
      tax,
      total: subtotal - discount + tax,
      notes: form.get("notes") || null,
    });
    event.currentTarget.reset();
    setCustomerId("");
    setJobCardId(NO_JOB_CARD);
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
      <div className="space-y-2">
        <Label>গ্রাহক</Label>
        <Select
          value={customerId}
          onValueChange={(value) => {
            setCustomerId(value);
            setJobCardId(NO_JOB_CARD);
          }}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={customers.isLoading ? "লোড হচ্ছে..." : "গ্রাহক নির্বাচন করুন"}
            />
          </SelectTrigger>
          <SelectContent>
            {(customers.data ?? []).map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name} — {customer.phone}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>জব কার্ড (ঐচ্ছিক)</Label>
        <Select value={jobCardId} onValueChange={setJobCardId} disabled={!customerId}>
          <SelectTrigger>
            <SelectValue
              placeholder={
                !customerId
                  ? "আগে গ্রাহক নির্বাচন করুন"
                  : jobCards.isLoading
                    ? "লোড হচ্ছে..."
                    : "জব কার্ড নির্বাচন করুন"
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_JOB_CARD}>— কোনো জব কার্ড নয় —</SelectItem>
            {(jobCards.data ?? []).map((jobCard) => (
              <SelectItem key={jobCard.id} value={jobCard.id}>
                {jobCard.jobNo} — {jobStatusBn[jobCard.status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Field name="subtotal" label="সাবটোটাল" type="number" required />
      <Field name="discount" label="ছাড়" type="number" />
      <Field name="tax" label="ট্যাক্স/ভ্যাট" type="number" />
      <div className="space-y-2 md:col-span-2">
        <Label>নোট</Label>
        <Textarea name="notes" />
      </div>
      <Button className="md:col-span-2" disabled={pending || !customerId}>
        {pending ? "তৈরি হচ্ছে..." : "ইনভয়েস তৈরি করুন"}
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
