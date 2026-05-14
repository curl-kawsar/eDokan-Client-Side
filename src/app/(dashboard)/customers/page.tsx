"use client";

import type { FormEvent } from "react";
import { ModuleList } from "@/components/module-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Customer } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function CustomersPage() {
  return (
    <ModuleList<Customer>
      title="গ্রাহক"
      description="ওয়ার্কশপের সব গ্রাহকের তথ্য, ফোন, ঠিকানা ও নোট"
      endpoint="/customers"
      queryKey="customers"
      addLabel="নতুন গ্রাহক"
      columns={[
        { header: "নাম", cell: (row) => <span className="font-semibold">{row.name}</span> },
        { header: "ফোন", cell: (row) => row.phone },
        { header: "ঠিকানা", cell: (row) => row.address ?? "-" },
        { header: "যোগ হয়েছে", cell: (row) => formatDate(row.createdAt) },
      ]}
      renderForm={({ onSubmit, pending }) => <CustomerForm onSubmit={onSubmit} pending={pending} />}
    />
  );
}

function CustomerForm({
  onSubmit,
  pending,
}: {
  onSubmit: (values: Record<string, unknown>) => void;
  pending: boolean;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      name: form.get("name"),
      phone: form.get("phone"),
      altPhone: form.get("altPhone"),
      email: form.get("email"),
      address: form.get("address"),
      nidNumber: form.get("nidNumber"),
      notes: form.get("notes"),
    });
    event.currentTarget.reset();
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
      <Field name="name" label="নাম" required />
      <Field name="phone" label="ফোন" required />
      <Field name="altPhone" label="অন্য ফোন" />
      <Field name="email" label="ইমেইল" type="email" />
      <Field name="nidNumber" label="এনআইডি" />
      <div className="space-y-2 md:col-span-2">
        <Label>ঠিকানা</Label>
        <Textarea name="address" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>নোট</Label>
        <Textarea name="notes" />
      </div>
      <Button className="md:col-span-2" disabled={pending}>
        {pending ? "সংরক্ষণ হচ্ছে..." : "গ্রাহক সংরক্ষণ করুন"}
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
