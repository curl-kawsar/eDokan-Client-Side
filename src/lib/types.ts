export type UserRole = "admin" | "manager" | "mechanic" | "cashier";

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  altPhone?: string | null;
  email?: string | null;
  address?: string | null;
  nidNumber?: string | null;
  notes?: string | null;
  createdAt: string;
};

export type Vehicle = {
  id: string;
  customerId: string;
  type: string;
  brand?: string | null;
  model?: string | null;
  registrationNo: string;
  color?: string | null;
  mileage?: number | null;
  customer?: Customer;
};

export type Part = {
  id: string;
  sku: string;
  name: string;
  nameBn?: string | null;
  category?: string | null;
  brand?: string | null;
  unit: string;
  purchasePrice: string;
  sellingPrice: string;
  stockQty: number;
  lowStockThreshold: number;
};

export type JobCard = {
  id: string;
  jobNo: string;
  status: "pending" | "in_progress" | "completed" | "delivered" | "cancelled";
  complaint?: string | null;
  diagnosis?: string | null;
  laborCost: string | number;
  discount: string | number;
  total?: number;
  createdAt: string;
  customer?: Customer;
  vehicle?: Vehicle;
};

export type Invoice = {
  id: string;
  invoiceNo: string;
  status: "draft" | "unpaid" | "partial" | "paid" | "cancelled";
  total: string;
  paidAmount: string;
  dueAmount: string;
  issueDate: string;
  customer?: Customer;
};

export type DashboardOverview = {
  counts: {
    customers: number;
    vehicles: number;
    parts: number;
    lowStock: number;
    pendingJobs: number;
    inProgressJobs: number;
    completedJobs: number;
  };
  finance: {
    todayRevenue: number;
    monthRevenue: number;
    todayExpense: number;
    monthExpense: number;
    totalDue: number;
  };
  revenueSeries: { date: string; total: number }[];
  recentJobs: JobCard[];
  lowStock: Part[];
};
