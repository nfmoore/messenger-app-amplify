"use client";

import { useState, useEffect } from "react";
import { Amplify } from "aws-amplify";
import { getCurrentUser } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import config from "@/amplify_outputs.json";

Amplify.configure(config, { ssr: true });
const client = generateClient<Schema>();

export default function TestPage() {
  const [user, setUser] = useState<any>(null);
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    testAmplifyConnection();
  }, []);

  const testAmplifyConnection = async () => {
    try {
      // Test auth
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      console.log("User:", currentUser);

      // Test data
      const { data: sessions } = await client.models.ChatSession.list({
        authMode: "userPool",
      });
      setChatSessions(sessions);
      console.log("Chat sessions:", sessions);

      // Test AI conversation
      const { data: aiResponse } = await client.conversations.chat.sendMessage({
        content: [{ text: "Hello, this is a test message" }],
      });
      console.log("AI Response:", aiResponse);

    } catch (err: any) {
      console.error("Test error:", err);
      setError(err.message || "Test failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Testing Amplify connection...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Amplify Test Page</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">User Info:</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Chat Sessions:</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify(chatSessions, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}