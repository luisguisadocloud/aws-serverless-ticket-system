export enum TicketStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  IN_PROGRESS = "IN_PROGRESS"
};

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
}
