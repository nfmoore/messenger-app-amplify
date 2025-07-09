"use client";

import { useState, type FormEvent } from "react";
import { resetPassword } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await resetPassword({ username: email });
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Reset password</CardTitle>
            <CardDescription>
              Enter your email to receive a reset code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="grid gap-4">
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send reset code"}
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link href="/login">Back to Sign In</Link>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}