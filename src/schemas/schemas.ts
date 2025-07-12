import z from "zod";
import { TicketStatus } from "../types/ticket";

export const CreateTicketRequest = z.object({
  title: z.string().min(1, "Title is required").max(50, "Title must be less than 100 characters"),
  description: z.string().min(1, "Description is required").max(100, "Description must be less than 1000 characters"),
  status: z.enum(TicketStatus).optional() // optional
});

export type CreateTicketDto = z.infer<typeof CreateTicketRequest>;