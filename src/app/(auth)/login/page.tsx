"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { loginSchema, type LoginInput } from "@/validations/auth.schema";
import { APP_NAME } from "@/constants/app.constants";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setLoading(true);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      toast.error("Invalid email or password");
      return;
    }

    router.push("/jobs");
    router.refresh();
  }

  async function handleRedditLogin() {
    await signIn("reddit", { callbackUrl: "/jobs" });
  }

  return (
    <Card className="w-full max-w-md border-border/50">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-heading text-primary">{APP_NAME}</CardTitle>
        <CardDescription>Sign in to your job realm</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign in
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleRedditLogin}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 0A10 10 0 0 0 0 10a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 10 0m6.67 10a1.46 1.46 0 0 1-2.47 1 7.12 7.12 0 0 1-3.85 1.23l.65 3.08 2-.41a1 1 0 1 1 1 1 1 1 0 0 1-1-.83l-2.2.46a.2.2 0 0 1-.24-.15l-.73-3.44a7.14 7.14 0 0 1-3.89-1.23 1.46 1.46 0 1 1-1.61-2.39 2.87 2.87 0 0 1 0-.44c0-2.24 2.61-4.06 5.83-4.06s5.83 1.82 5.83 4.06a2.87 2.87 0 0 1 0 .44 1.46 1.46 0 0 1 .68 1.18m-9.4-.98a1 1 0 1 0 2 0 1 1 0 0 0-2 0m5.38 2.65a3.56 3.56 0 0 1-2.65 1 3.56 3.56 0 0 1-2.65-1 .2.2 0 0 0-.28.28 4 4 0 0 0 2.93 1.17 4 4 0 0 0 2.93-1.17.2.2 0 1 0-.28-.28m-.1-1.65a1 1 0 1 0 2 0 1 1 0 0 0-2 0" />
          </svg>
          Continue with Reddit
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
