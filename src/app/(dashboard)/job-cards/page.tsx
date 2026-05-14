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
import { useCustomerOptions, useVehicleOptions } from "@/hooks/use-lookups";
import type { JobCard } from "@/lib/types";
import { formatDate, formatTaka } from "@/lib/utils";

const statusBn: Record<JobCard["status"], string> = {
  pending: "অপেক্ষমান",
  in_progress: "চলমান",
  completed: "সম্পন্ন",
  delivered: "ডেলিভারি",
  cancelled: "বাতিল",
};

export default function JobCardsPage() {
  return (
    <ModuleList<JobCard>
      title="জব কার্ড"
      description="গ্রাহকের অভিযোগ, সার্ভিস কাজ, শ্রমমূল্য ও পার্টস ব্যবস্থাপনা"
      endpoint="/job-cards"
      queryKey="job-cards"
      addLabel="নতুন জব কার্ড"
      columns={[
        { header: "জব নম্বর", cell: (row) => <span className="font-semibold">{row.jobNo}</span> },
        { header: "গ্রাহক", cell: (row) => row.customer?.name ?? "-" },
        {
          header: "স্ট্যাটাস",
          cell: (row) => (
            <Badge variant={row.status === "completed" ? "success" : "secondary"}>
              {statusBn[row.status]}
            </Badge>
          ),
        },
        { header: "মোট", cell: (row) => formatTaka(row.total ?? 0) },
        { header: "তারিখ", cell: (row) => formatDate(row.createdAt) },
      ]}
      renderForm={({ onSubmit, pending }) => <JobCardForm onSubmit={onSubmit} pending={pending} />}
    />
  );
}

function JobCardForm({
  onSubmit,
  pending,
}: {
  onSubmit: (values: Record<string, unknown>) => void;
  pending: boolean;
}) {
  const customers = useCustomerOptions();
  const [customerId, setCustomerId] = useState<string>("");
  const vehicles = useVehicleOptions(customerId || null);
  const [vehicleId, setVehicleId] = useState<string>("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customerId || !vehicleId) return;
    const form = new FormData(event.currentTarget);
    onSubmit({
      customerId,
      vehicleId,
      complaint: form.get("complaint") || null,
      diagnosis: form.get("diagnosis") || null,
      laborCost: Number(form.get("laborCost") || 0),
      discount: Number(form.get("discount") || 0),
      status: "pending",
      items: [],
    });
    event.currentTarget.reset();
    setCustomerId("");
    setVehicleId("");
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
      <div className="space-y-2">
        <Label>গ্রাহক</Label>
        <Select
          value={customerId}
          onValueChange={(value) => {
            setCustomerId(value);
            setVehicleId("");
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
        <Label>যানবাহন</Label>
        <Select value={vehicleId} onValueChange={setVehicleId} disabled={!customerId}>
          <SelectTrigger>
            <SelectValue
              placeholder={
                !customerId
                  ? "আগে গ্রাহক নির্বাচন করুন"
                  : vehicles.isLoading
                    ? "লোড হচ্ছে..."
                    : (vehicles.data?.length ?? 0) === 0
                      ? "এই গ্রাহকের কোনো যানবাহন নেই"
                      : "যানবাহন নির্বাচন করুন"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {(vehicles.data ?? []).map((vehicle) => (
              <SelectItem key={vehicle.id} value={vehicle.id}>
                {vehicle.registrationNo}
                {vehicle.brand || vehicle.model
                  ? ` — ${[vehicle.brand, vehicle.model].filter(Boolean).join(" ")}`
                  : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Field name="laborCost" label="শ্রমমূল্য" type="number" />
      <Field name="discount" label="ছাড়" type="number" />
      <div className="space-y-2 md:col-span-2">
        <Label>অভিযোগ</Label>
        <Textarea name="complaint" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>ডায়াগনোসিস</Label>
        <Textarea name="diagnosis" />
      </div>
      <Button className="md:col-span-2" disabled={pending || !customerId || !vehicleId}>
        {pending ? "তৈরি হচ্ছে..." : "জব কার্ড তৈরি করুন"}
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
