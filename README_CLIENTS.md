# ProductFlow API Clients

Two client implementations to retrieve and display all products with their pricing information from the ProductFlow API.

## Prerequisites

- API key for ProductFlow API
- Node.js (for JavaScript client)
- Python 3.11+ (for Python client)

## JavaScript Client

### Usage
```bash
# Set your API key
export API_KEY=your-api-key-here

# Run the JavaScript client
node javascript_client.js
```

### Features
- Retrieves all products from the ProductFlow API
- Displays product names, IDs, types, formats, and pricing
- Shows pricing options with currency, pricing model, and access period
- Provides summary statistics (total products, products with pricing, total offerings)

## Python Client

### Usage
```bash
# Set your API key
export API_KEY=your-api-key-here

# Run the Python client
python3 python_client.py
```

### Features
- Retrieves all products from the ProductFlow API
- Displays comprehensive product and pricing information
- Calculates and shows price range statistics (min, max, average)
- Provides detailed summary with pricing analytics
- Type hints and error handling

## Sample Output

Both clients produce similar output showing:

```
=== ProductFlow Products and Pricing ===

Found 18 product(s):

1. Product: Advanced Leadership Certification
   Product ID: LEAD-001
   Type: course
   Format: digital
   Status: active
   Pricing Options:
     1. LeadershipPro: USD 599.00
        Pricing Model: one-time
        Access: 12 months

[... more products ...]

=== Summary ===
Total Products: 18
Products with Pricing: 15
Total Pricing Options: 15
Price Range: $79.99 - $2499.00  (Python client only)
Average Price: $834.47          (Python client only)
```

## Error Handling

Both clients include comprehensive error handling for:
- Missing API key
- Authentication failures
- Network errors
- API response errors
- Invalid data formats

## Configuration

You can customize the API endpoint by modifying the `baseURL` parameter in the client constructors or by setting environment variables:

### JavaScript Client
```javascript
const client = new ProductFlowClient(apiKey, 'https://your-domain.com/api/external');
```

### Python Client
```bash
export PRODUCTFLOW_API_URL=https://your-domain.com/api/external
python3 python_client.py
```

## Dependencies

### JavaScript
- axios (for HTTP requests)

### Python
- requests (for HTTP requests)
- Built-in modules: json, os, sys, typing