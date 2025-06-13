#!/usr/bin/env python3

import requests
import json
import os
import sys
from typing import Dict, List, Optional

class ProductFlowClient:
    def __init__(self, api_key: str, base_url: str = 'http://localhost:5000/api/external'):
        self.base_url = base_url
        self.headers = {
            'x-api-key': api_key,
            'Content-Type': 'application/json'
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)
    
    def get_all_products(self) -> Dict:
        """Retrieve all products from the API"""
        try:
            response = self.session.get(f'{self.base_url}/products')
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching products: {e}")
            if hasattr(e, 'response') and e.response is not None:
                try:
                    error_data = e.response.json()
                    print(f"API Error: {error_data.get('error', 'Unknown error')}")
                except:
                    print(f"HTTP {e.response.status_code}: {e.response.text}")
            raise
    
    def display_products_with_pricing(self, products_response: Dict) -> None:
        """Display products and their pricing information"""
        print("\n=== ProductFlow Products and Pricing ===\n")
        
        if not products_response.get('success') or not products_response.get('data'):
            print("No products found.")
            return
        
        products = products_response['data']
        print(f"Found {products_response.get('count', len(products))} product(s):\n")
        
        for index, product in enumerate(products, 1):
            print(f"{index}. Product: {product['productName']}")
            print(f"   Product ID: {product['productId']}")
            print(f"   Type: {product['productType']}")
            print(f"   Format: {product['format']}")
            print(f"   Status: {product['lifecycleStatus']}")
            
            offerings = product.get('offerings', [])
            if offerings:
                print("   Pricing Options:")
                for offering_index, offering in enumerate(offerings, 1):
                    currency = offering.get('currency', 'USD')
                    price = offering.get('price')
                    price_display = f"{currency} {price}" if price else "Price not set"
                    brand = offering.get('brand', 'Standard')
                    
                    print(f"     {offering_index}. {brand}: {price_display}")
                    
                    if offering.get('pricingModel'):
                        print(f"        Pricing Model: {offering['pricingModel']}")
                    
                    access_period = offering.get('accessPeriod')
                    access_type = offering.get('accessPeriodType')
                    if access_period and access_type:
                        print(f"        Access: {access_period} {access_type}")
            else:
                print("   Pricing: No pricing options available")
            
            print()  # Empty line for readability
    
    def get_summary_statistics(self, products_response: Dict) -> Dict:
        """Calculate summary statistics for the products"""
        if not products_response.get('success') or not products_response.get('data'):
            return {
                'total_products': 0,
                'products_with_pricing': 0,
                'total_offerings': 0,
                'price_range': None
            }
        
        products = products_response['data']
        total_products = len(products)
        products_with_pricing = sum(1 for p in products if p.get('offerings'))
        total_offerings = sum(len(p.get('offerings', [])) for p in products)
        
        # Calculate price range
        all_prices = []
        for product in products:
            for offering in product.get('offerings', []):
                price = offering.get('price')
                if price:
                    try:
                        all_prices.append(float(price))
                    except (ValueError, TypeError):
                        continue
        
        price_range = None
        if all_prices:
            price_range = {
                'min': min(all_prices),
                'max': max(all_prices),
                'average': sum(all_prices) / len(all_prices)
            }
        
        return {
            'total_products': total_products,
            'products_with_pricing': products_with_pricing,
            'total_offerings': total_offerings,
            'price_range': price_range
        }
    
    def display_summary(self, stats: Dict) -> None:
        """Display summary statistics"""
        print("=== Summary ===")
        print(f"Total Products: {stats['total_products']}")
        print(f"Products with Pricing: {stats['products_with_pricing']}")
        print(f"Total Pricing Options: {stats['total_offerings']}")
        
        if stats['price_range']:
            price_range = stats['price_range']
            print(f"Price Range: ${price_range['min']:.2f} - ${price_range['max']:.2f}")
            print(f"Average Price: ${price_range['average']:.2f}")
    
    def run(self) -> None:
        """Main execution method"""
        try:
            print("Connecting to ProductFlow API...")
            products = self.get_all_products()
            
            self.display_products_with_pricing(products)
            
            stats = self.get_summary_statistics(products)
            self.display_summary(stats)
            
        except requests.exceptions.RequestException as e:
            print(f"\nFailed to retrieve products:")
            if hasattr(e, 'response') and e.response is not None:
                if e.response.status_code == 401:
                    print("Authentication failed. Please check your API key.")
                else:
                    print(f"HTTP {e.response.status_code}: {e.response.reason}")
            else:
                print(f"Network error: {e}")
            sys.exit(1)
        except Exception as e:
            print(f"Unexpected error: {e}")
            sys.exit(1)

def main():
    """Main function"""
    api_key = os.getenv('API_KEY')
    
    if not api_key:
        print("Error: API_KEY environment variable is required.")
        print("Usage: API_KEY=your-api-key python3 python_client.py")
        sys.exit(1)
    
    # Allow custom base URL via environment variable
    base_url = os.getenv('PRODUCTFLOW_API_URL', 'http://localhost:5000/api/external')
    
    client = ProductFlowClient(api_key, base_url)
    client.run()

if __name__ == "__main__":
    main()