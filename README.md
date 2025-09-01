# Ticket System Backend

## Description

This repository is the implementation of a **Serverless Ticket Management System on AWS**, built following an **evolutionary monorepo approach**.

Initially, the project will function as a serverless monolith, with a single AWS Lambda function (`manage-tickets`) that will handle all CRUD operations for tickets, along with a DynamoDB table for data storage. Security will be progressively integrated using AWS Cognito for authentication and authorization.

As the project matures, it will incrementally transform towards a logical microservices architecture.

The infrastructure for all these microservices will be managed declaratively using Terraform, with well-defined modules for each service, which will demonstrate Infrastructure as Code (IaC) best practices in a serverless environment.

This monorepo approach allows for gradual architecture evolution, facilitating learning of serverless, microservices, and IaC concepts while maintaining project coherence and ease of tracking.

## Architecture Evolution

### Phase 1: Serverless Monolith (Current)
- **Runtime**: Node.js 20 (AWS Lambda)
- **Database**: Amazon DynamoDB
- **API**: REST API with AWS API Gateway
- **Language**: TypeScript
- **Bundler**: esbuild for optimization
- **Validation**: Zod for schema validation
- **Authentication**: AWS Cognito (planned)

### Phase 2: Microservices Evolution (Future)
- **Service Separation**: Logical microservices within the same monorepo
- **Infrastructure**: Terraform modules for each service
- **Services Planned**:
  - **Ticket Service**: Core ticket management (current)
  - **Notification Service**: Automated communications
  - **User Service**: User profile and role management
  - **Analytics Service**: Reporting and metrics
- **Event-Driven Architecture**: AWS EventBridge for service communication
- **API Gateway**: Centralized API management

## Project Structure

```
aws-serverless-ticket-system/
├── openapi/
│   └── api.yaml          # OpenAPI 3.0 specification
├── src/
│   ├── errors/           # Custom error classes
│   ├── handlers/         # Lambda handlers
│   ├── schemas/          # Zod validation schemas
│   ├── services/         # Business logic
│   ├── types/           # TypeScript types
│   ├── utils/           # Utilities
│   └── validations/     # Additional validations
├── terraform/           # Infrastructure as Code (planned)
│   ├── modules/
│   │   ├── ticket-service/
│   │   ├── notification-service/
│   │   └── user-service/
│   └── environments/
├── package.json
├── tsconfig.json
└── README.md
```

## Features

### Current API Endpoints

- **POST** `/v1/tickets` - Create a new ticket
- **GET** `/v1/tickets` - Get all tickets
- **GET** `/v1/tickets/{id}` - Get a ticket by ID
- **PUT** `/v1/tickets/{id}` - Update a complete ticket (total replacement)
- **PATCH** `/v1/tickets/{id}` - Update a ticket partially
- **DELETE** `/v1/tickets/{id}` - Delete a ticket
- **OPTIONS** `/v1/tickets*` - CORS preflight requests (handled automatically)

### CORS Support

The API includes comprehensive CORS (Cross-Origin Resource Sharing) support to enable frontend applications to communicate with the backend from different domains.

#### CORS Headers Configuration

All API responses include the following CORS headers:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Api-Key',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE'
};
```

#### Preflight Request Handling

The Lambda function automatically handles OPTIONS requests (CORS preflight) for all endpoints, returning a 200 status with appropriate CORS headers.

#### Production CORS Best Practices

**⚠️ Security Warning**: The current configuration uses `Access-Control-Allow-Origin: *` which allows any domain to access your API. This is suitable for development and public APIs but requires careful consideration for production.

**For Production Environments:**

1. **Restrict Origin Access:**
   ```typescript
   // Instead of '*', specify allowed domains
   'Access-Control-Allow-Origin': 'https://yourdomain.com'
   
   // Or use a function to validate origins
   const allowedOrigins = [
     'https://yourdomain.com',
     'https://app.yourdomain.com',
     'https://staging.yourdomain.com'
   ];
   ```

2. **Environment-Based Configuration:**
   ```typescript
   const corsHeaders = {
     'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
     'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Api-Key',
     'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE',
     'Access-Control-Max-Age': '86400' // Cache preflight for 24 hours
   };
   ```

3. **Dynamic Origin Validation:**
   ```typescript
   function getCorsHeaders(origin: string): Record<string, string> {
     const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
     const isAllowed = allowedOrigins.includes('*') || allowedOrigins.includes(origin);
     
     return {
       'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
       'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Api-Key',
       'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE',
       'Access-Control-Max-Age': '86400'
     };
   }
   ```

4. **Additional Security Headers:**
   ```typescript
   const securityHeaders = {
     'X-Content-Type-Options': 'nosniff',
     'X-Frame-Options': 'DENY',
     'X-XSS-Protection': '1; mode=block',
     'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
   };
   ```

5. **Rate Limiting:**
   - Implement rate limiting at API Gateway level
   - Use AWS WAF for advanced traffic filtering
   - Monitor requests with CloudWatch

### Ticket States

- `NEW` - New ticket
- `OPEN` - Open ticket
- `IN_PROGRESS` - In progress
- `RESOLVED` - Resolved
- `CLOSED` - Closed

### Planned Features

- **Authentication & Authorization**: AWS Cognito integration
- **Real-time Notifications**: WebSocket support via API Gateway
- **File Attachments**: S3 integration for ticket attachments
- **Advanced Search**: Elasticsearch integration
- **Reporting & Analytics**: CloudWatch metrics and custom dashboards
- **Multi-tenancy**: Support for multiple organizations

## Package.json

### General Information
- **Name**: `ticket-system-backend`
- **Version**: `1.0.0`
- **License**: ISC

### Available Scripts

```bash
# Run tests (not implemented)
npm test

# Build project with esbuild
npm run build

# Create ZIP package file
npm run zip

# Build and package in a single command
npm run build-zip
```

### Production Dependencies

- **@aws-sdk/client-dynamodb**: Official AWS DynamoDB client
- **@aws-sdk/lib-dynamodb**: DynamoDB utility library
- **uuid**: Unique identifier generation
- **zod**: TypeScript schema validation

### Development Dependencies

- **@types/aws-lambda**: TypeScript types for AWS Lambda
- **esbuild**: Fast JavaScript/TypeScript bundler
- **typescript**: TypeScript compiler

## TypeScript Configuration

The project is configured with TypeScript using:
- **Target**: ES2020
- **Module**: CommonJS
- **Strict Mode**: Enabled
- **Module Resolution**: Node.js
- **Output Directory**: `dist/`

## AWS Lambda Deployment

### Automated Deployment

The project includes an automated deployment script that simplifies the process:

```bash
# Make the script executable (only first time)
chmod +x deploy-lambda.sh

# Run the deployment
./deploy-lambda.sh
```

#### `deploy-lambda.sh` Script Functionality

The script automatically performs the following actions:

1. **Compiles the project** using `npm run build-zip`
2. **Uploads the ZIP file** to AWS Lambda using AWS CLI
3. **Updates the Lambda function** with the new code

#### Script Configuration

The script is configured with the following default values:
- **Lambda Function**: `manage-tickets`
- **ZIP File**: `handlers.zip` (generated in `./dist/`)
- **AWS Profile**: `lguisadom-iamadmin`
- **AWS Region**: `us-east-2`

#### Requirements

To use the script you need:
- AWS CLI installed and configured
- AWS profile configured (`lguisadom-iamadmin`)
- Permissions to update the Lambda function

### Manual Deployment

If you prefer to deploy manually:

#### 1. Build the Project

```bash
# Install dependencies
npm install

# Build and package
npm run build-zip
```

#### 2. Upload to AWS Lambda

```bash
# AWS CLI command to update Lambda function
aws lambda update-function-code \
  --function-name your-lambda-function \
  --zip-file fileb://deployment.zip \
  --region your-aws-region
```

Example:
```bash
# AWS CLI command to update Lambda function
aws lambda update-function-code \
  --function-name manage-tickets \
  --zip-file fileb://deployment.zip \
  --region us-east-2 \
  --profile lguisadom-iamadmin
```

### 3. Required Configuration

Before deployment, make sure to:

1. **Create DynamoDB table**: `dyn-tickets`
2. **Configure IAM permissions** for Lambda to access DynamoDB
3. **Configure API Gateway** to expose endpoints
4. **Configure environment variables** if necessary
5. **Configure CORS settings** in API Gateway (optional but recommended)

#### CORS Configuration in API Gateway

There are two main approaches to handle CORS in API Gateway when using Lambda Proxy integration:

##### **Approach 1: Mock Integration for OPTIONS Endpoints**

Create separate OPTIONS endpoints for each route that handle preflight requests independently:

1. **Create OPTIONS endpoint for `/v1/tickets`:**
   - **Method**: OPTIONS
   - **Integration Type**: Mock
   - **Response Headers**:
     ```
     Access-Control-Allow-Origin: '*'
     Access-Control-Allow-Headers: 'Content-Type,Authorization,X-Api-Key'
     Access-Control-Allow-Methods: 'GET,POST,PUT,PATCH,DELETE'
     ```

2. **Create OPTIONS endpoint for `/v1/tickets/{id}`:**
   - **Method**: OPTIONS  
   - **Integration Type**: Mock
   - **Response Headers**:
     ```
     Access-Control-Allow-Origin: '*'
     Access-Control-Allow-Headers: 'Content-Type,Authorization,X-Api-Key'
     Access-Control-Allow-Methods: 'GET,POST,PUT,PATCH,DELETE'
     ```

**Steps in AWS Console:**
1. Go to API Gateway → Your API → Resources
2. Select the resource (e.g., `/v1/tickets`)
3. Click **Actions** → **Create Method**
4. Select **OPTIONS** as the method
5. Choose **Mock** as integration type
6. Configure the response headers in the integration response
7. Deploy the API

##### **Approach 2: Lambda Proxy Integration (Current Implementation)**

Let the Lambda function handle all CORS logic, including preflight requests:

- **All endpoints** (including OPTIONS) use Lambda Proxy integration
- **Lambda function** handles OPTIONS requests and returns appropriate CORS headers
- **No additional API Gateway configuration** needed for CORS
- **More control** over CORS logic in your application code

**Current Implementation:**
```typescript
// Lambda function handles OPTIONS requests
if (isOptionsRequest(method)) {
  return createCorsResponse(200, "");
}

// All other responses include CORS headers
function createCorsResponse(statusCode: number, body: string): APIGatewayProxyResult {
  return {
    statusCode,
    headers: corsHeaders,
    body
  };
}
```

##### **Comparison of Approaches**

| Aspect | Mock Integration | Lambda Proxy Integration |
|--------|------------------|-------------------------|
| **Setup Complexity** | High (manual endpoint creation) | Low (handled in code) |
| **Maintenance** | Requires API Gateway changes | Code-only changes |
| **Flexibility** | Limited to API Gateway options | Full control in Lambda |
| **Performance** | Slightly faster (no Lambda execution) | Lambda cold start for OPTIONS |
| **Consistency** | Separate configuration per endpoint | Centralized in Lambda |

**Recommendation**: Use **Lambda Proxy Integration** (Approach 2) for simplicity and consistency, especially when you need dynamic CORS logic or want to keep all API logic in your Lambda function.

### Minimum IAM Permissions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/dyn-tickets"
    }
  ]
}
```

## Infrastructure as Code (Planned)

### Terraform Modules Structure

```
terraform/
├── modules/
│   ├── ticket-service/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── notification-service/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── user-service/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── shared/
│       ├── dynamodb.tf
│       ├── cognito.tf
│       └── api-gateway.tf
├── environments/
│   ├── dev/
│   ├── staging/
│   └── prod/
└── examples/
```

### Planned Infrastructure Components

- **Lambda Functions**: One per microservice
- **DynamoDB Tables**: Separate tables per service
- **API Gateway**: Centralized API management
- **Cognito User Pool**: Authentication and authorization
- **EventBridge**: Service-to-service communication
- **CloudWatch**: Monitoring and logging
- **S3**: File storage for attachments
- **VPC**: Network isolation (if required)
- **WAF (Web Application Firewall)**: Traffic filtering and DDoS protection
- **CloudFront**: Content delivery and edge security

### Security Considerations

#### CORS Security in Production

1. **Origin Validation:**
   - Never use `Access-Control-Allow-Origin: *` in production
   - Implement dynamic origin validation based on environment
   - Use environment variables for allowed origins

2. **API Gateway Security:**
   - Enable AWS WAF for advanced traffic filtering
   - Configure rate limiting per API key or IP
   - Use API keys for public endpoints
   - Implement request throttling

3. **Lambda Security:**
   - Use least privilege IAM roles
   - Encrypt environment variables
   - Implement input validation and sanitization
   - Use AWS Secrets Manager for sensitive data

4. **Monitoring and Alerting:**
   - Set up CloudWatch alarms for unusual traffic patterns
   - Monitor CORS preflight requests
   - Alert on failed authentication attempts
   - Track API usage and performance metrics

## Local Development

### Requirements

- Node.js 20+
- AWS CLI configured
- Access to AWS DynamoDB
- Terraform (for future infrastructure management)

### Development Commands

```bash
# Install dependencies
npm install

# Build in development mode
npm run build

# Check TypeScript types
npx tsc --noEmit

# Local testing with AWS SAM (planned)
sam local start-api
```

## API Documentation

The complete API specification is available in `openapi/api.yaml` following the OpenAPI 3.0.4 standard.

## Contributing

This project follows an evolutionary approach. Contributions should:

1. **Maintain backward compatibility** during the monolith phase
2. **Follow microservices principles** when adding new features
3. **Include proper documentation** for all changes
4. **Add tests** for new functionality
5. **Update infrastructure code** when adding new services

## Author

- **Email**: lguisadom@gmail.com
- **Blog**: https://blog.luisguisado.cloud

## License

MIT License 