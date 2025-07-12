# Sistema de Tickets Backend

## Descripción

Este es un sistema de gestión de tickets backend construido con **AWS Lambda** y **API Gateway** utilizando **TypeScript**. La aplicación proporciona una API REST completa para crear, leer, actualizar y eliminar tickets de soporte técnico.

## Arquitectura

- **Runtime**: Node.js 20 (AWS Lambda)
- **Base de Datos**: Amazon DynamoDB
- **API**: REST API con AWS API Gateway
- **Lenguaje**: TypeScript
- **Bundler**: esbuild para optimización
- **Validación**: Zod para validación de esquemas

## Estructura del Proyecto

```
ticket-system-backend/
├── openapi/
│   └── api.yaml          # Especificación OpenAPI 3.0
├── src/
│   ├── errors/           # Clases de errores personalizadas
│   ├── handlers/         # Manejadores de Lambda
│   ├── schemas/          # Esquemas de validación Zod
│   ├── services/         # Lógica de negocio
│   ├── types/           # Tipos TypeScript
│   ├── utils/           # Utilidades
│   └── validations/     # Validaciones adicionales
├── package.json
├── tsconfig.json
└── README.md
```

## Funcionalidades

### Endpoints de la API

- **POST** `/tickets` - Crear un nuevo ticket
- **GET** `/tickets` - Obtener todos los tickets
- **GET** `/tickets/{id}` - Obtener un ticket por ID
- **PUT** `/tickets/{id}` - Actualizar un ticket completo
- **PATCH** `/tickets/{id}/status` - Actualizar solo el estado del ticket
- **DELETE** `/tickets/{id}` - Eliminar un ticket

### Estados de Ticket

- `NEW` - Nuevo ticket
- `OPEN` - Ticket abierto
- `IN_PROGRESS` - En progreso
- `RESOLVED` - Resuelto
- `CLOSED` - Cerrado

## Package.json

### Información General
- **Nombre**: `ticket-system-backend`
- **Versión**: `1.0.0`
- **Licencia**: ISC

### Scripts Disponibles

```bash
# Ejecutar tests (no implementado)
npm test

# Construir el proyecto con esbuild
npm run build

# Crear archivo ZIP del empaquetado
npm run zip

# Construir y empaquetar en un solo comando
npm run build-zip
```

### Dependencias de Producción

- **@aws-sdk/client-dynamodb**: Cliente oficial de AWS para DynamoDB
- **@aws-sdk/lib-dynamodb**: Librería de utilidades para DynamoDB
- **uuid**: Generación de identificadores únicos
- **zod**: Validación de esquemas TypeScript

### Dependencias de Desarrollo

- **@types/aws-lambda**: Tipos TypeScript para AWS Lambda
- **esbuild**: Bundler rápido para JavaScript/TypeScript
- **typescript**: Compilador de TypeScript

## Configuración de TypeScript

El proyecto está configurado con TypeScript usando:
- **Target**: ES2020
- **Module**: CommonJS
- **Strict Mode**: Habilitado
- **Module Resolution**: Node.js
- **Output Directory**: `dist/`

## Despliegue en AWS Lambda

### 1. Construir el Proyecto

```bash
# Instalar dependencias
npm install

# Construir y empaquetar
npm run build-zip
```

### 2. Subir a AWS Lambda

```bash
# Comando AWS CLI para actualizar la función Lambda
aws lambda update-function-code \
  --function-name tu-funcion-lambda \
  --zip-file fileb://deployment.zip \
  --region tu-region-aws
```

Example:
```bash
# Comando AWS CLI para actualizar la función Lambda
aws lambda update-function-code \
  --function-name lmb-ticket \
  --zip-file fileb://deployment.zip \
  --region us-east-2
  --profile lguisadom-iamadmin
```

### 3. Configuración Requerida

Antes del despliegue, asegúrate de:

1. **Crear la tabla DynamoDB**: `dyn-tickets`
2. **Configurar permisos IAM** para que Lambda pueda acceder a DynamoDB
3. **Configurar API Gateway** para exponer los endpoints
4. **Configurar variables de entorno** si es necesario

### Permisos IAM Mínimos

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

## Desarrollo Local

### Requisitos

- Node.js 20+
- AWS CLI configurado
- Acceso a AWS DynamoDB

### Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Construir en modo desarrollo
npm run build

# Verificar tipos TypeScript
npx tsc --noEmit
```

## Documentación de la API

La especificación completa de la API está disponible en `openapi/api.yaml` siguiendo el estándar OpenAPI 3.0.4.

## Autor

- **Email**: lguisadom@gmail.com
- **Blog**: https://blog.luisguisado.cloud

## Licencia

MIT License 