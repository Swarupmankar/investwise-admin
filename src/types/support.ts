export type TicketStatus = "open" | "closed";

export type AttachmentType = "image";

export interface SupportAttachment {
  id: string;
  type: AttachmentType;
  url: string; // data URL or remote URL
  name?: string;
  size?: number; // bytes
}

export interface SupportReply {
  id: string;
  ticketId: string;
  author: "client" | "support";
  message: string;
  createdAt: string;
  attachments?: SupportAttachment[];
}

export interface SupportTicket {
  id: string;
  clientId: string;
  subject: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
  messages: SupportReply[];
}
