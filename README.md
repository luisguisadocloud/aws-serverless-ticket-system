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