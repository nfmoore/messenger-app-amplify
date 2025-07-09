"use client";

import { useState } from "react";
import { signOut } from "aws-amplify/auth";
import { Button } from "@/components/ui/button";
import RoomList from "./RoomList";
import ChatArea from "./ChatArea";
import { RoomListType } from "../types/types";

export default function MessengerApp() {
  const [selectedRoom, setSelectedRoom] = useState<null | RoomListType>(null);

  const handleSignOut = async () => {
    try {
      await signOut();
      // The Auth component will handle the state change
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full p-4">
      <div className="flex h-[600px] w-full max-w-4xl overflow-hidden rounded-xl bg-card border shadow-lg">
        <RoomList onSelectRoom={setSelectedRoom} selectedRoom={selectedRoom} />
        <ChatArea selectedRoom={selectedRoom} />
      </div>
      <Button
        variant="outline"
        onClick={handleSignOut}
        className="w-auto px-6"
      >
        Sign Out
      </Button>
    </div>
  );
}
