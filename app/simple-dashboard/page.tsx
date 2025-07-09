"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageCircle, 
  Plus, 
  Settings, 
  LogOut, 
  Send,
  Bot,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: string;
}

export default function SimpleDashboard() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm Claude, your AI assistant. How can I help you today?",
      role: "assistant",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I received your message: "${userMessage.content}". This is a simulated response to test the dashboard layout. In the full implementation, this would be powered by Claude via AWS Bedrock.`,
        role: "assistant",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        "flex flex-col border-r bg-muted/40 transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64"
      )}>
        {/* Header */}
        <div className="flex h-14 items-center border-b px-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6" />
            {!sidebarCollapsed && (
              <span className="font-semibold">AI Chat</span>
            )}
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <Button 
            className="w-full justify-start gap-2"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            {!sidebarCollapsed && "New Chat"}
          </Button>
        </div>

        {/* Chat Sessions */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2">
            <Button
              variant="secondary"
              className={cn(
                "w-full justify-start gap-2 h-auto p-3",
                sidebarCollapsed && "px-2"
              )}
            >
              <MessageCircle className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && (
                <div className="flex-1 text-left">
                  <div className="font-medium truncate">Current Chat</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              )}
            </Button>
          </div>
        </ScrollArea>

        {/* User Menu */}
        <div className="border-t p-4">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">Test User</div>
                <div className="text-xs text-muted-foreground truncate">
                  test@example.com
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn("flex-1", sidebarCollapsed && "px-2")}
            >
              <Settings className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Settings</span>}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("flex-1", sidebarCollapsed && "px-2")}
            >
              <LogOut className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Sign Out</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Chat Header */}
        <div className="flex h-14 items-center justify-between border-b px-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
            <h1 className="font-semibold">Simple Dashboard Test</h1>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={cn(
                    "rounded-lg px-4 py-2 max-w-[80%]",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground ml-12"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                {message.role === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={isLoading}
              />
              <Button 
                onClick={sendMessage} 
                disabled={!inputMessage.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}