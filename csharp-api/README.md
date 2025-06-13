# ProductFlow API - C# Implementation

A comprehensive ASP.NET Core Web API for managing products and categories, built with Entity Framework Core and PostgreSQL.

## Features

- **Complete CRUD Operations** for Products and Categories
- **Advanced Filtering** and search capabilities
- **RESTful API Design** following industry standards
- **API Key Authentication** for secure access
- **Swagger/OpenAPI Documentation** with interactive testing
- **Entity Framework Core** with PostgreSQL support
- **Comprehensive Error Handling** and validation
- **Async/Await Pattern** for optimal performance

## Tech Stack

- **Framework**: ASP.NET Core 8.0
- **Database**: PostgreSQL with Entity Framework Core
- **Authentication**: API Key-based middleware
- **Documentation**: Swagger/OpenAPI 3.0
- **Validation**: Data Annotations and ModelState
- **Architecture**: Clean Architecture with Services pattern

## API Endpoints

### Products
- `GET /api/external/products` - Get all products with optional filtering
- `GET /api/external/products/{id}` - Get product by ID
- `GET /api/external/products/sku/{sku}` - Get product by SKU
- `POST /api/external/products` - Create new product
- `PUT /api/external/products/{id}` - Update existing product
- `DELETE /api/external/products/{id}` - Delete product

### Categories
- `GET /api/external/categories` - Get all categories
- `GET /api/external/categories/{id}` - Get category by ID
- `POST /api/external/categories` - Create new category
- `PUT /api/external/categories/{id}` - Update existing category
- `DELETE /api/external/categories/{id}` - Delete category

## Getting Started

### Prerequisites

- .NET 8.0 SDK
- PostgreSQL database
- Valid API key

### Installation

1. **Clone or download the csharp-api folder**

2. **Restore dependencies**
   ```bash
   cd csharp-api
   dotnet restore
   ```

3. **Configure database connection**
   
   Update `appsettings.json` or set environment variables:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "your-postgresql-connection-string"
     },
     "ApiKey": "your-api-key"
   }
   ```

4. **Run database migrations**
   ```bash
   dotnet ef database update
   ```

5. **Run the application**
   ```bash
   dotnet run
   ```

6. **Access Swagger UI**
   
   Navigate to `https://localhost:5001/swagger` to explore and test the API

### Environment Variables

Set these environment variables for production deployment:

- `DATABASE_URL` - PostgreSQL connection string
- `API_KEY` - API key for authentication
- `ASPNETCORE_ENVIRONMENT` - Set to "Production" for production

## Authentication

All API endpoints require authentication using an API key in the request header:

```http
x-api-key: YOUR_API_KEY
```

### Testing with Swagger

1. Open Swagger UI at `/swagger`
2. Click the "Authorize" button
3. Enter your API key in the "x-api-key" field
4. Click "Authorize" and "Close"
5. Test any endpoint using the "Try it out" functionality

## Request/Response Examples

### Create Product
```json
POST /api/external/products
{
  "name": "Advanced Programming Course",
  "description": "Comprehensive programming course covering advanced topics",
  "sku": "PROG-ADV-001",
  "productType": "course",
  "format": "online",
  "lifecycleStatus": "active",
  "entitlements": "Full access to course materials and certificate"
}
```

### Response Format
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Advanced Programming Course",
    "description": "Comprehensive programming course covering advanced topics",
    "sku": "PROG-ADV-001",
    "productType": "course",
    "format": "online",
    "lifecycleStatus": "active",
    "entitlements": "Full access to course materials and certificate",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "productOfferings": []
  },
  "message": "Product created successfully"
}
```

## Project Structure

```
csharp-api/
├── Controllers/           # API Controllers
├── Data/                 # Database Context
├── DTOs/                 # Data Transfer Objects
├── Middleware/           # Custom Middleware (API Key Auth)
├── Models/               # Entity Models
├── Services/             # Business Logic Services
├── Program.cs            # Application Entry Point
├── appsettings.json      # Configuration
└── ProductFlow.Api.csproj # Project File
```

## Error Handling

The API provides comprehensive error handling with standardized response format:

```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing API key)
- `404` - Not Found
- `500` - Internal Server Error

## Development

### Adding New Features

1. Create new DTOs in `/DTOs`
2. Update models in `/Models`
3. Add business logic to services in `/Services`
4. Create new controllers in `/Controllers`
5. Update database context if needed

### Running Tests

```bash
dotnet test
```

### Building for Production

```bash
dotnet publish -c Release -o ./publish
```

## Comparison with Node.js Implementation

This C# implementation provides the same functionality as the Node.js version but with:

- **Strong Typing** - Compile-time type checking and IntelliSense
- **Enterprise Features** - Built-in dependency injection, configuration, logging
- **Performance** - Optimized for high-throughput scenarios
- **Tooling** - Rich debugging and profiling tools
- **Ecosystem** - Access to extensive .NET library ecosystem

Both implementations share the same API contract and can be used interchangeably by clients.

## Support

For technical support or questions about the C# implementation:
- Check the Swagger documentation at `/swagger`
- Review the error messages in API responses
- Ensure proper API key authentication
- Verify database connectivity

## License

This project is part of the ProductFlow system and follows the same licensing terms as the main application.