"use client";

import { useState, useEffect } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { ChatDashboard } from "@/components/ChatDashboard";

const client = generateClient<Schema>();

interface User {
  username: string;
  email?: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then((currentUser) => {
        setUser({
          username: currentUser.username,
          email: currentUser.signInDetails?.loginId,
        });
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Auth component will handle redirect
  }

  return <ChatDashboard user={user} />;
}