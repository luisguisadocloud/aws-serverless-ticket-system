import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import z from 'zod';
import { ErrorCodes } from "../common/error-codes";
import { BadRequestError } from "../errors/bad-request.error";
import { HttpError } from "../errors/http-error";
import { NotFoundError } from "../errors/not-found-error";
import { CreateTicketDto, CreateTicketRequest, PatchTicketDto, PatchTicketRequest, TicketIdParam, TicketIdParamDto, UpdateTicketDto, UpdateTicketRequest } from "../schemas/schemas";
import { TicketService } from "../services/ticket-service";

// Refactor: Functions for route handling
async function handleCreateTicket(event: APIGatewayProxyEvent) {
  try {
    if (!event.body) {
      throw new BadRequestError(ErrorCodes.BAD_REQUEST, "Validation failed", ["Body not found"]);
    }

    if (typeof event.body !== 'string') {
      throw new BadRequestError(ErrorCodes.BAD_REQUEST, "Validation failed", ["Body is not string"]);
    }

    const body = JSON.parse(event.body);
    const createTicketDto: CreateTicketDto = CreateTicketRequest.parse(body);

    console.log("Create ticket", { body });
    const response = await TicketService.createTicket(createTicketDto);

    return {
      statusCode: 201,
      body: JSON.stringify(response)
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Error issues", { issues: error.issues, message: error.message });
      const errorMessages = error.issues.map(issue => `${issue.path.join(".")} - ${issue.message}`);
      throw new BadRequestError(ErrorCodes.BAD_REQUEST, "Validation failed", errorMessages);
    }

    throw error;
  }
}

async function handleGetAllTickets() {
  console.log("Get all tickets");
  const tickets = await TicketService.getAllTickets();
  return {
    statusCode: 200,
    body: JSON.stringify(tickets)
  };
}

async function handleGetTicketById(id: string) {
  try {
    const validatedParams: TicketIdParamDto = TicketIdParam.parse({ id });

    console.log(`Get ticket by id=${validatedParams.id}`);
    const ticket = await TicketService.getTicketById(validatedParams.id);

    if (!ticket) {
      throw new NotFoundError(ErrorCodes.TICKET_NOT_FOUND, `ticket with id="${validatedParams.id}" not found`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify(ticket)
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("ID validation error", { issues: error.issues, message: error.message });
      const errorMessages = error.issues.map(issue => `${issue.path.join(".")} - ${issue.message}`);
      throw new BadRequestError(ErrorCodes.BAD_REQUEST, "Invalid ticket ID", errorMessages);
    }

    throw error;
  }
}

async function handleUpdateTicket(event: APIGatewayProxyEvent, id: string) {

  try {
    if (!event.body) {
      throw new BadRequestError(ErrorCodes.BAD_REQUEST, "Validation failed", ["Body not found"]);
    }

    if (typeof event.body !== 'string') {
      throw new BadRequestError(ErrorCodes.BAD_REQUEST, "Validation failed", ["Body is not string"]);
    }

    const body = JSON.parse(event.body);
    const updateTicketDto: UpdateTicketDto = UpdateTicketRequest.parse(body);

    const validatedParams: TicketIdParamDto = TicketIdParam.parse({ id });

    console.log(`Update ticket by id=${validatedParams.id}`);
    const updated = await TicketService.updateTicket(id, updateTicketDto);

    return {
      statusCode: 200,
      body: JSON.stringify(updated)
    };

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Error issues", { issues: error.issues, message: error.message });
      const errorMessages = error.issues.map(issue => `${issue.path.join(".")} - ${issue.message}`);
      throw new BadRequestError(ErrorCodes.BAD_REQUEST, "Validation failed", errorMessages);
    }

    throw error;
  }
}

async function handlePatchTicket(event: APIGatewayProxyEvent, id: string) {
  try {
    if (!event.body) {
      throw new BadRequestError(ErrorCodes.BAD_REQUEST, "Validation failed", ["Body not found"]);
    }

    if (typeof event.body !== 'string') {
      throw new BadRequestError(ErrorCodes.BAD_REQUEST, "Validation failed", ["Body is not string"]);
    }

    const body = JSON.parse(event.body);
    const patchTicketDto: PatchTicketDto = PatchTicketRequest.parse(body);

    const validatedParams: TicketIdParamDto = TicketIdParam.parse({ id });

    console.log(`Patch ticket by id=${validatedParams.id}`);
    const updated = await TicketService.patchTicket(id, patchTicketDto);

    return {
      statusCode: 200,
      body: JSON.stringify(updated)
    };

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Error issues", { issues: error.issues, message: error.message });
      const errorMessages = error.issues.map(issue => `${issue.path.join(".")} - ${issue.message}`);
      throw new BadRequestError(ErrorCodes.BAD_REQUEST, "Validation failed", errorMessages);
    }

    throw error;
  }
}

async function handleDeleteTicket(id: string) {
  try {
    const validatedParams: TicketIdParamDto = TicketIdParam.parse({ id });
    
    console.log(`Delete by id=${validatedParams.id}`);
    await TicketService.deleteTicket(validatedParams.id);


    return {
      statusCode: 204,
      body: ""
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("ID validation error", { issues: error.issues, message: error.message });
      const errorMessages = error.issues.map(issue => `${issue.path.join(".")} - ${issue.message}`);
      throw new BadRequestError(ErrorCodes.BAD_REQUEST, "Invalid ticket ID", errorMessages);
    }

    throw error;
  }
}

// Refactor: Utility functions for routes
function isCreateTicketRoute(method: string, path: string) {
  return method === "POST" && path === "/v1/tickets";
}

function isGetAllTicketsRoute(method: string, path: string) {
  return method === "GET" && path === "/v1/tickets";
}

function isGetTicketByIdRoute(method: string, path: string) {
  return method === "GET" && path.startsWith("/v1/tickets/") && path !== "/tickets";
}

function isUpdateTicketRoute(method: string, path: string) {
  return method === "PUT" && path.startsWith("/v1/tickets/") && path !== "/tickets";
}

function isDeleteTicketRoute(method: string, path: string) {
  return method === "DELETE" && path.startsWith("/v1/tickets/") && path !== "/tickets";
}

function isPatchTicketRoute(method: string, path: string) {
  return method === "PATCH" && path.startsWith("/v1/tickets/") && path !== "/tickets";
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log("event: ", { event });
    const { httpMethod: method, path } = event;
    const id = event.pathParameters?.id;

    if (isCreateTicketRoute(method, path)) {
      return await handleCreateTicket(event);

    } else if (isGetAllTicketsRoute(method, path)) {
      return await handleGetAllTickets();

    } else if (isGetTicketByIdRoute(method, path)) {
      if (!id) {
        throw new BadRequestError(
          ErrorCodes.BAD_REQUEST,
          "Ticket ID is required", ["Missing ticket ID parameter"]
        );
      }
      return await handleGetTicketById(id);

    } else if (isUpdateTicketRoute(method, path)) {
      if (!id) {
        throw new BadRequestError(
          ErrorCodes.BAD_REQUEST,
          "Ticket ID is required", ["Missing ticket ID parameter"]
        );
      }
      return await handleUpdateTicket(event, id);

    } else if (isPatchTicketRoute(method, path)) {
      if (!id) {
        throw new BadRequestError(
          ErrorCodes.BAD_REQUEST,
          "Ticket ID is required", ["Missing ticket ID parameter"]
        );
      }
      return await handlePatchTicket(event, id);

    } else if (isDeleteTicketRoute(method, path)) {
      if (!id) {
        throw new BadRequestError(
          ErrorCodes.BAD_REQUEST,
          "Ticket ID is required", ["Missing ticket ID parameter"]
        );
      }
      return await handleDeleteTicket(id);
    }

    // Path not found
    throw new NotFoundError(ErrorCodes.PATH_NOT_FOUND, "Path not found");

  } catch (error) {
    console.error("Error", { error });

    // HttpError, BadRequestError, NotFoundError
    if (error instanceof HttpError) {
      return {
        statusCode: error.statusCode,
        body: JSON.stringify({ code: error.code, message: error.message, details: error.details ?? undefined })
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ code: ErrorCodes.INTERNAL_SERVER_ERROR, message: "Unexpected server error" })
    };
  }
}
