"use client";

import { useState, useEffect } from "react";
import { signOut } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
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
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const client = generateClient<Schema>();

interface User {
  username: string;
  email?: string;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: string;
}

interface ChatDashboardProps {
  user: User;
}

export function ChatDashboard({ user }: ChatDashboardProps) {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    loadChatSessions();
  }, []);

  useEffect(() => {
    if (currentChatId) {
      loadMessages(currentChatId);
    }
  }, [currentChatId]);

  const loadChatSessions = async () => {
    try {
      const { data: sessions } = await client.models.ChatSession.list({
        authMode: "userPool",
      });

      const formattedSessions: ChatSession[] = sessions.map((session) => ({
        id: session.id,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      }));

      setChatSessions(formattedSessions);

      // Auto-select first chat if none selected
      if (!currentChatId && formattedSessions.length > 0) {
        setCurrentChatId(formattedSessions[0].id);
      }
    } catch (error) {
      console.error("Failed to load chat sessions:", error);
      // Fallback to empty array
      setChatSessions([]);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const { data: messageData } = await client.models.Message.list({
        filter: { chatSessionId: { eq: chatId } },
        authMode: "userPool",
      });

      const formattedMessages: Message[] = messageData
        .sort(
          (a, b) =>
            new Date(a.timestamp || "").getTime() -
            new Date(b.timestamp || "").getTime()
        )
        .map((msg) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role as "user" | "assistant",
          timestamp: msg.timestamp || new Date().toISOString(),
        }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Failed to load messages:", error);
      setMessages([]);
    }
  };

  const createNewChat = async () => {
    try {
      // Create a new chat session
      const { data: newSession } = await client.models.ChatSession.create(
        {
          title: "New Chat",
          owner: user.username,
        },
        {
          authMode: "userPool",
        }
      );

      if (newSession) {
        const newChat: ChatSession = {
          id: newSession.id,
          title: newSession.title,
          createdAt: newSession.createdAt,
          updatedAt: newSession.updatedAt,
        };

        setChatSessions((prev) => [newChat, ...prev]);
        setCurrentChatId(newChat.id);
        setCurrentConversationId(null); // Reset conversation ID for new chat
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to create new chat:", error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !currentChatId) return;

    const messageContent = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    try {
      // Save user message to database
      const { data: userMessageData } = await client.models.Message.create(
        {
          chatSessionId: currentChatId,
          content: messageContent,
          role: "user",
          timestamp: new Date().toISOString(),
        },
        {
          authMode: "userPool",
        }
      );

      if (userMessageData) {
        const userMessage: Message = {
          id: userMessageData.id,
          content: userMessageData.content,
          role: "user",
          timestamp: userMessageData.timestamp || new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMessage]);
      }

      // Send message to Claude via Amplify AI
      console.log("Sending message to AI:", messageContent);

      try {
        // Try the Amplify AI conversation approach
        const { data: aiResponse, errors } =
          await client.conversations.chat.sendMessage({
            content: [{ text: messageContent }],
          });

        console.log("AI Response:", aiResponse);
        console.log("AI Errors:", errors);

        if (aiResponse?.content?.[0]?.text) {
          // Save assistant response to database
          const { data: assistantMessageData } =
            await client.models.Message.create(
              {
                chatSessionId: currentChatId,
                content: aiResponse.content[0].text,
                role: "assistant",
                timestamp: new Date().toISOString(),
              },
              {
                authMode: "userPool",
              }
            );

          if (assistantMessageData) {
            const assistantMessage: Message = {
              id: assistantMessageData.id,
              content: assistantMessageData.content,
              role: "assistant",
              timestamp:
                assistantMessageData.timestamp || new Date().toISOString(),
            };
            setMessages((prev) => [...prev, assistantMessage]);

            // Update chat title if it's the first message
            const currentChat = chatSessions.find(
              (chat) => chat.id === currentChatId
            );
            if (currentChat?.title === "New Chat") {
              const newTitle =
                messageContent.length > 30
                  ? messageContent.substring(0, 30) + "..."
                  : messageContent;

              await client.models.ChatSession.update(
                {
                  id: currentChatId,
                  title: newTitle,
                },
                {
                  authMode: "userPool",
                }
              );

              setChatSessions((prev) =>
                prev.map((chat) =>
                  chat.id === currentChatId
                    ? { ...chat, title: newTitle }
                    : chat
                )
              );
            }
          }
        } else {
          console.error("No AI response content received");
          throw new Error("No response from AI");
        }
      } catch (aiError) {
        console.error("AI conversation error:", aiError);

        // Create a more helpful fallback response
        const fallbackResponse = `Hello! I received your message: "${messageContent}". 

I'm Claude, your AI assistant, but I'm currently experiencing some technical difficulties connecting to the AI service. This might be due to:

1. The Claude model not being properly configured in AWS Bedrock
2. Missing permissions for the AI service
3. The conversation API not being set up correctly

The chat interface is working perfectly - it's just the AI integration that needs to be fixed. Your message has been saved and the conversation history is being maintained.`;

        const { data: assistantMessageData } =
          await client.models.Message.create(
            {
              chatSessionId: currentChatId,
              content: fallbackResponse,
              role: "assistant",
              timestamp: new Date().toISOString(),
            },
            {
              authMode: "userPool",
            }
          );

        if (assistantMessageData) {
          const assistantMessage: Message = {
            id: assistantMessageData.id,
            content: assistantMessageData.content,
            role: "assistant",
            timestamp:
              assistantMessageData.timestamp || new Date().toISOString(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Add error message to chat
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "Sorry, I encountered an error. Please try again.",
        role: "assistant",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  const currentChat = chatSessions.find((chat) => chat.id === currentChatId);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "flex flex-col border-r bg-muted/40 transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
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
            onClick={createNewChat}
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
            {chatSessions.map((chat) => (
              <Button
                key={chat.id}
                onClick={() => setCurrentChatId(chat.id)}
                variant={currentChatId === chat.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2 h-auto p-3",
                  sidebarCollapsed && "px-2"
                )}
              >
                <MessageCircle className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && (
                  <div className="flex-1 text-left">
                    <div className="font-medium truncate">{chat.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(chat.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </Button>
            ))}
          </div>
        </ScrollArea>

        {/* User Menu */}
        <div className="border-t p-4">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{user.username}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {user.email}
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
              onClick={handleSignOut}
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
            <h1 className="font-semibold">
              {currentChat?.title || "Select a chat"}
            </h1>
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
                    <div
                      className="w-2 h-2 bg-current rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-current rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
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
