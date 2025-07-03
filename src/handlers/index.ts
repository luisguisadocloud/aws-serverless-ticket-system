import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { HttpError } from "../errors/http-error";
import { NotFoundError } from "../errors/not-found-error";
import { TicketService } from "../services/ticket-service";

// Refactor: Functions for route handling
async function handleCreateTicket(event: APIGatewayProxyEvent) {
  const body = JSON.parse(event.body!);
  console.log("Create ticket", { body });
  const response = await TicketService.createTicket(body);

  return {
    statusCode: 201,
    body: JSON.stringify(response)
  };
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
  console.log(`Get ticket by id=${id}`);
  const ticket = await TicketService.getTicketById(id);

  if (!ticket) {
    throw new NotFoundError(`ticket ${id} not found`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(ticket)
  };
}

async function handleUpdateTicket(event: APIGatewayProxyEvent, id: string) {
  const body = JSON.parse(event.body!);
  console.log(`Update ticket with id=${id}`, { body });

  try {
    const updated = await TicketService.updateTicket(id, body);

    return {
      statusCode: 200,
      body: JSON.stringify(updated)
    };

  } catch (error) {
    console.error(`Error updating ticket ${id}:`, error);
    throw error;
  }
}

async function handleDeleteTicket(id: string) {
  console.log(`Delete by id=${id}`);
  try {
    await TicketService.deleteTicket(id);

    return {
      statusCode: 204,
      body: ""
    };
  } catch (error) {
    console.error(`Error deleting ticket ${id}`, error);
    throw error;
  }
}

async function handlePatchTicket(event: APIGatewayProxyEvent, id: string) {
  const body = JSON.parse(event.body!);
  const status = body.status;
  console.log(`Patch ticket with id=${id}`, { body });

  try {
    const updated = await TicketService.patchTicket(id, status);

    return {
      statusCode: 200,
      body: JSON.stringify(updated)
    };

  } catch (error) {
    console.error(`Error updating status ticket ${id}:`, error);
    throw error;
  }
}

// Refactor: Utility functions for routes
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

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log("event: ", { event });
    const { httpMethod: method, path } = event;
    const id = event.pathParameters?.id;

    if (isCreateTicketRoute(method, path)) {
      return await handleCreateTicket(event);

    } else if (isGetAllTicketsRoute(method, path)) {
      return await handleGetAllTickets();

    } else if (isGetTicketByIdRoute(method, path, id!)) {
      return await handleGetTicketById(id!);

    } else if (isUpdateTicketRoute(method, path, id!)) {
      return await handleUpdateTicket(event, id!);

    } else if (isDeleteTicketRoute(method, path, id!)) {
      return await handleDeleteTicket(id!);

    } else if (isPatchTicketRoute(method, path, id!)) {
      return await handlePatchTicket(event, id!);
    }

    // Route not found
    throw new NotFoundError("Route not found");

  } catch (error) {
    console.error("Error", { error });
    // HttpError, BadRequestError, NotFoundError
    if (error instanceof HttpError) {
      return {
        statusCode: error.statusCode,
        body: JSON.stringify({ message: error.message, details: error.details ?? undefined })
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" })
    };
  }
}
