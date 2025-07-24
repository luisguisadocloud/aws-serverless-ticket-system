export enum TicketStatus {
  NEW = "NEW",
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
};

export enum TicketPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL"
};

export enum TicketType {
  INCIDENT = "INCIDENT",
  SERVICE_REQUEST = "SERVICE_REQUEST",
  QUESTION = "QUESTION"
};
