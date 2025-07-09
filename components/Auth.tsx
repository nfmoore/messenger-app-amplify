"use client";

import { useState, useEffect } from "react";
import { Amplify } from "aws-amplify";
import { getCurrentUser } from "aws-amplify/auth";
import { useRouter, usePathname } from "next/navigation";
import config from "@/amplify_outputs.json";

Amplify.configure(config, { ssr: true });

interface AuthUser {
  username: string;
  email?: string;
}

export function Auth({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Auth routes that don't require authentication
  const authRoutes = [
    "/login",
    "/signup", 
    "/confirm-signup",
    "/forgot-password",
    "/reset-password"
  ];

  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser({
        username: currentUser.username,
        email: currentUser.signInDetails?.loginId,
      });
      
      // If user is authenticated and on auth route, redirect to dashboard
      if (isAuthRoute) {
        router.push("/dashboard");
      }
    } catch {
      setUser(null);
      
      // If user is not authenticated and not on auth route, redirect to login
      if (!isAuthRoute) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // If user is authenticated, show the app
  if (user) {
    return <>{children}</>;
  }

  // If user is not authenticated and on auth route, show the auth page
  if (isAuthRoute) {
    return <>{children}</>;
  }

  // This shouldn't happen due to the redirect logic above, but just in case
  return null;
}
