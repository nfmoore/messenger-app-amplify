"use client";

import { useState, useEffect, type FormEvent } from "react";
import { confirmSignUp } from "aws-amplify/auth";
import { useRouter, useSearchParams } from "next/navigation";
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

export default function ConfirmSignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const handleConfirmSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await confirmSignUp({
        username: email,
        confirmationCode,
      });
      router.push("/login?message=Account confirmed successfully");
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to confirm sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Confirm your account</CardTitle>
            <CardDescription>
              Enter the confirmation code sent to your email
              {email && (
                <span className="block mt-1 font-medium text-foreground">
                  {email}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleConfirmSignUp} className="grid gap-4">
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}
              {!email && (
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="confirmationCode">Confirmation Code</Label>
                <Input
                  id="confirmationCode"
                  type="text"
                  placeholder="Enter confirmation code"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Confirming..." : "Confirm Account"}
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link href="/signup">Back to Sign Up</Link>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
