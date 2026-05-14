"use client";

import type { FormEvent } from "react";
import { ModuleList } from "@/components/module-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Part } from "@/lib/types";
import { bnNumber, formatTaka } from "@/lib/utils";

export default function PartsPage() {
  return (
    <ModuleList<Part>
      title="পার্টস ও স্টক"
      description="ইনভেন্টরি, ক্রয়মূল্য, বিক্রয়মূল্য এবং লো-স্টক মনিটরিং"
      endpoint="/parts"
      queryKey="parts"
      addLabel="নতুন পার্টস"
      columns={[
        { header: "SKU", cell: (row) => <span className="font-mono text-xs">{row.sku}</span> },
        { header: "নাম", cell: (row) => <span className="font-semibold">{row.nameBn ?? row.name}</span> },
        { header: "স্টক", cell: (row) => <Badge variant={row.stockQty <= row.lowStockThreshold ? "warning" : "secondary"}>{bnNumber(row.stockQty)} {row.unit}</Badge> },
        { header: "বিক্রয়মূল্য", cell: (row) => formatTaka(row.sellingPrice) },
      ]}
      renderForm={({ onSubmit, pending }) => <PartForm onSubmit={onSubmit} pending={pending} />}
    />
  );
}

function PartForm({ onSubmit, pending }: { onSubmit: (values: Record<string, unknown>) => void; pending: boolean }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      sku: form.get("sku"),
      name: form.get("name"),
      nameBn: form.get("nameBn"),
      category: form.get("category"),
      brand: form.get("brand"),
      unit: form.get("unit") || "pcs",
      purchasePrice: form.get("purchasePrice") || 0,
      sellingPrice: form.get("sellingPrice") || 0,
      stockQty: form.get("stockQty") || 0,
      lowStockThreshold: form.get("lowStockThreshold") || 5,
    });
    event.currentTarget.reset();
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
      <Field name="sku" label="SKU" required />
      <Field name="name" label="ইংরেজি নাম" required />
      <Field name="nameBn" label="বাংলা নাম" />
      <Field name="category" label="ক্যাটাগরি" />
      <Field name="brand" label="ব্র্যান্ড" />
      <Field name="unit" label="ইউনিট" />
      <Field name="purchasePrice" label="ক্রয়মূল্য" type="number" />
      <Field name="sellingPrice" label="বিক্রয়মূল্য" type="number" />
      <Field name="stockQty" label="স্টক" type="number" />
      <Field name="lowStockThreshold" label="লো স্টক সীমা" type="number" />
      <Button className="md:col-span-2" disabled={pending}>
        পার্টস সংরক্ষণ করুন
      </Button>
    </form>
  );
}

function Field({ name, label, type = "text", required = false }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input name={name} type={type} required={required} />
    </div>
  );
}
