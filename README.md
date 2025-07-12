# Ticket System Backend

A serverless ticket management system built with AWS Lambda, API Gateway, and DynamoDB, featuring robust validation using Zod v4.

## 🚀 Features

- **Type-safe validation** with Zod v4 (14x faster parsing)
- **OpenAPI 3.0 specification** compliance
- **Professional error handling** with detailed validation messages
- **CORS support** for cross-origin requests
- **Comprehensive logging** for debugging and monitoring
- **AWS Lambda optimized** architecture

## 📋 Prerequisites

- Node.js 20+
- AWS CLI configured
- TypeScript knowledge

## 🛠️ Installation

```bash
npm install
```

## 🏗️ Architecture & Design Decisions

### ¿Por qué esta arquitectura?

Esta implementación sigue los **principios SOLID** y las **mejores prácticas de la industria** para sistemas serverless. Cada decisión arquitectónica tiene un propósito específico:

#### 1. **Separación de Responsabilidades (Single Responsibility Principle)**

```
src/
├── validations/          # ✅ Solo validación
├── middleware/           # ✅ Solo orquestación
├── utils/               # ✅ Solo utilidades
├── handlers/            # ✅ Solo lógica de negocio
├── services/            # ✅ Solo acceso a datos
└── errors/              # ✅ Solo manejo de errores
```

**¿Por qué?** Cada módulo tiene una responsabilidad única y bien definida. Esto facilita:
- **Testing unitario** - Puedes probar cada capa independientemente
- **Mantenimiento** - Cambios en validación no afectan la lógica de negocio
- **Reutilización** - Los validadores se pueden usar en diferentes endpoints
- **Debugging** - Es más fácil identificar dónde está el problema

#### 2. **Validación con Zod v4: ¿Por qué no otras opciones?**

| Opción | Pros | Contras | ¿Por qué no elegimos esta? |
|--------|------|---------|---------------------------|
| **Manual** | Control total | Mucho código repetitivo | ❌ Violación DRY, propenso a errores |
| **Joi** | Maduro, estable | No inferencia TypeScript | ❌ Pérdida de type safety |
| **class-validator** | Decoradores | Configuración compleja | ❌ Overhead innecesario |
| **Ajv** | Rápido | Menos flexible | ❌ Menos expresivo |
| **Zod v4** | ✅ Type-safe, rápido, expresivo | - | ✅ **Mejor balance** |

**Zod v4 fue elegido porque:**
- **Type Safety**: Inferencia automática de tipos TypeScript
- **Performance**: 14x más rápido que v3, 57% menos bundle size
- **Expresividad**: API fluida y declarativa
- **Ecosistema**: Excelente integración con TypeScript/Node.js
- **Mantenimiento**: Activamente desarrollado y bien documentado

#### 3. **Patrón de Middleware: ¿Por qué no validación directa?**

**❌ Antes (Validación directa en handlers):**
```typescript
async function handleCreateTicket(event: APIGatewayProxyEvent) {
  const body = JSON.parse(event.body!); // ❌ Sin validación
  const response = await TicketService.createTicket(body);
  return { statusCode: 201, body: JSON.stringify(response) };
}
```

**✅ Ahora (Middleware pattern):**
```typescript
const validateCreateTicket = ValidationMiddleware.validateBody(
  CreateTicketSchema, 
  'CreateTicket'
);

const createTicketHandler = withValidation(
  validateCreateTicket, 
  handleCreateTicket
);
```

**¿Por qué este patrón?**
- **Composición**: Puedes combinar múltiples validaciones
- **Reutilización**: Un validador sirve para múltiples endpoints
- **Testabilidad**: Puedes probar validación y lógica por separado
- **Legibilidad**: El handler se enfoca solo en la lógica de negocio

#### 4. **Error Handling Estratégico**

**¿Por qué no usar try-catch básico?**

```typescript
// ❌ Error handling básico
try {
  const data = JSON.parse(event.body);
  // ... lógica
} catch (error) {
  return { statusCode: 500, body: "Error" };
}
```

**✅ Error handling profesional:**
```typescript
// Validación estructurada
const validationErrors = this.formatZodErrors(error);
throw new BadRequestError(
  `Validation failed for ${context}`,
  validationErrors
);

// Respuestas consistentes
return ResponseUtils.badRequest(
  'Validation failed',
  validationErrors
);
```

**Beneficios:**
- **Consistencia**: Todos los errores siguen el mismo formato
- **Debugging**: Logs estructurados con contexto
- **UX**: Mensajes de error claros para el cliente
- **Monitoreo**: Métricas específicas por tipo de error

#### 5. **OpenAPI First Design**

**¿Por qué mapear Zod a OpenAPI?**

```typescript
// Zod schema
export const CreateTicketSchema = z.object({
  title: z.string().min(1).max(255).trim(),
  description: z.string().min(1).max(1000).trim(),
  status: z.nativeEnum(TicketStatus).optional().default(TicketStatus.NEW)
}).strict();

// Mapea directamente a OpenAPI
CreateTicketRequest:
  allOf:
    - $ref: '#/components/schemas/TicketBase'
    - type: object
      required: [title, description]
```

**Beneficios:**
- **Documentación automática**: El código es la documentación
- **Consistencia**: Validación y especificación siempre sincronizadas
- **Herramientas**: Swagger UI, Postman, etc. funcionan automáticamente
- **Contratos**: Frontend y backend comparten la misma especificación

## 🔧 Implementación Detallada

### 1. Zod Schemas (`src/validations/schemas.ts`)

**¿Por qué usar `.strict()`?**
```typescript
export const CreateTicketSchema = z.object({
  title: z.string().min(1).max(255).trim(),
  description: z.string().min(1).max(1000).trim(),
  status: z.nativeEnum(TicketStatus).optional().default(TicketStatus.NEW)
}).strict(); // ✅ Rechaza propiedades no definidas
```

**Sin `.strict()`:**
```json
{
  "title": "Bug",
  "description": "Description",
  "status": "OPEN",
  "unknownField": "value" // ❌ Se acepta silenciosamente
}
```

**Con `.strict()`:**
```json
{
  "title": "Bug",
  "description": "Description", 
  "status": "OPEN",
  "unknownField": "value" // ❌ Error de validación
}
```

**¿Por qué `.trim()`?**
```typescript
title: z.string().min(1).max(255).trim()
```
- **Sanitización**: Elimina espacios en blanco innecesarios
- **UX**: Evita errores por espacios accidentales
- **Consistencia**: Datos limpios en la base de datos

### 2. Validation Service (`src/validations/validators.ts`)

**¿Por qué una clase de servicio?**

```typescript
export class ValidationService {
  static validate<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    context: string
  ): T {
    // Lógica centralizada de validación
  }
}
```

**Beneficios:**
- **Centralización**: Una sola fuente de verdad para validación
- **Logging estructurado**: Todos los logs siguen el mismo formato
- **Error handling consistente**: Mismo formato de errores en toda la app
- **Métricas**: Fácil agregar métricas de validación

**¿Por qué `context`?**
```typescript
ValidationService.validate(CreateTicketSchema, data, 'CreateTicket')
```
- **Debugging**: Sabes exactamente qué operación falló
- **Logs**: Filtros específicos por operación
- **Métricas**: Performance por endpoint
- **Monitoreo**: Alertas específicas por contexto

### 3. Validation Middleware (`src/middleware/validation-middleware.ts`)

**¿Por qué Higher-Order Functions?**

```typescript
export function withValidation<T, R>(
  validator: (event: APIGatewayProxyEvent) => T,
  handler: (validatedData: T, event: APIGatewayProxyEvent) => Promise<R>
) {
  return async (event: APIGatewayProxyEvent): Promise<R> => {
    const validatedData = validator(event);
    return await handler(validatedData, event);
  };
}
```

**Patrón de composición:**
- **Separación**: Validación y lógica de negocio separadas
- **Reutilización**: Un validador para múltiples handlers
- **Testing**: Puedes probar validación y lógica independientemente
- **Flexibilidad**: Fácil cambiar la estrategia de validación

### 4. Response Utils (`src/utils/response-utils.ts`)

**¿Por qué no respuestas directas?**

```typescript
// ❌ Respuesta directa
return {
  statusCode: 201,
  body: JSON.stringify(response)
};

// ✅ Response Utils
return ResponseUtils.created(response);
```

**Beneficios:**
- **Consistencia**: Headers CORS, Content-Type, etc. siempre iguales
- **Mantenimiento**: Un solo lugar para cambiar formato de respuestas
- **DRY**: No repetir código de headers
- **Testing**: Fácil mockear respuestas

## 🔍 Casos de Uso y Ejemplos

### 1. Crear un Ticket

**Request válido:**
```bash
POST /tickets
Content-Type: application/json

{
  "title": "Bug en producción",
  "description": "Los usuarios no pueden iniciar sesión",
  "status": "OPEN"
}
```

**Flujo de validación:**
1. **Parse JSON** → `ValidationService.validateRequestBody()`
2. **Validar schema** → `CreateTicketSchema.parse()`
3. **Transformar datos** → `.trim()`, `.default()`
4. **Handler** → `handleCreateTicket(validatedData)`
5. **Response** → `ResponseUtils.created(response)`

**Response exitoso:**
```json
{
  "id": "1b2c3d4e-5678-90ab-cdef-1234567890ab",
  "title": "Bug en producción",
  "description": "Los usuarios no pueden iniciar sesión", 
  "status": "OPEN",
  "createdAt": "2024-06-27T10:00:00Z",
  "updatedAt": "2024-06-27T10:00:00Z"
}
```

### 2. Request Inválido

**Request con errores:**
```bash
POST /tickets
Content-Type: application/json

{
  "title": "",  // ❌ Vacío
  "description": "Descripción válida",
  "status": "INVALID_STATUS",  // ❌ Status inválido
  "unknownField": "value"  // ❌ Campo no permitido
}
```

**Flujo de error:**
1. **Parse JSON** → ✅ Exitoso
2. **Validar schema** → ❌ `ZodError` con múltiples issues
3. **Format errors** → `formatZodErrors()`
4. **Throw BadRequestError** → Con detalles estructurados
5. **Response** → `ResponseUtils.badRequest()`

**Response de error:**
```json
{
  "code": "bad_request",
  "message": "Validation failed for CreateTicket",
  "details": [
    {
      "field": "title",
      "message": "Title is required",
      "code": "TOO_SMALL"
    },
    {
      "field": "status", 
      "message": "Status must be one of: NEW, OPEN, IN_PROGRESS, RESOLVED, CLOSED",
      "code": "INVALID_ENUM"
    },
    {
      "field": "unknownField",
      "message": "Unrecognized key in object: 'unknownField'",
      "code": "UNRECOGNIZED_KEYS"
    }
  ]
}
```

## 🚀 Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Deployment

```bash
npm run zip
```

## 📊 Performance Benefits

Zod v4 provides significant performance improvements:

- **14x faster** string parsing
- **7x faster** array parsing  
- **6.5x faster** object parsing
- **100x reduction** in TypeScript instantiations
- **57% smaller** bundle size
- **Better tree-shaking** with Zod Mini

## 🔍 Validation Features

### 1. Type Safety
```typescript
// Automatic TypeScript inference
type CreateTicketRequest = z.infer<typeof CreateTicketSchema>;
```

### 2. Strict Validation
```typescript
// Rejects unknown properties
const schema = z.object({
  title: z.string()
}).strict();
```

### 3. Custom Error Messages
```typescript
const schema = z.object({
  status: z.nativeEnum(TicketStatus, {
    errorMap: () => ({ 
      message: 'Status must be one of: NEW, OPEN, IN_PROGRESS, RESOLVED, CLOSED' 
    })
  })
});
```

### 4. Data Transformation
```typescript
const schema = z.object({
  title: z.string().trim(),  // Automatically trims whitespace
  status: z.nativeEnum(TicketStatus).default(TicketStatus.NEW)
});
```

## 🛡️ Error Handling

The system provides comprehensive error handling:

### Validation Errors
- Detailed field-level error messages
- Custom error codes for different validation types
- Structured error responses following OpenAPI specification

### HTTP Errors
- Proper status codes (400, 401, 404, 500)
- Consistent error response format
- CORS headers for all responses

### Logging
- Structured logging for all validation attempts
- Error context for debugging
- Performance metrics for validation operations

## 🔧 Configuration

### Environment Variables
```bash
# DynamoDB table name
TICKET_TABLE_NAME=tickets

# AWS region
AWS_REGION=us-east-1
```

### TypeScript Configuration
The project is configured for optimal Zod usage:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

## 📚 API Documentation

Full API documentation is available in `openapi/api.yaml` and includes:

- Request/response schemas
- Validation rules
- Error responses
- Authentication requirements

## 🤝 Contributing

1. Follow the existing code structure
2. Add validation for new endpoints
3. Update OpenAPI specification
4. Include proper error handling
5. Add comprehensive logging

## 📄 License

ISC License
