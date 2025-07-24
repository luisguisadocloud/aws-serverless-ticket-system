import z from "zod";
import { TicketPriority, TicketStatus, TicketType } from "../common/enums";

export const CreateTicketRequest = z.object({
  title: z.string().min(1, "Title is required").max(50, "Title must be less than 50 characters"),
  description: z.string().min(1, "Description is required").max(250, "Description must be less than 250 characters"),
  status: z.enum(TicketStatus).optional().default(TicketStatus.NEW),
  reporterId: z.uuid(),
  assignedToId: z.uuid().optional(),
  priority: z.enum(TicketPriority).optional().default(TicketPriority.MEDIUM),
  type: z.enum(TicketType).optional().default(TicketType.INCIDENT)
});

export const TicketIdParam = z.object({
  id: z.uuid()
});

export const UpdateTicketRequest = z.object({
  title: z.string().min(1, "Title is required").max(50, "Title must be less than 50 characters"),
  description: z.string().min(1, "Description is required").max(250, "Description must be less than 250 characters"),
  status: z.enum(TicketStatus),
  reporterId: z.uuid(),
  assignedToId: z.uuid().nullable().optional(),
  priority: z.enum(TicketPriority),
  type: z.enum(TicketType)
});

export const PatchTicketRequest = z.object({
  title: z.string().min(1, "Title is required").max(50, "Title must be less than 50 characters").optional(),
  description: z.string().min(1, "Description is required").max(250, "Description must be less than 250 characters").optional(),
  status: z.enum(TicketStatus).optional(),
  reporterId: z.uuid().optional(),
  assignedToId: z.uuid().nullable().optional(),
  priority: z.enum(TicketPriority).optional(),
  type: z.enum(TicketType).optional()
}).refine(
  (data) => {
    return Object.values(data).some(value => value !== undefined);
  },
  {
    message: "At least one field must be provided for PATCH operation",
    path: []
  }
);

export type CreateTicketDto = z.infer<typeof CreateTicketRequest>;
export type TicketIdParamDto = z.infer<typeof TicketIdParam>;
export type UpdateTicketDto = z.infer<typeof UpdateTicketRequest>;
export type PatchTicketDto = z.infer<typeof PatchTicketRequest>;
