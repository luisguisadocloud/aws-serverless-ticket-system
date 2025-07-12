import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { HttpError } from "../errors/http-error";
import { NotFoundError } from "../errors/not-found-error";
import { TicketService } from "../services/ticket-service";
import { ValidationMiddleware, withValidation } from "../middleware/validation-middleware";
import { ResponseUtils } from "../utils/response-utils";
import {
  CreateTicketSchema,
  UpdateTicketSchema,
  UpdateTicketStatusSchema,
  UuidParamSchema,
  CreateTicketRequest,
  UpdateTicketRequest,
  UpdateTicketStatusRequest,
  UuidParam
} from "../validations/schemas";

// Validation functions using Zod v4
const validateCreateTicket = ValidationMiddleware.validateBody(CreateTicketSchema, 'CreateTicket');
const validateUpdateTicket = ValidationMiddleware.validateBody(UpdateTicketSchema, 'UpdateTicket');
const validateUpdateStatus = ValidationMiddleware.validateBody(UpdateTicketStatusSchema, 'UpdateTicketStatus');
const validateTicketId = ValidationMiddleware.validatePathParams(UuidParamSchema, 'TicketId');

// Handler functions with validation
async function handleCreateTicket(validatedData: CreateTicketRequest): Promise<APIGatewayProxyResult> {
  console.log("Create ticket", { validatedData });
  const response = await TicketService.createTicket(validatedData);
  return ResponseUtils.created(response);
}

async function handleGetAllTickets(): Promise<APIGatewayProxyResult> {
  console.log("Get all tickets");
  const tickets = await TicketService.getAllTickets();
  return ResponseUtils.ok(tickets);
}

async function handleGetTicketById(validatedParams: UuidParam): Promise<APIGatewayProxyResult> {
  console.log(`Get ticket by id=${validatedParams.id}`);
  const ticket = await TicketService.getTicketById(validatedParams.id);

  if (!ticket) {
    throw new NotFoundError(`Ticket ${validatedParams.id} not found`);
  }

  return ResponseUtils.ok(ticket);
}

async function handleUpdateTicket(
  validatedData: UpdateTicketRequest,
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const validatedParams = validateTicketId(event);
  console.log(`Update ticket with id=${validatedParams.id}`, { validatedData });

  try {
    const updated = await TicketService.updateTicket(validatedParams.id, validatedData);
    return ResponseUtils.ok(updated);
  } catch (error) {
    console.error(`Error updating ticket ${validatedParams.id}:`, error);
    throw error;
  }
}

async function handleDeleteTicket(validatedParams: UuidParam): Promise<APIGatewayProxyResult> {
  console.log(`Delete ticket by id=${validatedParams.id}`);
  try {
    await TicketService.deleteTicket(validatedParams.id);
    return ResponseUtils.noContent();
  } catch (error) {
    console.error(`Error deleting ticket ${validatedParams.id}`, error);
    throw error;
  }
}

async function handlePatchTicket(
  validatedData: UpdateTicketStatusRequest,
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const validatedParams = validateTicketId(event);
  console.log(`Patch ticket with id=${validatedParams.id}`, { validatedData });

  try {
    const updated = await TicketService.patchTicket(validatedParams.id, validatedData.status);
    return ResponseUtils.ok(updated);
  } catch (error) {
    console.error(`Error updating status ticket ${validatedParams.id}:`, error);
    throw error;
  }
}

// Wrapped handlers with validation
const createTicketHandler = withValidation(validateCreateTicket, handleCreateTicket);
const updateTicketHandler = withValidation(validateUpdateTicket, handleUpdateTicket);
const updateStatusHandler = withValidation(validateUpdateStatus, handlePatchTicket);
const getTicketByIdHandler = withValidation(validateTicketId, handleGetTicketById);
const deleteTicketHandler = withValidation(validateTicketId, handleDeleteTicket);

// Route utility functions
function isCreateTicketRoute(method: string, path: string) {
  return method === "POST" && path === "/tickets";
}

function isGetAllTicketsRoute(method: string, path: string) {
  return method === "GET" && path === "/tickets";
}

function isGetTicketByIdRoute(method: string, path: string, id: string) {
  return method === "GET" && path.startsWith("/tickets/") && id;
}

function isUpdateTicketRoute(method: string, path: string, id: string) {
  return method === "PUT" && path.startsWith("/tickets/") && id;
}

function isDeleteTicketRoute(method: string, path: string, id: string) {
  return method === "DELETE" && path.startsWith("/tickets/") && id;
}

function isPatchTicketRoute(method: string, path: string, id: string) {
  return method === "PATCH" && path.startsWith("/tickets/") && id;
}

function isOptionsRequest(method: string) {
  return method === "OPTIONS";
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log("Event received:", { 
      method: event.httpMethod, 
      path: event.path, 
      hasBody: !!event.body,
      pathParams: event.pathParameters 
    });

    const { httpMethod: method, path } = event;
    const id = event.pathParameters?.id;

    // Handle CORS preflight requests
    if (isOptionsRequest(method)) {
      return ResponseUtils.corsPreflight();
    }

    // Route handling with validation
    if (isCreateTicketRoute(method, path)) {
      return await createTicketHandler(event);

    } else if (isGetAllTicketsRoute(method, path)) {
      return await handleGetAllTickets();

    } else if (isGetTicketByIdRoute(method, path, id!)) {
      return await getTicketByIdHandler(event);

    } else if (isUpdateTicketRoute(method, path, id!)) {
      return await updateTicketHandler(event);

    } else if (isDeleteTicketRoute(method, path, id!)) {
      return await deleteTicketHandler(event);

    } else if (isPatchTicketRoute(method, path, id!)) {
      return await updateStatusHandler(event);
    }

    // Route not found
    throw new NotFoundError("Route not found");

  } catch (error) {
    console.error("Handler error:", { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    // Handle different types of errors
    if (error instanceof HttpError) {
      return ResponseUtils.error(
        error.statusCode,
        getErrorCode(error.statusCode),
        error.message,
        error.details as any
      );
    }

    // Handle unexpected errors
    return ResponseUtils.internalError(
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  }
}

// Helper function to map status codes to error codes
function getErrorCode(statusCode: number): string {
  const errorCodeMap: Record<number, string> = {
    400: 'bad_request',
    401: 'unauthorized',
    403: 'forbidden',
    404: 'not_found',
    409: 'conflict',
    422: 'unprocessable_entity',
    500: 'internal_server_error'
  };

  return errorCodeMap[statusCode] || 'unknown_error';
}
