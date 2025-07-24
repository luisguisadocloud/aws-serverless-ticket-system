import { TicketPriority, TicketStatus, TicketType } from "../common/enums";

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  reporterId: string;
  assignedToId?: string;
  priority: TicketPriority;
  type: TicketType;
  createdAt: string;
  updatedAt: string;
}
