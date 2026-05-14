"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { LogOut, Moon, Sun } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import type { User } from "@/lib/types";

export default function SettingsPage() {
  const router = useRouter();
  const { user, setAuth, logout, token } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone ?? "");
    }
  }, [user]);

  const profileMutation = useMutation({
    mutationFn: (values: { name: string; phone: string | null }) =>
      api<User>("/auth/me", { method: "PATCH", body: JSON.stringify(values) }),
    onSuccess: (res) => {
      if (token) setAuth(res.data, token);
      toast.success(res.message ?? "প্রোফাইল আপডেট হয়েছে");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const passwordMutation = useMutation({
    mutationFn: (values: { currentPassword: string; newPassword: string }) =>
      api<{ success: boolean }>("/auth/change-password", {
        method: "POST",
        body: JSON.stringify(values),
      }),
    onSuccess: (res) => {
      toast.success(res.message ?? "পাসওয়ার্ড পরিবর্তন হয়েছে");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim().length < 2) {
      toast.error("নাম কমপক্ষে ২ অক্ষরের হতে হবে");
      return;
    }
    profileMutation.mutate({ name: name.trim(), phone: phone.trim() || null });
  }

  function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword.length < 6) {
      toast.error("নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("নতুন পাসওয়ার্ড দু'বার একই হতে হবে");
      return;
    }
    passwordMutation.mutate({ currentPassword, newPassword });
  }

  const roleBn: Record<string, string> = {
    admin: "অ্যাডমিন",
    manager: "ম্যানেজার",
    mechanic: "মেকানিক",
    cashier: "ক্যাশিয়ার",
  };

  return (
    <>
      <PageHeader title="সেটিংস" description="প্রোফাইল, পাসওয়ার্ড, থিম ও অ্যাকাউন্ট ব্যবস্থাপনা" />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>প্রোফাইল</CardTitle>
            <CardDescription>আপনার নাম ও যোগাযোগ তথ্য হালনাগাদ করুন</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleProfileSubmit}>
              <div className="space-y-2">
                <Label>নাম</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>ইমেইল</Label>
                <Input value={user?.email ?? ""} disabled />
              </div>
              <div className="space-y-2">
                <Label>ফোন</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>রোল</Label>
                <Input value={roleBn[user?.role ?? "admin"] ?? user?.role ?? "-"} disabled />
              </div>
              <Button type="submit" disabled={profileMutation.isPending} className="w-full sm:w-auto">
                {profileMutation.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>পাসওয়ার্ড পরিবর্তন</CardTitle>
            <CardDescription>সাইন-ইন পাসওয়ার্ড আপডেট করুন</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handlePasswordSubmit}>
              <div className="space-y-2">
                <Label>বর্তমান পাসওয়ার্ড</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>নতুন পাসওয়ার্ড</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>নতুন পাসওয়ার্ড নিশ্চিত করুন</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={passwordMutation.isPending} className="w-full sm:w-auto">
                {passwordMutation.isPending ? "আপডেট হচ্ছে..." : "পাসওয়ার্ড পরিবর্তন করুন"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>থিম</CardTitle>
            <CardDescription>লাইট অথবা ডার্ক মোড বেছে নিন</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              onClick={() => setTheme("light")}
            >
              <Sun className="h-4 w-4" /> লাইট
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              onClick={() => setTheme("dark")}
            >
              <Moon className="h-4 w-4" /> ডার্ক
            </Button>
            <Button
              variant={theme === "system" ? "default" : "outline"}
              onClick={() => setTheme("system")}
            >
              সিস্টেম
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>সিস্টেম তথ্য</CardTitle>
            <CardDescription>সংযোগ এবং কনফিগারেশন</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">API URL</span>
              <span className="break-all text-right font-mono text-xs">
                {process.env.NEXT_PUBLIC_API_URL}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">ভাষা</span>
              <span>বাংলা</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">মুদ্রা</span>
              <span>বাংলাদেশি টাকা (BDT)</span>
            </div>
            <Button variant="destructive" className="w-full" onClick={handleLogout}>
              <LogOut className="h-4 w-4" /> লগআউট করুন
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
