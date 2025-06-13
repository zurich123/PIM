#!/usr/bin/env node

import axios from 'axios';

class ProductFlowClient {
  constructor(apiKey, baseURL = 'http://localhost:5000/api/external') {
    this.api = axios.create({
      baseURL,
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  async getAllProducts() {
    try {
      const response = await this.api.get('/products');
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error.response?.data || error.message);
      throw error;
    }
  }

  displayProductsWithPricing(productsResponse) {
    console.log('\n=== ProductFlow Products and Pricing ===\n');
    
    if (!productsResponse.success || !productsResponse.data || productsResponse.data.length === 0) {
      console.log('No products found.');
      return;
    }

    console.log(`Found ${productsResponse.count} product(s):\n`);

    productsResponse.data.forEach((product, index) => {
      console.log(`${index + 1}. Product: ${product.productName}`);
      console.log(`   Product ID: ${product.productId}`);
      console.log(`   Type: ${product.productType}`);
      console.log(`   Format: ${product.format}`);
      console.log(`   Status: ${product.lifecycleStatus}`);
      
      if (product.offerings && product.offerings.length > 0) {
        console.log(`   Pricing Options:`);
        product.offerings.forEach((offering, offeringIndex) => {
          const price = offering.price ? `${offering.currency || 'USD'} ${offering.price}` : 'Price not set';
          console.log(`     ${offeringIndex + 1}. ${offering.brand || 'Standard'}: ${price}`);
          if (offering.pricingModel) {
            console.log(`        Pricing Model: ${offering.pricingModel}`);
          }
          if (offering.accessPeriod && offering.accessPeriodType) {
            console.log(`        Access: ${offering.accessPeriod} ${offering.accessPeriodType}`);
          }
        });
      } else {
        console.log(`   Pricing: No pricing options available`);
      }
      console.log(''); // Empty line for readability
    });
  }

  async run() {
    try {
      console.log('Connecting to ProductFlow API...');
      const products = await this.getAllProducts();
      this.displayProductsWithPricing(products);
      
      // Summary statistics
      const totalProducts = products.data.length;
      const productsWithPricing = products.data.filter(p => p.offerings && p.offerings.length > 0).length;
      const totalOfferings = products.data.reduce((sum, p) => sum + (p.offerings ? p.offerings.length : 0), 0);
      
      console.log('=== Summary ===');
      console.log(`Total Products: ${totalProducts}`);
      console.log(`Products with Pricing: ${productsWithPricing}`);
      console.log(`Total Pricing Options: ${totalOfferings}`);
      
    } catch (error) {
      console.error('\nFailed to retrieve products:');
      if (error.response?.status === 401) {
        console.error('Authentication failed. Please check your API key.');
      } else {
        console.error(error.message);
      }
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error('Error: API_KEY environment variable is required.');
    console.error('Usage: API_KEY=your-api-key node javascript_client.js');
    process.exit(1);
  }

  const client = new ProductFlowClient(apiKey);
  await client.run();
}

// Run the client if this file is executed directly
main().catch(console.error);

export default ProductFlowClient;