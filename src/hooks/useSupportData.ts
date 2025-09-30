import { useEffect, useState } from "react";
import type { SupportTicket, SupportReply, SupportAttachment } from "@/types/support";

const seedTickets: SupportTicket[] = [
  {
    id: "t1",
    clientId: "1",
    subject: "Withdrawal delay issue",
    description: "My withdrawal has been pending for 48 hours...",
    status: "open",
    createdAt: "2024-02-15T10:30:00Z",
    messages: [
      {
        id: "m1",
        ticketId: "t1",
        author: "client",
        message:
          "My withdrawal has been pending for 48 hours. The transaction ID is TXN987654322. Can you please check the status?",
        createdAt: "2024-02-15T10:30:00Z",
        attachments: [
          { id: "a1", type: "image", url: "/placeholder.svg", name: "screenshot.svg", size: 2048 },
        ],
      },
      {
        id: "m2",
        ticketId: "t1",
        author: "support",
        message:
          "Thank you for contacting us. We are currently reviewing your withdrawal request. Processing may take 24-72 hours due to high volume.",
        createdAt: "2024-02-15T14:15:00Z",
      },
      {
        id: "m3",
        ticketId: "t1",
        author: "client",
        message: "Thank you for the update. I'll wait for the processing to complete.",
        createdAt: "2024-02-15T14:45:00Z",
      },
    ],
  },
  {
    id: "t2",
    clientId: "1",
    subject: "Investment plan question",
    description: "Need clarification on the Premium Strategy ROI...",
    status: "closed",
    createdAt: "2024-02-10T09:00:00Z",
    messages: [
      {
        id: "m4",
        ticketId: "t2",
        author: "client",
        message: "Could you clarify the expected ROI for the Premium Strategy?",
        createdAt: "2024-02-10T09:00:00Z",
      },
      {
        id: "m5",
        ticketId: "t2",
        author: "support",
        message:
          "The expected ROI ranges 6-9% monthly depending on market conditions.",
        createdAt: "2024-02-10T11:10:00Z",
      },
    ],
  },
  {
    id: "t3",
    clientId: "1",
    subject: "2FA setup assistance",
    description: "Having trouble setting up two-factor authentication...",
    status: "open",
    createdAt: "2024-02-08T12:00:00Z",
    messages: [
      { id: "m6", ticketId: "t3", author: "client", message: "I can't scan the QR in my authenticator app.", createdAt: "2024-02-08T12:00:00Z" },
      { id: "m7", ticketId: "t3", author: "support", message: "Please try copying the manual code and ensure your phone time is set to automatic.", createdAt: "2024-02-08T12:30:00Z" },
    ],
  },
];

const STORAGE_KEY = "support_tickets_v1";

export function useSupportData() {
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as SupportTicket[];
    } catch {}
    return seedTickets;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    } catch {}
  }, [tickets]);

  const getTicketsByClientId = (clientId: string) =>
    tickets
      .filter((t) => t.clientId === clientId)
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

  const getTicketById = (id: string) => tickets.find((t) => t.id === id);

  const replyToTicket = (
    ticketId: string,
    message: string,
    author: SupportReply["author"] = "support",
    attachments?: SupportAttachment[]
  ) => {
    if (!message.trim() && !(attachments && attachments.length)) return;
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        const nextMsg: SupportReply = {
          id: `m${Date.now()}`,
          ticketId,
          author,
          message: message.trim(),
          createdAt: new Date().toISOString(),
          attachments: attachments && attachments.length ? attachments : undefined,
        };
        return { ...t, messages: [...t.messages, nextMsg] };
      })
    );
  };

  const closeTicket = (ticketId: string) => {
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status: "closed" } : t)));
  };

  const reopenTicket = (ticketId: string) => {
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status: "open" } : t)));
  };

  const createTicket = (clientId: string, subject: string, description: string) => {
    const id = `t${Date.now()}`;
    const createdAt = new Date().toISOString();
    const ticket: SupportTicket = {
      id,
      clientId,
      subject: subject.trim(),
      description: description.trim(),
      status: "open",
      createdAt,
      messages: [
        { id: `m${Date.now() + 1}`, ticketId: id, author: "client", message: description.trim(), createdAt },
      ],
    };
    setTickets((prev) => [ticket, ...prev]);
    return ticket;
  };

  return {
    // data
    tickets,
    // getters
    getTicketsByClientId,
    getTicketById,
    // actions
    replyToTicket,
    closeTicket,
    reopenTicket,
    createTicket,
  };
}
