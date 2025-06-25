import { TicketService } from "./ticket-service.mjs";

// Logic refactor

// Refactor: Utility functions for routes
function isCreateTicketRoute(method, path) {
  return method === "POST" && path === "/tickets";
}

function isGetAllTicketsRoute(method, path) {
  return method === "GET" && path === "/tickets";
}

function isGetTicketByIdRoute(method, path, id) {
  return method === "GET" && path.startsWith("/tickets/") && id;
}

function isUpdateTicketRoute(method, path, id) {
  return method === "PUT" && path.startsWith("/tickets/") && id;
}

function isDeleteTicketRoute(method, path, id) {
  return method === "DELETE" && path.startsWith("/tickets/") && id;
}

export const handler = async (event) => {
  const { httpMethod: method, path } = event;
  const id = event.pathParameters?.id;

  if (isCreateTicketRoute(method, path)) {
    const body = JSON.parse(event.body);
    console.log("Create ticket", { body });
    const response = await TicketService.createTicket(body);

    return {
      statusCode: 201,
      body: JSON.stringify(response)
    };

  } else if (isGetAllTicketsRoute(method, path)) {
    console.log("Get all tickets");
    const tickets = await TicketService.getAllTickets();
    return {
      statusCode: 200,
      body: JSON.stringify(tickets)
    };

  } else if (isGetTicketByIdRoute(method, path, id)) {
    console.log(`Get ticket by id=${id}`);
    const ticket = await TicketService.getTicketById(id);

    if (!ticket) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `ticket ${id} not found` })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(ticket)
    };

  } else if (isUpdateTicketRoute(method, path, id)) {
    const body = JSON.parse(event.body);
    console.log(`Update ticket with id=${id}`, { body });

    try {
      const updated = await TicketService.updateTicket(id, body);

      return {
        statusCode: 200,
        body: JSON.stringify(updated)
      };

    } catch (error) {
      if (error.message === "NOT_FOUND") {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: `Ticket with id=${id} not found.` })
        };
      }

      console.error(`Error updating ticket ${id}:`, error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Internal Server Error" })
      };
    }

  } else if (isDeleteTicketRoute(method, path, id)) {
    console.log(`Delete by id={$id}`);
    try {
      await TicketService.deleteTicket(id);

      return {
        statusCode: 204,
        body: ""
      };
    } catch (error) {
      if (error.message === "NOT_FOUND") {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: `Ticket with id=${id} not found.` })
        };
      }

      console.error(`Error deleting ticket ${id}`, error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Internal Server Error" })
      };
    }
  }

  // Ruta no encontrada
  return {
    statusCode: 400,
    body: JSON.stringify({ message: "Bad request" })
  };
}
