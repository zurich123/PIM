# ProductFlow External API Documentation

## Overview

The ProductFlow External API allows clients to perform CRUD operations on Products and Product Categories. All endpoints require API key authentication.

**Base URL:** `https://your-domain.com/api`  
**API Version:** 1.0.0  
**Authentication:** API Key (x-api-key header)

## Authentication

All API requests must include your API key in the `x-api-key` header:

```bash
curl -H "x-api-key: YOUR_API_KEY" https://your-domain.com/api/external/products
```

## API Endpoints

### Products API

#### Get All Products
**GET** `/api/external/products`

Retrieve all products with optional filtering.

**Query Parameters:**
- `productType` (optional): Filter by product type (`course`, `book`, `bundle`, `membership`)
- `lifecycleStatus` (optional): Filter by lifecycle status (`active`, `retired`, `development`)
- `format` (optional): Filter by format (`digital`, `physical`, `hybrid`)
- `search` (optional): Search products by name

**Example Request:**
```bash
curl -H "x-api-key: YOUR_API_KEY" \
  "https://your-domain.com/api/external/products?productType=course&format=digital"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "productName": "Advanced JavaScript Course",
      "productId": "JS-ADV-001",
      "productType": "course",
      "format": "digital",
      "lifecycleStatus": "active",
      "membershipFlag": false,
      "membershipEntitlements": null,
      "bundleEntitlements": null,
      "revenueRecognitionCode": null,
      "reportingTags": ["programming", "javascript"],
      "offerings": []
    }
  ],
  "count": 1
}
```

#### Get Product by ID
**GET** `/api/external/products/{id}`

Retrieve a specific product by its ID.

**Path Parameters:**
- `id` (integer): Product ID

**Example Request:**
```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://your-domain.com/api/external/products/1
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "productName": "Advanced JavaScript Course",
    "productId": "JS-ADV-001",
    "productType": "course",
    "format": "digital",
    "lifecycleStatus": "active",
    "membershipFlag": false,
    "membershipEntitlements": null,
    "bundleEntitlements": null,
    "revenueRecognitionCode": null,
    "reportingTags": ["programming", "javascript"],
    "offerings": []
  }
}
```

#### Create Product
**POST** `/api/external/products`

Create a new product.

**Request Body:**
```json
{
  "productName": "string (required)",
  "productId": "string (required, unique SKU)",
  "productType": "string (required: course, book, bundle, membership)",
  "format": "string (required: digital, physical, hybrid)",
  "lifecycleStatus": "string (required: active, retired, development)",
  "membershipFlag": "boolean (required)",
  "membershipEntitlements": "string (optional)",
  "bundleEntitlements": "string (optional)",
  "revenueRecognitionCode": "string (optional)",
  "reportingTags": "array of strings (optional)"
}
```

**Example Request:**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "productName": "Python Fundamentals",
    "productId": "PY-FUND-001",
    "productType": "course",
    "format": "digital",
    "lifecycleStatus": "active",
    "membershipFlag": false,
    "reportingTags": ["programming", "python", "beginner"]
  }' \
  https://your-domain.com/api/external/products
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "productName": "Python Fundamentals",
    "productId": "PY-FUND-001",
    "productType": "course",
    "format": "digital",
    "lifecycleStatus": "active",
    "membershipFlag": false,
    "membershipEntitlements": null,
    "bundleEntitlements": null,
    "revenueRecognitionCode": null,
    "reportingTags": ["programming", "python", "beginner"]
  }
}
```

#### Update Product
**PUT** `/api/external/products/{id}`

Update an existing product. All fields are optional.

**Path Parameters:**
- `id` (integer): Product ID

**Request Body:** Same structure as create, all fields optional

**Example Request:**
```bash
curl -X PUT \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "lifecycleStatus": "retired",
    "reportingTags": ["programming", "python", "beginner", "archived"]
  }' \
  https://your-domain.com/api/external/products/2
```

#### Delete Product
**DELETE** `/api/external/products/{id}`

Delete a product permanently.

**Path Parameters:**
- `id` (integer): Product ID

**Example Request:**
```bash
curl -X DELETE \
  -H "x-api-key: YOUR_API_KEY" \
  https://your-domain.com/api/external/products/2
```

**Example Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

### Categories API

#### Get All Categories
**GET** `/api/external/categories`

Retrieve all product categories.

**Example Request:**
```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://your-domain.com/api/external/categories
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "categoryName": "Programming Courses",
      "description": "Courses related to software development and programming"
    }
  ],
  "count": 1
}
```

#### Get Category by ID
**GET** `/api/external/categories/{id}`

Retrieve a specific category by its ID.

**Path Parameters:**
- `id` (integer): Category ID

**Example Request:**
```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://your-domain.com/api/external/categories/1
```

#### Create Category
**POST** `/api/external/categories`

Create a new product category.

**Request Body:**
```json
{
  "categoryName": "string (required)",
  "description": "string (optional)"
}
```

**Example Request:**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "categoryName": "Data Science",
    "description": "Courses and materials related to data science and analytics"
  }' \
  https://your-domain.com/api/external/categories
```

#### Update Category
**PUT** `/api/external/categories/{id}`

Update an existing category. All fields are optional.

**Path Parameters:**
- `id` (integer): Category ID

**Example Request:**
```bash
curl -X PUT \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "description": "Advanced data science and machine learning courses"
  }' \
  https://your-domain.com/api/external/categories/2
```

#### Delete Category
**DELETE** `/api/external/categories/{id}`

Delete a category permanently.

**Path Parameters:**
- `id` (integer): Category ID

**Example Request:**
```bash
curl -X DELETE \
  -H "x-api-key: YOUR_API_KEY" \
  https://your-domain.com/api/external/categories/2
```

## Error Handling

All API endpoints return consistent error responses:

### Authentication Errors
**Status Code:** 401 Unauthorized
```json
{
  "error": "Invalid or missing API key"
}
```

### Validation Errors
**Status Code:** 400 Bad Request
```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["productName"],
      "message": "Required"
    }
  ]
}
```

### Not Found Errors
**Status Code:** 404 Not Found
```json
{
  "error": "Product not found"
}
```

### Conflict Errors
**Status Code:** 409 Conflict
```json
{
  "error": "Product with this ID already exists"
}
```

### Server Errors
**Status Code:** 500 Internal Server Error
```json
{
  "error": "Failed to create product"
}
```

## Data Models

### Product Model
```typescript
{
  id: number;
  productName: string;
  productId: string;                    // Unique SKU
  productType: 'course' | 'book' | 'bundle' | 'membership';
  format: 'digital' | 'physical' | 'hybrid';
  lifecycleStatus: 'active' | 'retired' | 'development';
  membershipFlag: boolean;
  membershipEntitlements?: string;
  bundleEntitlements?: string;
  revenueRecognitionCode?: string;
  reportingTags?: string[];
  offerings: ProductOffering[];         // Related offerings
}
```

### Category Model
```typescript
{
  id: number;
  categoryName: string;
  description?: string;
}
```

## Rate Limiting

Current rate limits:
- 1000 requests per hour per API key
- 100 requests per minute per API key

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Pagination

For endpoints returning multiple items, pagination is available:

**Query Parameters:**
- `page` (default: 1): Page number
- `limit` (default: 50, max: 100): Items per page

**Example:**
```bash
curl -H "x-api-key: YOUR_API_KEY" \
  "https://your-domain.com/api/external/products?page=2&limit=25"
```

**Response includes pagination metadata:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 25,
    "total": 150,
    "pages": 6
  }
}
```

## SDKs and Code Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'https://your-domain.com/api/external',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

// Get all products
const products = await api.get('/products');

// Create a product
const newProduct = await api.post('/products', {
  productName: 'React Fundamentals',
  productId: 'REACT-001',
  productType: 'course',
  format: 'digital',
  lifecycleStatus: 'active',
  membershipFlag: false
});
```

### Python
```python
import requests

class ProductFlowAPI:
    def __init__(self, api_key, base_url='https://your-domain.com/api/external'):
        self.session = requests.Session()
        self.session.headers.update({
            'x-api-key': api_key,
            'Content-Type': 'application/json'
        })
        self.base_url = base_url
    
    def get_products(self, **filters):
        response = self.session.get(f'{self.base_url}/products', params=filters)
        return response.json()
    
    def create_product(self, product_data):
        response = self.session.post(f'{self.base_url}/products', json=product_data)
        return response.json()

# Usage
api = ProductFlowAPI('YOUR_API_KEY')
products = api.get_products(productType='course')
```

### cURL Examples

Complete cURL examples for testing:

```bash
# Set your API key
API_KEY="your-api-key-here"
BASE_URL="https://your-domain.com/api/external"

# Get all products
curl -H "x-api-key: $API_KEY" "$BASE_URL/products"

# Create a product
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{
    "productName": "Advanced React Course",
    "productId": "REACT-ADV-001",
    "productType": "course",
    "format": "digital",
    "lifecycleStatus": "active",
    "membershipFlag": false,
    "reportingTags": ["programming", "react", "advanced"]
  }' \
  "$BASE_URL/products"

# Get categories
curl -H "x-api-key: $API_KEY" "$BASE_URL/categories"

# Create a category
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{
    "categoryName": "Web Development",
    "description": "Modern web development courses and resources"
  }' \
  "$BASE_URL/categories"
```

## Support

For API support and questions:
- Email: api-support@productflow.com
- Documentation: https://docs.productflow.com
- Status Page: https://status.productflow.com

## Changelog

### v1.0.0 (Current)
- Initial API release
- Products CRUD operations
- Categories CRUD operations
- API key authentication
- Comprehensive error handling
- Email notifications for new products