import { ConditionalCheckFailedException, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { NotFoundError } from '../errors/not-found-error';
import { CreateTicketDto, UpdateTicketDto, PatchTicketDto } from '../schemas/schemas';
import { Ticket } from '../types/ticket';
import { TicketStatus } from '../common/enums';
import { ErrorCodes } from '../common/error-codes';
const tableName = "dyn-tickets";
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export class TicketService {
  static async createTicket(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const newTicket: Ticket = {
      id: uuidv4(),
      title: createTicketDto.title,
      description: createTicketDto.description,
      status: createTicketDto.status,
      reporterId: createTicketDto.reporterId,
      assignedToId: createTicketDto.assignedToId,
      priority: createTicketDto.priority,
      type: createTicketDto.type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: tableName,
      Item: newTicket
    });

    const response = await docClient.send(command);
    console.log({ response });
    console.log({ response: JSON.stringify(response) });

    return newTicket;
  }

  static async getAllTickets(): Promise<Ticket[]> {
    const command = new ScanCommand({
      ProjectionExpression: "id, createdAt, description, priority, reporterId, assignedToId, #status, title, #type, updatedAt",
      ExpressionAttributeNames: { 
        "#status": "status",
        "#type": "type"
      },
      TableName: tableName,
    });

    const response = await docClient.send(command);
    const tickets: Ticket[] = (response.Items ?? []) as Ticket[];
    console.log({ response });
    console.log({ response: JSON.stringify(response) });

    for (const ticket of tickets) {
      console.log(`${ticket.id} - (${ticket.createdAt}, ${ticket.description}, ${ticket.status}, ${ticket.title})`);
    }
    return tickets;
  }

  static async getTicketById(id: string): Promise<Ticket | undefined> {
    const command = new GetCommand({
      TableName: tableName,
      Key: {
        id,
      },
    });

    const response = await docClient.send(command);
    console.log({ response });
    console.log({ response: JSON.stringify(response) });
    return response.Item as Ticket;
  }

  static async updateTicket(id: string, updateTicketDto: UpdateTicketDto): Promise<Record<string, any> | undefined> {
    try {
      const updateExpressions: string[] = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      // Campos requeridos que siempre se actualizan
      updateExpressions.push("title = :title");
      expressionAttributeValues[":title"] = updateTicketDto.title;

      updateExpressions.push("description = :description");
      expressionAttributeValues[":description"] = updateTicketDto.description;

      updateExpressions.push("#status = :status");
      expressionAttributeNames["#status"] = "status";
      expressionAttributeValues[":status"] = updateTicketDto.status;

      updateExpressions.push("reporterId = :reporterId");
      expressionAttributeValues[":reporterId"] = updateTicketDto.reporterId;

      updateExpressions.push("priority = :priority");
      expressionAttributeValues[":priority"] = updateTicketDto.priority;

      updateExpressions.push("#type = :type");
      expressionAttributeNames["#type"] = "type";
      expressionAttributeValues[":type"] = updateTicketDto.type;

      if (updateTicketDto.assignedToId !== undefined) {
        updateExpressions.push("assignedToId = :assignedToId");
        expressionAttributeValues[":assignedToId"] = updateTicketDto.assignedToId;
      }

      updateExpressions.push("updatedAt = :updatedAt");
      expressionAttributeValues[":updatedAt"] = new Date().toISOString();

      const command = new UpdateCommand({
        TableName: tableName,
        Key: { id },
        UpdateExpression: `set ${updateExpressions.join(", ")}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW",
        ConditionExpression: "attribute_exists(id)" // Si el ID no existe, lanza ConditionalCheckFailedException
      });

      const response = await docClient.send(command);
      console.log({ response });
      console.log({ response: JSON.stringify(response) });
      return response.Attributes;

    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        throw new NotFoundError(ErrorCodes.TICKET_NOT_FOUND, `Ticket with id ${id} not found`);
      }

      throw error;
    }
  }

  static async patchTicket(id: string, patchTicketDto: PatchTicketDto): Promise<Record<string, any> | undefined> {
    try {
      const updateExpressions: string[] = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      if (patchTicketDto.title !== undefined) {
        updateExpressions.push("title = :title");
        expressionAttributeValues[":title"] = patchTicketDto.title;
      }

      if (patchTicketDto.description !== undefined) {
        updateExpressions.push("description = :description");
        expressionAttributeValues[":description"] = patchTicketDto.description;
      }

      if (patchTicketDto.status !== undefined) {
        updateExpressions.push("#status = :status");
        expressionAttributeNames["#status"] = "status";
        expressionAttributeValues[":status"] = patchTicketDto.status;
      }

      if (patchTicketDto.reporterId !== undefined) {
        updateExpressions.push("reporterId = :reporterId");
        expressionAttributeValues[":reporterId"] = patchTicketDto.reporterId;
      }

      if (patchTicketDto.assignedToId !== undefined) {
        updateExpressions.push("assignedToId = :assignedToId");
        expressionAttributeValues[":assignedToId"] = patchTicketDto.assignedToId;
      }

      if (patchTicketDto.priority !== undefined) {
        updateExpressions.push("priority = :priority");
        expressionAttributeValues[":priority"] = patchTicketDto.priority;
      }

      if (patchTicketDto.type !== undefined) {
        updateExpressions.push("#type = :type");
        expressionAttributeNames["#type"] = "type";
        expressionAttributeValues[":type"] = patchTicketDto.type;
      }

      updateExpressions.push("updatedAt = :updatedAt");
      expressionAttributeValues[":updatedAt"] = new Date().toISOString();

      const command = new UpdateCommand({
        TableName: tableName,
        Key: { id },
        UpdateExpression: `set ${updateExpressions.join(", ")}`,
        ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW",
        ConditionExpression: "attribute_exists(id)"
      });

      const response = await docClient.send(command);
      console.log({ response });
      console.log({ response: JSON.stringify(response) });
      return response.Attributes;

    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        throw new NotFoundError(ErrorCodes.TICKET_NOT_FOUND, `Ticket with id ${id} not found`);
      }

      throw error;
    }
  }

  static async deleteTicket(id: string): Promise<void> {
    try {
      const command = new DeleteCommand({
        TableName: tableName,
        Key: {
          id
        },
        ConditionExpression: "attribute_exists(id)" // Si el ID no existe, lanza ConditionalCheckFailedException
      });

      const response = await docClient.send(command);
      console.log({ response });
      console.log({ response: JSON.stringify(response) });
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        throw new NotFoundError(ErrorCodes.TICKET_NOT_FOUND, `Ticket with id ${id} not found`);
      }

      throw error;
    }
  }
}
