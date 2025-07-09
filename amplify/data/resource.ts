import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  // Legacy room-based chat models (keeping for compatibility)
  Room: a
    .model({
      name: a.string().required(),
      description: a.string().required(),
      chatMessages: a.hasMany("ChatMessage", "chatMessageId"),
    })
    .authorization((allow) => [allow.authenticated()]),
  ChatMessage: a
    .model({
      room: a.belongsTo("Room", "chatMessageId"),
      chatMessageId: a.id(),
      sender: a.string().required(),
      text: a.string().required(),
    })
    .authorization((allow) => [allow.authenticated()]),

  // New dashboard chat models
  ChatSession: a
    .model({
      title: a.string().required(),
      messages: a.hasMany("Message", "chatSessionId"),
      owner: a.string(),
    })
    .authorization((allow) => [allow.owner()]),
  
  Message: a
    .model({
      chatSession: a.belongsTo("ChatSession", "chatSessionId"),
      chatSessionId: a.id(),
      content: a.string().required(),
      role: a.enum(["user", "assistant"]),
      timestamp: a.datetime(),
    })
    .authorization((allow) => [allow.authenticated()]),

  // AI conversation for Claude integration
  chat: a
    .conversation({
      aiModel: a.ai.model("Claude 3.5 Sonnet"),
      systemPrompt:
        "You are Claude, a helpful AI assistant created by Anthropic. You are knowledgeable, thoughtful, and aim to be helpful while being honest about your limitations. Respond in a conversational and friendly manner.",
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
