import { z, ZodError } from 'zod';
import { BadRequestError } from '../errors/bad-request.error';
import { ValidationError } from '../types/ticket';

/**
 * Professional validation service using Zod v4
 * Handles validation, error formatting, and logging
 */
export class ValidationService {
  /**
   * Validates data against a Zod schema with proper error handling
   * @param schema - Zod schema to validate against
   * @param data - Data to validate
   * @param context - Context for logging (e.g., 'CreateTicket', 'UpdateTicket')
   * @returns Validated and transformed data
   */
  static validate<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    context: string
  ): T {
    try {
      console.log(`[Validation] Starting validation for ${context}`, {
        context,
        dataKeys: data && typeof data === 'object' ? Object.keys(data) : 'non-object'
      });

      const result = schema.parse(data);

      console.log(`[Validation] ✅ Validation successful for ${context}`, {
        context,
        validatedKeys: Object.keys(result)
      });

      return result;
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = this.formatZodErrors(error);
        
        console.error(`[Validation] ❌ Validation failed for ${context}`, {
          context,
          errors: validationErrors,
          originalData: data
        });

        throw new BadRequestError(
          `Validation failed for ${context}`,
          validationErrors
        );
      }

      // Handle unexpected errors
      console.error(`[Validation] 💥 Unexpected validation error for ${context}`, {
        context,
        error: error instanceof Error ? error.message : String(error)
      });

      throw new BadRequestError(`Unexpected validation error for ${context}`);
    }
  }

  /**
   * Validates data against a Zod schema with safe parsing (returns null on error)
   * @param schema - Zod schema to validate against
   * @param data - Data to validate
   * @returns Validated data or null if validation fails
   */
  static safeValidate<T>(
    schema: z.ZodSchema<T>,
    data: unknown
  ): T | null {
    const result = schema.safeParse(data);
    return result.success ? result.data : null;
  }

  /**
   * Formats Zod errors into a consistent error structure
   * @param error - ZodError instance
   * @returns Formatted validation errors
   */
  private static formatZodErrors(error: ZodError): ValidationError[] {
    return error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: this.getErrorCode(err.code)
    }));
  }

  /**
   * Maps Zod error codes to custom error codes
   * @param code - Zod error code
   * @returns Custom error code
   */
  private static getErrorCode(code: string): string {
    const codeMap: Record<string, string> = {
      'invalid_type': 'INVALID_TYPE',
      'invalid_string': 'INVALID_STRING',
      'too_small': 'TOO_SMALL',
      'too_big': 'TOO_BIG',
      'invalid_enum_value': 'INVALID_ENUM',
      'invalid_uuid': 'INVALID_UUID',
      'invalid_date': 'INVALID_DATE',
      'unrecognized_keys': 'UNRECOGNIZED_KEYS'
    };

    return codeMap[code] || 'VALIDATION_ERROR';
  }

  /**
   * Validates and sanitizes request body
   * @param body - Raw request body
   * @param context - Validation context
   * @returns Parsed and validated body
   */
  static validateRequestBody<T>(
    body: string | null | undefined,
    schema: z.ZodSchema<T>,
    context: string
  ): T {
    if (!body) {
      throw new BadRequestError(`${context} request body is required`);
    }

    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(body);
    } catch (error) {
      throw new BadRequestError(`${context} request body must be valid JSON`);
    }

    return this.validate(schema, parsedBody, context);
  }

  /**
   * Validates path parameters
   * @param params - Path parameters object
   * @param schema - Schema for validation
   * @param context - Validation context
   * @returns Validated parameters
   */
  static validatePathParams<T>(
    params: Record<string, string> | null | undefined,
    schema: z.ZodSchema<T>,
    context: string
  ): T {
    if (!params) {
      throw new BadRequestError(`${context} path parameters are required`);
    }

    return this.validate(schema, params, context);
  }

  /**
   * Validates query parameters
   * @param queryParams - Query parameters object
   * @param schema - Schema for validation
   * @param context - Validation context
   * @returns Validated query parameters
   */
  static validateQueryParams<T>(
    queryParams: Record<string, string | string[]> | null | undefined,
    schema: z.ZodSchema<T>,
    context: string
  ): T {
    if (!queryParams) {
      return this.validate(schema, {}, context);
    }

    return this.validate(schema, queryParams, context);
  }
} 