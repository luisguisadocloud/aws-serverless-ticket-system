import { ConditionalCheckFailedException, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { NotFoundError } from '../errors/not-found-error';
import { CreateTicketDto } from '../schemas/schemas';
import { Ticket, TicketStatus } from '../types/ticket';
const tableName = "dyn-tickets";
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export class TicketService {
  static async createTicket(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const newTicket: Ticket = {
      id: uuidv4(),
      title: createTicketDto.title,
      description: createTicketDto.description,
      status: createTicketDto.status ?? TicketStatus.NEW,
      createdAt: new Date().toISOString()
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
      ProjectionExpression: "id, createdAt, description, #status, title",
      ExpressionAttributeNames: { "#status": "status" },
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

  static async updateTicket(id: string, reqUpdateTicket: any): Promise<Record<string, any> | undefined> {
    try {
      const command = new UpdateCommand({
        TableName: tableName,
        Key: { id },
        UpdateExpression: "set title = :title, description = :description, #status = :status",
        ExpressionAttributeNames: {
          "#status": "status"
        },
        ExpressionAttributeValues: {
          ":title": reqUpdateTicket.title,
          ":description": reqUpdateTicket.description,
          ":status": reqUpdateTicket.status ?? 'OPEN'
        },
        ReturnValues: "ALL_NEW",
        ConditionExpression: "attribute_exists(id)" // Si el ID no existe, lanza ConditionalCheckFailedException
      });

      const response = await docClient.send(command);
      console.log({ response });
      console.log({ response: JSON.stringify(response) });
      return response.Attributes;

    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        throw new NotFoundError(`Ticket with id ${id} not found`);
      }

      throw error;
    }
  }

  static async patchTicket(id: string, status: TicketStatus): Promise<Record<string, any> | undefined> {
    try {
      const command = new UpdateCommand({
        TableName: tableName,
        Key: { id },
        UpdateExpression: "set #status = :status, updatedAt = :updatedAt",
        ExpressionAttributeNames: {
          "#status": "status"
        },
        ExpressionAttributeValues: {
          ":status": status,
          ":updatedAt": new Date().toISOString()
        },
        ReturnValues: "ALL_NEW",
        ConditionExpression: "attribute_exists(id)" // Si el ID no existe, lanza ConditionalCheckFailedException
      });

      const response = await docClient.send(command);
      console.log({ response });
      console.log({ response: JSON.stringify(response) });
      return response.Attributes;

    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        throw new NotFoundError(`Ticket with id ${id} not found`);
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
        throw new NotFoundError(`Ticket with id ${id} not found`);
      }

      throw error;
    }
  }
}
