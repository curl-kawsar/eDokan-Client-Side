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
import { useCustomerOptions } from "@/hooks/use-lookups";
import type { Vehicle } from "@/lib/types";

const VEHICLE_TYPES: { value: string; label: string }[] = [
  { value: "motorcycle", label: "মোটরসাইকেল" },
  { value: "car", label: "প্রাইভেট কার" },
  { value: "truck", label: "ট্রাক" },
  { value: "cng", label: "সিএনজি" },
  { value: "rickshaw", label: "রিকশা" },
  { value: "bus", label: "বাস" },
  { value: "microbus", label: "মাইক্রোবাস" },
  { value: "pickup", label: "পিকআপ" },
  { value: "other", label: "অন্যান্য" },
];

export default function VehiclesPage() {
  return (
    <ModuleList<Vehicle>
      title="যানবাহন"
      description="রেজিস্ট্রেশন, মালিক, ব্র্যান্ড, মডেল ও সার্ভিস হিস্ট্রির ভিত্তি"
      endpoint="/vehicles"
      queryKey="vehicles"
      addLabel="নতুন যানবাহন"
      columns={[
        {
          header: "রেজি. নম্বর",
          cell: (row) => <span className="font-semibold">{row.registrationNo}</span>,
        },
        { header: "গ্রাহক", cell: (row) => row.customer?.name ?? "-" },
        {
          header: "ধরন",
          cell: (row) => (
            <Badge variant="secondary">
              {VEHICLE_TYPES.find((t) => t.value === row.type)?.label ?? row.type}
            </Badge>
          ),
        },
        {
          header: "মডেল",
          cell: (row) => [row.brand, row.model].filter(Boolean).join(" ") || "-",
        },
      ]}
      renderForm={({ onSubmit, pending }) => <VehicleForm onSubmit={onSubmit} pending={pending} />}
    />
  );
}

function VehicleForm({
  onSubmit,
  pending,
}: {
  onSubmit: (values: Record<string, unknown>) => void;
  pending: boolean;
}) {
  const customers = useCustomerOptions();
  const [customerId, setCustomerId] = useState<string>("");
  const [type, setType] = useState<string>("motorcycle");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customerId) return;
    const form = new FormData(event.currentTarget);
    onSubmit({
      customerId,
      type,
      registrationNo: form.get("registrationNo"),
      brand: form.get("brand") || null,
      model: form.get("model") || null,
      color: form.get("color") || null,
      mileage: form.get("mileage") ? Number(form.get("mileage")) : undefined,
    });
    event.currentTarget.reset();
    setCustomerId("");
    setType("motorcycle");
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
      <div className="space-y-2">
        <Label>গ্রাহক</Label>
        <Select value={customerId} onValueChange={setCustomerId}>
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
        <Label>ধরন</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder="ধরন নির্বাচন করুন" />
          </SelectTrigger>
          <SelectContent>
            {VEHICLE_TYPES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Field name="registrationNo" label="রেজিস্ট্রেশন নম্বর" required />
      <Field name="brand" label="ব্র্যান্ড" />
      <Field name="model" label="মডেল" />
      <Field name="color" label="রং" />
      <Field name="mileage" label="মাইলেজ" type="number" />
      <Button className="md:col-span-2" disabled={pending || !customerId}>
        {pending ? "সংরক্ষণ হচ্ছে..." : "যানবাহন সংরক্ষণ করুন"}
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
