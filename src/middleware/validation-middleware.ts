import { APIGatewayProxyEvent } from 'aws-lambda';
import { z } from 'zod';
import { ValidationService } from '../validations/validators';

/**
 * Validation middleware for AWS Lambda handlers
 * Provides type-safe request validation with proper error handling
 */
export class ValidationMiddleware {
  /**
   * Creates a validation wrapper for request body validation
   * @param schema - Zod schema for body validation
   * @param context - Validation context for logging
   * @returns Function that validates and returns typed data
   */
  static validateBody<T>(
    schema: z.ZodSchema<T>,
    context: string
  ) {
    return (event: APIGatewayProxyEvent): T => {
      return ValidationService.validateRequestBody(
        event.body,
        schema,
        context
      );
    };
  }

  /**
   * Creates a validation wrapper for path parameters validation
   * @param schema - Zod schema for path parameters validation
   * @param context - Validation context for logging
   * @returns Function that validates and returns typed parameters
   */
  static validatePathParams<T>(
    schema: z.ZodSchema<T>,
    context: string
  ) {
    return (event: APIGatewayProxyEvent): T => {
      return ValidationService.validatePathParams(
        event.pathParameters,
        schema,
        context
      );
    };
  }

  /**
   * Creates a validation wrapper for query parameters validation
   * @param schema - Zod schema for query parameters validation
   * @param context - Validation context for logging
   * @returns Function that validates and returns typed query parameters
   */
  static validateQueryParams<T>(
    schema: z.ZodSchema<T>,
    context: string
  ) {
    return (event: APIGatewayProxyEvent): T => {
      return ValidationService.validateQueryParams(
        event.queryStringParameters,
        schema,
        context
      );
    };
  }

  /**
   * Validates multiple parts of the request at once
   * @param options - Validation options for different parts of the request
   * @returns Function that validates and returns typed request data
   */
  static validateRequest<T extends Record<string, unknown>>(options: {
    body?: z.ZodSchema<any>;
    pathParams?: z.ZodSchema<any>;
    queryParams?: z.ZodSchema<any>;
    context: string;
  }) {
    return (event: APIGatewayProxyEvent): T => {
      const result: Record<string, unknown> = {};

      if (options.body) {
        result.body = ValidationService.validateRequestBody(
          event.body,
          options.body,
          `${options.context}Body`
        );
      }

      if (options.pathParams) {
        result.pathParams = ValidationService.validatePathParams(
          event.pathParameters,
          options.pathParams,
          `${options.context}PathParams`
        );
      }

      if (options.queryParams) {
        result.queryParams = ValidationService.validateQueryParams(
          event.queryStringParameters,
          options.queryParams,
          `${options.context}QueryParams`
        );
      }

      return result as T;
    };
  }
}

/**
 * Higher-order function that wraps handlers with validation
 * @param validator - Validation function
 * @param handler - Original handler function
 * @returns Wrapped handler with validation
 */
export function withValidation<T, R>(
  validator: (event: APIGatewayProxyEvent) => T,
  handler: (validatedData: T, event: APIGatewayProxyEvent) => Promise<R>
) {
  return async (event: APIGatewayProxyEvent): Promise<R> => {
    const validatedData = validator(event);
    return await handler(validatedData, event);
  };
}

/**
 * Utility function to create typed validation functions
 * @param schema - Zod schema
 * @param context - Validation context
 * @returns Typed validation function
 */
export function createValidator<T>(
  schema: z.ZodSchema<T>,
  context: string
) {
  return (data: unknown): T => {
    return ValidationService.validate(schema, data, context);
  };
}