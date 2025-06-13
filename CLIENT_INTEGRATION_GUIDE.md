# ProductFlow API Client Integration Guide

## Quick Start

This guide helps you integrate with the ProductFlow External API to manage products and categories programmatically.

### Authentication Setup

1. Contact your ProductFlow administrator to obtain your API key
2. Include the API key in all requests using the `x-api-key` header
3. Base URL: `https://your-domain.com/api/external`

### Basic Integration Example

```javascript
// Node.js/JavaScript Example
const axios = require('axios');

const productFlowAPI = axios.create({
  baseURL: 'https://your-domain.com/api/external',
  headers: {
    'x-api-key': 'your-api-key-here',
    'Content-Type': 'application/json'
  }
});

// Example: Create a new product
async function createProduct() {
  try {
    const response = await productFlowAPI.post('/products', {
      productName: 'Advanced React Course',
      productId: 'REACT-ADV-001',
      productType: 'course',
      format: 'digital',
      lifecycleStatus: 'active',
      membershipFlag: false,
      reportingTags: ['programming', 'react', 'advanced']
    });
    
    console.log('Product created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error.response?.data || error.message);
    throw error;
  }
}
```

## Complete CRUD Operations

### Products Management

```javascript
class ProductFlowClient {
  constructor(apiKey, baseURL = 'https://your-domain.com/api/external') {
    this.api = axios.create({
      baseURL,
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  // Get all products with optional filtering
  async getProducts(filters = {}) {
    const response = await this.api.get('/products', { params: filters });
    return response.data;
  }

  // Get specific product by ID
  async getProduct(id) {
    const response = await this.api.get(`/products/${id}`);
    return response.data;
  }

  // Create new product
  async createProduct(productData) {
    const response = await this.api.post('/products', productData);
    return response.data;
  }

  // Update existing product
  async updateProduct(id, updateData) {
    const response = await this.api.put(`/products/${id}`, updateData);
    return response.data;
  }

  // Delete product
  async deleteProduct(id) {
    const response = await this.api.delete(`/products/${id}`);
    return response.data;
  }

  // Categories operations
  async getCategories() {
    const response = await this.api.get('/categories');
    return response.data;
  }

  async createCategory(categoryData) {
    const response = await this.api.post('/categories', categoryData);
    return response.data;
  }

  async updateCategory(id, updateData) {
    const response = await this.api.put(`/categories/${id}`, updateData);
    return response.data;
  }

  async deleteCategory(id) {
    const response = await this.api.delete(`/categories/${id}`);
    return response.data;
  }
}

// Usage example
const client = new ProductFlowClient('your-api-key');

// Get all courses
const courses = await client.getProducts({ productType: 'course' });

// Create a category
const category = await client.createCategory({
  name: 'Programming Fundamentals',
  description: 'Basic programming concepts and languages'
});
```

## Python Integration

```python
import requests
import json

class ProductFlowAPI:
    def __init__(self, api_key, base_url='https://your-domain.com/api/external'):
        self.base_url = base_url
        self.headers = {
            'x-api-key': api_key,
            'Content-Type': 'application/json'
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)
    
    def get_products(self, **filters):
        """Get all products with optional filters"""
        response = self.session.get(f'{self.base_url}/products', params=filters)
        response.raise_for_status()
        return response.json()
    
    def create_product(self, product_data):
        """Create a new product"""
        response = self.session.post(f'{self.base_url}/products', json=product_data)
        response.raise_for_status()
        return response.json()
    
    def update_product(self, product_id, update_data):
        """Update an existing product"""
        response = self.session.put(f'{self.base_url}/products/{product_id}', json=update_data)
        response.raise_for_status()
        return response.json()
    
    def delete_product(self, product_id):
        """Delete a product"""
        response = self.session.delete(f'{self.base_url}/products/{product_id}')
        response.raise_for_status()
        return response.json()
    
    def get_categories(self):
        """Get all categories"""
        response = self.session.get(f'{self.base_url}/categories')
        response.raise_for_status()
        return response.json()
    
    def create_category(self, category_data):
        """Create a new category"""
        response = self.session.post(f'{self.base_url}/categories', json=category_data)
        response.raise_for_status()
        return response.json()

# Usage example
api = ProductFlowAPI('your-api-key')

# Create a product
new_product = api.create_product({
    'productName': 'Python Data Science Course',
    'productId': 'PY-DS-001',
    'productType': 'course',
    'format': 'digital',
    'lifecycleStatus': 'active',
    'membershipFlag': False,
    'reportingTags': ['python', 'data-science', 'analytics']
})

print(f"Created product: {new_product['data']['productName']}")

# Get all digital courses
digital_courses = api.get_products(format='digital', productType='course')
print(f"Found {digital_courses['count']} digital courses")
```

## Error Handling Best Practices

```javascript
async function safeAPICall(apiFunction, ...args) {
  try {
    return await apiFunction(...args);
  } catch (error) {
    if (error.response) {
      // API returned an error response
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          console.error('Authentication failed. Check your API key.');
          break;
        case 400:
          console.error('Validation error:', data.details || data.error);
          break;
        case 404:
          console.error('Resource not found:', data.error);
          break;
        case 409:
          console.error('Conflict:', data.error);
          break;
        case 500:
          console.error('Server error:', data.error);
          break;
        default:
          console.error(`Unexpected error (${status}):`, data.error);
      }
    } else if (error.request) {
      // Network error
      console.error('Network error - could not reach API server');
    } else {
      // Other error
      console.error('Unexpected error:', error.message);
    }
    throw error;
  }
}

// Usage with error handling
try {
  const product = await safeAPICall(client.createProduct, {
    productName: 'Test Product',
    productId: 'TEST-001',
    productType: 'course',
    format: 'digital',
    lifecycleStatus: 'active',
    membershipFlag: false
  });
  console.log('Success:', product);
} catch (error) {
  console.log('Failed to create product');
}
```

## Bulk Operations

```javascript
// Bulk import products from CSV or external system
async function bulkImportProducts(productsData) {
  const results = [];
  const errors = [];
  
  for (const product of productsData) {
    try {
      const result = await client.createProduct(product);
      results.push(result);
      console.log(`✓ Created: ${product.productName}`);
    } catch (error) {
      errors.push({ product, error: error.response?.data || error.message });
      console.error(`✗ Failed: ${product.productName} - ${error.response?.data?.error || error.message}`);
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return { results, errors };
}

// Example usage
const productList = [
  {
    productName: 'JavaScript Fundamentals',
    productId: 'JS-FUND-001',
    productType: 'course',
    format: 'digital',
    lifecycleStatus: 'active',
    membershipFlag: false
  },
  {
    productName: 'React Advanced Patterns',
    productId: 'REACT-ADV-001',
    productType: 'course',
    format: 'digital',
    lifecycleStatus: 'active',
    membershipFlag: false
  }
];

const importResults = await bulkImportProducts(productList);
console.log(`Imported: ${importResults.results.length}, Failed: ${importResults.errors.length}`);
```

## Data Synchronization

```javascript
// Keep local database in sync with ProductFlow
class ProductFlowSync {
  constructor(apiClient, localDB) {
    this.api = apiClient;
    this.db = localDB;
  }
  
  async syncProducts() {
    try {
      // Get all products from API
      const apiProducts = await this.api.getProducts();
      
      // Get local products
      const localProducts = await this.db.getProducts();
      
      // Compare and sync
      for (const apiProduct of apiProducts.data) {
        const localProduct = localProducts.find(p => p.productId === apiProduct.productId);
        
        if (!localProduct) {
          // New product - add to local DB
          await this.db.createProduct(apiProduct);
          console.log(`Added new product: ${apiProduct.productName}`);
        } else if (this.hasChanges(localProduct, apiProduct)) {
          // Updated product - sync changes
          await this.db.updateProduct(localProduct.id, apiProduct);
          console.log(`Updated product: ${apiProduct.productName}`);
        }
      }
      
      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error.message);
      throw error;
    }
  }
  
  hasChanges(local, remote) {
    const fields = ['productName', 'lifecycleStatus', 'format', 'reportingTags'];
    return fields.some(field => {
      return JSON.stringify(local[field]) !== JSON.stringify(remote[field]);
    });
  }
  
  async scheduledSync(intervalMinutes = 30) {
    setInterval(async () => {
      try {
        await this.syncProducts();
      } catch (error) {
        console.error('Scheduled sync failed:', error.message);
      }
    }, intervalMinutes * 60 * 1000);
  }
}
```

## Testing Your Integration

```javascript
// Test suite for API integration
const assert = require('assert');

class APITester {
  constructor(client) {
    this.client = client;
    this.testData = [];
  }
  
  async runTests() {
    console.log('Starting API integration tests...');
    
    try {
      await this.testProductCRUD();
      await this.testCategoryCRUD();
      await this.testFiltering();
      await this.testErrorHandling();
      
      console.log('✓ All tests passed!');
    } catch (error) {
      console.error('✗ Test failed:', error.message);
    } finally {
      await this.cleanup();
    }
  }
  
  async testProductCRUD() {
    console.log('Testing product CRUD operations...');
    
    // Create
    const product = await this.client.createProduct({
      productName: 'Test Product',
      productId: 'TEST-CRUD-001',
      productType: 'course',
      format: 'digital',
      lifecycleStatus: 'development',
      membershipFlag: false
    });
    
    this.testData.push({ type: 'product', id: product.data.id });
    assert(product.success, 'Product creation failed');
    
    // Read
    const retrieved = await this.client.getProduct(product.data.id);
    assert(retrieved.data.productName === 'Test Product', 'Product retrieval failed');
    
    // Update
    const updated = await this.client.updateProduct(product.data.id, {
      lifecycleStatus: 'active'
    });
    assert(updated.data.lifecycleStatus === 'active', 'Product update failed');
    
    console.log('✓ Product CRUD tests passed');
  }
  
  async testCategoryCRUD() {
    console.log('Testing category CRUD operations...');
    
    const category = await this.client.createCategory({
      name: 'Test Category',
      description: 'Category for testing'
    });
    
    this.testData.push({ type: 'category', id: category.data.id });
    assert(category.success, 'Category creation failed');
    
    console.log('✓ Category CRUD tests passed');
  }
  
  async testFiltering() {
    console.log('Testing product filtering...');
    
    const courses = await this.client.getProducts({ productType: 'course' });
    assert(Array.isArray(courses.data), 'Filtering failed');
    
    console.log('✓ Filtering tests passed');
  }
  
  async testErrorHandling() {
    console.log('Testing error handling...');
    
    try {
      await this.client.getProduct(99999);
      assert(false, 'Should have thrown 404 error');
    } catch (error) {
      assert(error.response?.status === 404, 'Expected 404 error');
    }
    
    console.log('✓ Error handling tests passed');
  }
  
  async cleanup() {
    console.log('Cleaning up test data...');
    
    for (const item of this.testData) {
      try {
        if (item.type === 'product') {
          await this.client.deleteProduct(item.id);
        } else if (item.type === 'category') {
          await this.client.deleteCategory(item.id);
        }
      } catch (error) {
        console.warn(`Failed to cleanup ${item.type} ${item.id}`);
      }
    }
  }
}

// Run tests
const tester = new APITester(client);
await tester.runTests();
```

## Production Considerations

### Rate Limiting
- Maximum 1000 requests per hour per API key
- Maximum 100 requests per minute per API key
- Implement exponential backoff for rate limit errors

### Security
- Store API keys securely (environment variables, secret management)
- Use HTTPS for all API calls
- Validate all data before sending to API
- Log API usage for monitoring

### Monitoring
```javascript
// API usage monitoring
class APIMonitor {
  constructor(client) {
    this.client = client;
    this.stats = {
      requests: 0,
      errors: 0,
      responseTime: []
    };
  }
  
  async monitoredRequest(method, ...args) {
    const startTime = Date.now();
    
    try {
      this.stats.requests++;
      const result = await this.client[method](...args);
      this.stats.responseTime.push(Date.now() - startTime);
      return result;
    } catch (error) {
      this.stats.errors++;
      throw error;
    }
  }
  
  getStats() {
    const avgResponseTime = this.stats.responseTime.length > 0
      ? this.stats.responseTime.reduce((a, b) => a + b, 0) / this.stats.responseTime.length
      : 0;
      
    return {
      totalRequests: this.stats.requests,
      errorRate: (this.stats.errors / this.stats.requests) * 100,
      averageResponseTime: avgResponseTime,
      successRate: ((this.stats.requests - this.stats.errors) / this.stats.requests) * 100
    };
  }
}
```

## Support Resources

- **API Documentation**: Available at `/api/docs` endpoint
- **Status Page**: Monitor API availability and performance
- **Support Contact**: Reach out for technical assistance
- **Rate Limits**: Check response headers for current usage

## Common Integration Patterns

1. **Real-time Sync**: Use webhooks or polling for live data updates
2. **Batch Processing**: Import/export large datasets efficiently
3. **Caching**: Store frequently accessed data locally
4. **Error Recovery**: Implement retry logic and fallback strategies
5. **Data Validation**: Validate data before API calls to reduce errors