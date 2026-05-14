"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { api, qs } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";

type Column<T> = {
  header: string;
  cell: (row: T) => React.ReactNode;
};

type ModuleListProps<T extends { id: string }> = {
  title: string;
  description: string;
  endpoint: string;
  queryKey: string;
  addLabel: string;
  columns: Column<T>[];
  renderForm: (props: { onSubmit: (values: Record<string, unknown>) => void; pending: boolean }) => React.ReactNode;
};

type ListResponse<T> = {
  success: true;
  data: T[];
  meta?: { total: number };
};

export function ModuleList<T extends { id: string }>({
  title,
  description,
  endpoint,
  queryKey,
  addLabel,
  columns,
  renderForm,
}: ModuleListProps<T>) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();
  const url = useMemo(() => `${endpoint}${qs({ search, limit: 50 })}`, [endpoint, search]);

  const { data, isLoading } = useQuery({
    queryKey: [queryKey, search],
    queryFn: () => api<T[]>(url).then((r) => r),
  });

  const create = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      api<T>(endpoint, { method: "POST", body: JSON.stringify(values) }),
    onSuccess: () => {
      toast.success("সফলভাবে সংরক্ষণ হয়েছে");
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        action={
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4" />
            {showForm ? "ফর্ম বন্ধ করুন" : addLabel}
          </Button>
        }
      />

      {showForm ? (
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            {renderForm({ onSubmit: (v) => create.mutate(v), pending: create.isPending })}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center gap-2 border-b p-3 sm:p-4">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              placeholder="খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.header}>{column.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length}>লোড হচ্ছে...</TableCell>
                </TableRow>
              ) : data?.data?.length ? (
                data.data.map((row) => (
                  <TableRow key={row.id}>
                    {columns.map((column) => (
                      <TableCell key={column.header}>{column.cell(row)}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length}>কোনো তথ্য পাওয়া যায়নি</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
