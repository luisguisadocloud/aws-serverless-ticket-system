# Ticket System Backend

## Description

This is a ticket management system backend built with **AWS Lambda** and **API Gateway** using **TypeScript**. The application provides a complete REST API for creating, reading, updating, and deleting technical support tickets.

## Architecture

- **Runtime**: Node.js 20 (AWS Lambda)
- **Database**: Amazon DynamoDB
- **API**: REST API with AWS API Gateway
- **Language**: TypeScript
- **Bundler**: esbuild for optimization
- **Validation**: Zod for schema validation

## Project Structure

```
ticket-system-backend/
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
├── package.json
├── tsconfig.json
└── README.md
```

## Features

### API Endpoints

- **POST** `/tickets` - Create a new ticket
- **GET** `/tickets` - Get all tickets
- **GET** `/tickets/{id}` - Get a ticket by ID
- **PUT** `/tickets/{id}` - Update a complete ticket
- **PATCH** `/tickets/{id}/status` - Update only the ticket status
- **DELETE** `/tickets/{id}` - Delete a ticket

### Ticket States

- `NEW` - New ticket
- `OPEN` - Open ticket
- `IN_PROGRESS` - In progress
- `RESOLVED` - Resolved
- `CLOSED` - Closed

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
- **Lambda Function**: `lmb-ticket`
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
  --function-name lmb-ticket \
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

## Local Development

### Requirements

- Node.js 20+
- AWS CLI configured
- Access to AWS DynamoDB

### Development Commands

```bash
# Install dependencies
npm install

# Build in development mode
npm run build

# Check TypeScript types
npx tsc --noEmit
```

## API Documentation

The complete API specification is available in `openapi/api.yaml` following the OpenAPI 3.0.4 standard.

## Author

- **Email**: lguisadom@gmail.com
- **Blog**: https://blog.luisguisado.cloud

## License

MIT License 