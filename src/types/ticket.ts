export enum TicketStatus {
  NEW = "NEW",
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt?: string;
}

// Request types for validation
export interface CreateTicketRequest {
  title: string;
  description: string;
  status?: TicketStatus;
}

export interface UpdateTicketRequest {
  title: string;
  description: string;
  status: TicketStatus;
}

export interface UpdateTicketStatusRequest {
  status: TicketStatus;
}

// Response types
export interface TicketResponse extends Ticket {}

export interface ListTicketResponse extends Array<TicketResponse> {}

// Error response types
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: ValidationError[];
}
