import { APIGatewayProxyResult } from 'aws-lambda';
import { ErrorResponse, ValidationError } from '../types/ticket';

/**
 * Utility class for creating consistent API Gateway responses
 * Follows OpenAPI specification and best practices
 */
export class ResponseUtils {
  /**
   * Creates a successful response with proper headers
   * @param statusCode - HTTP status code
   * @param body - Response body
   * @returns Formatted API Gateway response
   */
  static success<T>(
    statusCode: number,
    body: T
  ): APIGatewayProxyResult {
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS'
      },
      body: JSON.stringify(body)
    };
  }

  /**
   * Creates an error response with proper formatting
   * @param statusCode - HTTP status code
   * @param code - Error code
   * @param message - Error message
   * @param details - Optional validation details
   * @returns Formatted error response
   */
  static error(
    statusCode: number,
    code: string,
    message: string,
    details?: ValidationError[]
  ): APIGatewayProxyResult {
    const errorResponse: ErrorResponse = {
      code,
      message,
      ...(details && { details })
    };

    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS'
      },
      body: JSON.stringify(errorResponse)
    };
  }

  /**
   * Creates a 201 Created response
   * @param body - Response body
   * @returns Created response
   */
  static created<T>(body: T): APIGatewayProxyResult {
    return this.success(201, body);
  }

  /**
   * Creates a 200 OK response
   * @param body - Response body
   * @returns OK response
   */
  static ok<T>(body: T): APIGatewayProxyResult {
    return this.success(200, body);
  }

  /**
   * Creates a 204 No Content response
   * @returns No content response
   */
  static noContent(): APIGatewayProxyResult {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS'
      },
      body: ''
    };
  }

  /**
   * Creates a 400 Bad Request response
   * @param message - Error message
   * @param details - Optional validation details
   * @returns Bad request response
   */
  static badRequest(
    message: string = 'Bad Request',
    details?: ValidationError[]
  ): APIGatewayProxyResult {
    return this.error(400, 'bad_request', message, details);
  }

  /**
   * Creates a 401 Unauthorized response
   * @param message - Error message
   * @returns Unauthorized response
   */
  static unauthorized(
    message: string = 'Unauthorized'
  ): APIGatewayProxyResult {
    return this.error(401, 'unauthorized', message);
  }

  /**
   * Creates a 404 Not Found response
   * @param message - Error message
   * @returns Not found response
   */
  static notFound(
    message: string = 'Resource not found'
  ): APIGatewayProxyResult {
    return this.error(404, 'not_found', message);
  }

  /**
   * Creates a 500 Internal Server Error response
   * @param message - Error message
   * @returns Internal server error response
   */
  static internalError(
    message: string = 'Internal Server Error'
  ): APIGatewayProxyResult {
    return this.error(500, 'internal_server_error', message);
  }

  /**
   * Creates a CORS preflight response
   * @returns CORS preflight response
   */
  static corsPreflight(): APIGatewayProxyResult {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
        'Access-Control-Max-Age': '86400'
      },
      body: ''
    };
  }
}