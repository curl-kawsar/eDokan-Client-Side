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

export type ActivityLogUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type ActivityLog = {
  id: string;
  entityType: string;
  entityId: string;
  userId: string | null;
  action: string;
  summary: string | null;
  meta: Record<string, unknown> | null;
  createdAt: string;
  user?: ActivityLogUser | null;
};

export type JobCard = {
  id: string;
  jobNo: string;
  status: "pending" | "in_progress" | "completed" | "delivered" | "cancelled";
  complaint?: string | null;
  diagnosis?: string | null;
  workDone?: string | null;
  laborCost: string | number;
  discount: string | number;
  total?: number;
  createdAt: string;
  updatedAt?: string;
  customer?: Customer;
  vehicle?: Vehicle;
  items?: unknown[];
  activities?: ActivityLog[];
};

export type Payment = {
  id: string;
  invoiceId: string;
  amount: string;
  method: string;
  transactionRef?: string | null;
  paidAt: string;
  notes?: string | null;
};

export type Invoice = {
  id: string;
  invoiceNo: string;
  status: "draft" | "unpaid" | "partial" | "paid" | "cancelled";
  total: string;
  paidAmount: string;
  dueAmount: string;
  issueDate: string;
  subtotal?: string;
  discount?: string;
  tax?: string;
  notes?: string | null;
  createdAt?: string;
  customer?: Customer;
  jobCard?: JobCard | null;
  payments?: Payment[];
  activities?: ActivityLog[];
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
