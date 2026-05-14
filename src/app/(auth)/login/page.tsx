"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Wrench } from "lucide-react";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth-store";

const schema = z.object({
  email: z.string().email("সঠিক ইমেইল দিন"),
  password: z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"),
});

type LoginForm = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const form = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: "admin@ehiseb.com", password: "admin123" },
  });

  const login = useMutation({
    mutationFn: (values: LoginForm) =>
      api<{ user: User; token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      }),
    onSuccess: (res) => {
      setAuth(res.data.user, res.data.token);
      toast.success("লগইন সফল হয়েছে");
      router.replace("/dashboard");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_#ccfbf1,_transparent_35%),linear-gradient(135deg,#f8fafc,#e2e8f0)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Wrench className="h-7 w-7" />
          </div>
          <CardTitle className="text-3xl">ই-হিসেব</CardTitle>
          <CardDescription>আপনার ওয়ার্কশপ ম্যানেজমেন্ট প্যানেলে প্রবেশ করুন</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit((v) => login.mutate(v))}>
            <div className="space-y-2">
              <Label>ইমেইল</Label>
              <Input {...form.register("email")} type="email" />
              <p className="text-xs text-destructive">{form.formState.errors.email?.message}</p>
            </div>
            <div className="space-y-2">
              <Label>পাসওয়ার্ড</Label>
              <Input {...form.register("password")} type="password" />
              <p className="text-xs text-destructive">{form.formState.errors.password?.message}</p>
            </div>
            <Button className="w-full" disabled={login.isPending}>
              {login.isPending ? "লগইন হচ্ছে..." : "লগইন করুন"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              ডেমো: admin@ehiseb.com / admin123
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
