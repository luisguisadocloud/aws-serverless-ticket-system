import { TicketService } from "./ticket-service.mjs";

export const handler = async (event) => {
  const { httpMethod: method, path } = event;
  const id = event.pathParameters?.id;

  if (method === "POST" && path === "/tickets") {
    const body = JSON.parse(event.body);
    console.log("Create ticket", { body });
    const response = await TicketService.createTicket(body);

    return {
      statusCode: 201,
      body: JSON.stringify(response)
    };

  } else if (method === "GET" && path === "/tickets") {
    console.log("Get all tickets");
    const tickets = await TicketService.getAllTickets();
    return {
      statusCode: 200,
      body: JSON.stringify(tickets)
    };

  } else if (method === "GET" && path.startsWith("/tickets/") && id) {
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

  } else if (method === "PUT" && path.startsWith("/tickets/") && id) {
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

  } else if (method === "DELETE" && path.startsWith("/tickets/") && id) {
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
