import { ConditionalCheckFailedException, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const tableName = "dyn-tickets";
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export class TicketService {

  static async createTicket(data) {
    const ticket = {
      id: uuidv4(),
      title: data.title,
      description: data.description,
      status: "OPEN",
      createdAt: new Date().toISOString()
    };

    const command = new PutCommand({
      TableName: tableName,
      Item: ticket
    });

    const response = await docClient.send(command);
    console.log({ response });
    console.log({ response: JSON.stringify(response) });

    return ticket;
  }

  static async getAllTickets() {
    const command = new ScanCommand({
      ProjectionExpression: "id, createdAt, description, #status, title",
      ExpressionAttributeNames: { "#status": "status" },
      TableName: tableName,
    });

    const response = await docClient.send(command);
    console.log({ response });
    console.log({ response: JSON.stringify(response) });
    for (const ticket of response.Items) {
      console.log(`${ticket.id} - (${ticket.createdAt}, ${ticket.description}, ${ticket.status}, ${ticket.title})`);
    }
    return response.Items ?? [];
  }

  static async getTicketById(id) {
    const command = new GetCommand({
      TableName: tableName,
      Key: {
        id,
      },
    });

    const response = await docClient.send(command);
    console.log({ response });
    console.log({ response: JSON.stringify(response) });
    return response.Item;
  }

  static async updateTicket(id, data) {
    try {
      const command = new UpdateCommand({
        TableName: tableName,
        Key: { id },
        UpdateExpression: "set title = :title, description = :description, #status = :status",
        ExpressionAttributeNames: {
          "#status": "status"
        },
        ExpressionAttributeValues: {
          ":title": data.title,
          ":description": data.description,
          ":status": data.status ?? 'OPEN'
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
        throw new Error("NOT_FOUND");
      }

      throw error;
    }
  }

  static async deleteTicket(id) {
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
      return response;
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        throw new Error("NOT_FOUND");
      }

      throw error;
    }
  }
}
