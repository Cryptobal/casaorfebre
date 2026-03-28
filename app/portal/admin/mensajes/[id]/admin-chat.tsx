"use client";

import { ChatMessages } from "@/components/chat/chat-messages";
import { adminDeleteMessage } from "@/lib/actions/chat";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  senderId: string;
  senderRole: string;
  senderName: string | null;
  content: string;
  isBlocked: boolean;
  blockedReason: string | null;
  isOwn: boolean;
  createdAt: Date | string;
  visibleTo?: string | null;
}

export function AdminChat({ messages }: { messages: Message[] }) {
  const router = useRouter();

  async function handleDelete(messageId: string) {
    await adminDeleteMessage(messageId);
    router.refresh();
  }

  return (
    <ChatMessages
      messages={messages}
      isAdmin
      onDeleteMessage={handleDelete}
    />
  );
}
