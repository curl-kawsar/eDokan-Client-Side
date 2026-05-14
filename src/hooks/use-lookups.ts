"use client";

import { useQuery } from "@tanstack/react-query";
import { api, qs } from "@/lib/api";
import type { Customer, JobCard, Vehicle } from "@/lib/types";

const LOOKUP_LIMIT = 100;

export function useCustomerOptions() {
  return useQuery({
    queryKey: ["lookup", "customers"],
    queryFn: () => api<Customer[]>(`/customers${qs({ limit: LOOKUP_LIMIT })}`).then((r) => r.data),
    staleTime: 60_000,
  });
}

export function useVehicleOptions(customerId?: string | null) {
  return useQuery({
    queryKey: ["lookup", "vehicles", customerId ?? "all"],
    queryFn: () =>
      api<Vehicle[]>(`/vehicles${qs({ limit: LOOKUP_LIMIT, customerId: customerId ?? undefined })}`).then(
        (r) => r.data
      ),
    enabled: customerId !== undefined,
    staleTime: 60_000,
  });
}

export function useJobCardOptions(customerId?: string | null) {
  return useQuery({
    queryKey: ["lookup", "job-cards", customerId ?? "all"],
    queryFn: () =>
      api<JobCard[]>(
        `/job-cards${qs({ limit: LOOKUP_LIMIT, customerId: customerId ?? undefined })}`
      ).then((r) => r.data),
    enabled: customerId !== undefined,
    staleTime: 60_000,
  });
}
