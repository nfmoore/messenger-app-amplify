"use client";

import { useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const client = generateClient<Schema>();

export default function AITestPage() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const testAI = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    setError("");
    setResponse("");

    try {
      console.log("Testing AI with message:", message);
      console.log("Client object:", client);
      console.log("Client.conversations:", client.conversations);
      
      // Let's see what's actually available
      if (!client.conversations) {
        setError("client.conversations is undefined");
        return;
      }
      
      if (!client.conversations.chat) {
        setError("client.conversations.chat is undefined");
        return;
      }
      
      console.log("client.conversations.chat:", client.conversations.chat);
      console.log("Available methods:", Object.keys(client.conversations.chat));
      
      // Try different API approaches based on the schema
      let result;
      
      // First, try to create a conversation
      if (typeof client.conversations.chat.create === 'function') {
        const conversation = await client.conversations.chat.create();
        console.log("Created conversation:", conversation);
        
        if (conversation.data?.id) {
          // Now try to send a message using the conversation ID
          if (typeof client.conversations.chat.sendMessage === 'function') {
            result = await client.conversations.chat.sendMessage({
              conversationId: conversation.data.id,
              content: [{ text: message }],
            });
          } else {
            setError("sendMessage method not found");
            return;
          }
        } else {
          setError("Failed to create conversation");
          return;
        }
      } else {
        setError(`Available methods: ${Object.keys(client.conversations.chat).join(', ')}`);
        return;
      }
      
      console.log("Full AI result:", result);
      
      if (result.data?.content?.[0]?.text) {
        setResponse(result.data.content[0].text);
      } else {
        setError("No response content received");
      }
      
      if (result.errors && result.errors.length > 0) {
        setError(`Errors: ${JSON.stringify(result.errors)}`);
      }
      
    } catch (err) {
      console.error("AI test error:", err);
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>AI Integration Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a test message..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  testAI();
                }
              }}
            />
            <Button onClick={testAI} disabled={loading || !message.trim()}>
              {loading ? "Testing..." : "Test AI"}
            </Button>
          </div>
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="font-semibold text-red-800">Error:</h3>
              <pre className="text-sm text-red-700 whitespace-pre-wrap">{error}</pre>
            </div>
          )}
          
          {response && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-semibold text-green-800">AI Response:</h3>
              <p className="text-green-700">{response}</p>
            </div>
          )}
          
          <div className="text-sm text-muted-foreground">
            <p>This page tests the AI integration directly. Check the browser console for detailed logs.</p>
            <p>Make sure Claude 3.5 Sonnet is enabled in your AWS Bedrock console.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}