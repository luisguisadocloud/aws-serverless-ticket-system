import { z } from 'zod';
import { TicketStatus } from '../types/ticket';

// Base ticket schema (maps to TicketBase in OpenAPI)
const TicketBaseSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters')
    .trim(),
  description: z.string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be less than 1000 characters')
    .trim(),
  status: z.nativeEnum(TicketStatus, {
    errorMap: () => ({ message: 'Status must be one of: NEW, OPEN, IN_PROGRESS, RESOLVED, CLOSED' })
  })
});

// Create ticket request schema (maps to CreateTicketRequest in OpenAPI)
export const CreateTicketSchema = TicketBaseSchema
  .pick({ title: true, description: true })
  .extend({
    status: z.nativeEnum(TicketStatus).optional().default(TicketStatus.NEW)
  })
  .strict();

// Update ticket request schema (maps to UpdateTicketRequest in OpenAPI)
export const UpdateTicketSchema = TicketBaseSchema
  .strict();

// Update ticket status schema (maps to PATCH /tickets/{id}/status in OpenAPI)
export const UpdateTicketStatusSchema = z.object({
  status: z.nativeEnum(TicketStatus, {
    errorMap: () => ({ message: 'Status must be one of: NEW, OPEN, IN_PROGRESS, RESOLVED, CLOSED' })
  })
}).strict();

// Ticket response schema (maps to TicketResponse in OpenAPI)
export const TicketResponseSchema = TicketBaseSchema.extend({
  id: z.string().uuid('Invalid ticket ID format'),
  createdAt: z.string().datetime('Invalid creation date format'),
  updatedAt: z.string().datetime('Invalid update date format').optional()
}).strict();

// List tickets response schema (maps to ListTicketResponse in OpenAPI)
export const ListTicketResponseSchema = z.array(TicketResponseSchema);

// UUID parameter schema for path parameters
export const UuidParamSchema = z.object({
  id: z.string().uuid('Invalid ID format')
}).strict();

// Error response schema
export const ErrorResponseSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.array(z.object({
    field: z.string(),
    message: z.string(),
    code: z.string().optional()
  })).optional()
}).strict();

// Type exports for TypeScript inference
export type CreateTicketRequest = z.infer<typeof CreateTicketSchema>;
export type UpdateTicketRequest = z.infer<typeof UpdateTicketSchema>;
export type UpdateTicketStatusRequest = z.infer<typeof UpdateTicketStatusSchema>;
export type TicketResponse = z.infer<typeof TicketResponseSchema>;
export type ListTicketResponse = z.infer<typeof ListTicketResponseSchema>;
export type UuidParam = z.infer<typeof UuidParamSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;