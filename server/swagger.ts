import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'ProductFlow External API',
    version: '1.0.0',
    description: 'Comprehensive API for managing products and categories in ProductFlow system',
    contact: {
      name: 'ProductFlow API Support',
      email: 'api-support@productflow.com'
    }
  },
  servers: [
    {
      url: '/api/external',
      description: 'External API Server'
    }
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'API key for authentication'
      }
    },
    schemas: {
      Product: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'Unique product identifier',
            example: 1
          },
          productName: {
            type: 'string',
            description: 'Product name',
            example: 'Advanced JavaScript Course'
          },
          productId: {
            type: 'string',
            description: 'Unique product SKU',
            example: 'JS-ADV-001'
          },
          productType: {
            type: 'string',
            enum: ['course', 'book', 'bundle', 'membership'],
            description: 'Type of product',
            example: 'course'
          },
          format: {
            type: 'string',
            enum: ['digital', 'physical', 'hybrid'],
            description: 'Product format',
            example: 'digital'
          },
          lifecycleStatus: {
            type: 'string',
            enum: ['active', 'retired', 'development'],
            description: 'Current lifecycle status',
            example: 'active'
          },
          membershipFlag: {
            type: 'boolean',
            description: 'Whether product requires membership',
            example: false
          },
          membershipEntitlements: {
            type: 'string',
            nullable: true,
            description: 'Membership entitlements if applicable',
            example: null
          },
          bundleEntitlements: {
            type: 'string',
            nullable: true,
            description: 'Bundle entitlements if applicable',
            example: null
          },
          revenueRecognitionCode: {
            type: 'string',
            nullable: true,
            description: 'Revenue recognition code',
            example: 'COURSE-REV'
          },
          reportingTags: {
            type: 'array',
            items: {
              type: 'string'
            },
            nullable: true,
            description: 'Tags for reporting purposes',
            example: ['programming', 'javascript']
          },
          offerings: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/ProductOffering'
            },
            description: 'Related product offerings'
          }
        }
      },
      ProductOffering: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1
          },
          productId: {
            type: 'integer',
            example: 1
          },
          brand: {
            type: 'string',
            example: 'TechAcademy Pro'
          },
          price: {
            type: 'string',
            example: '599.00'
          },
          currency: {
            type: 'string',
            example: 'USD'
          },
          pricingModel: {
            type: 'string',
            example: 'one-time'
          },
          accessPeriod: {
            type: 'integer',
            example: 12
          },
          accessPeriodType: {
            type: 'string',
            example: 'months'
          }
        }
      },
      CreateProduct: {
        type: 'object',
        required: ['productName', 'productId', 'productType', 'format', 'lifecycleStatus', 'membershipFlag'],
        properties: {
          productName: {
            type: 'string',
            description: 'Product name',
            example: 'Advanced React Course'
          },
          productId: {
            type: 'string',
            description: 'Unique product SKU',
            example: 'REACT-ADV-001'
          },
          productType: {
            type: 'string',
            enum: ['course', 'book', 'bundle', 'membership'],
            description: 'Type of product',
            example: 'course'
          },
          format: {
            type: 'string',
            enum: ['digital', 'physical', 'hybrid'],
            description: 'Product format',
            example: 'digital'
          },
          lifecycleStatus: {
            type: 'string',
            enum: ['active', 'retired', 'development'],
            description: 'Current lifecycle status',
            example: 'active'
          },
          membershipFlag: {
            type: 'boolean',
            description: 'Whether product requires membership',
            example: false
          },
          membershipEntitlements: {
            type: 'string',
            description: 'Membership entitlements if applicable',
            example: 'premium-access'
          },
          bundleEntitlements: {
            type: 'string',
            description: 'Bundle entitlements if applicable',
            example: 'full-course-bundle'
          },
          revenueRecognitionCode: {
            type: 'string',
            description: 'Revenue recognition code',
            example: 'COURSE-REV'
          },
          reportingTags: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Tags for reporting purposes',
            example: ['programming', 'react', 'advanced']
          }
        }
      },
      UpdateProduct: {
        type: 'object',
        properties: {
          productName: {
            type: 'string',
            description: 'Product name',
            example: 'Advanced React Course - Updated'
          },
          lifecycleStatus: {
            type: 'string',
            enum: ['active', 'retired', 'development'],
            description: 'Current lifecycle status',
            example: 'retired'
          },
          reportingTags: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Tags for reporting purposes',
            example: ['programming', 'react', 'advanced', 'updated']
          }
        }
      },
      Category: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'Unique category identifier',
            example: 1
          },
          name: {
            type: 'string',
            description: 'Category name',
            example: 'Programming Courses'
          },
          description: {
            type: 'string',
            nullable: true,
            description: 'Category description',
            example: 'Courses related to software development and programming'
          },
          color: {
            type: 'string',
            description: 'Category color',
            example: 'blue'
          }
        }
      },
      CreateCategory: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            type: 'string',
            description: 'Category name',
            example: 'Data Science'
          },
          description: {
            type: 'string',
            description: 'Category description',
            example: 'Courses and materials related to data science and analytics'
          }
        }
      },
      UpdateCategory: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Category name',
            example: 'Advanced Data Science'
          },
          description: {
            type: 'string',
            description: 'Category description',
            example: 'Advanced data science and machine learning courses'
          }
        }
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          data: {
            type: 'object',
            description: 'Response data'
          },
          count: {
            type: 'integer',
            description: 'Number of items (for list endpoints)',
            example: 1
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message',
            example: 'Validation error'
          },
          details: {
            type: 'array',
            items: {
              type: 'object'
            },
            description: 'Detailed error information',
            example: [
              {
                "code": "invalid_type",
                "expected": "string",
                "received": "undefined",
                "path": ["productName"],
                "message": "Required"
              }
            ]
          }
        }
      }
    }
  },
  security: [
    {
      ApiKeyAuth: []
    }
  ]
};

const options = {
  definition: swaggerDefinition,
  apis: ['./server/routes.ts', './server/swagger-routes.ts'], // Path to the API routes
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  // Serve swagger docs
  app.use('/api/docs/swagger', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'ProductFlow API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'list',
      filter: true,
      showRequestHeaders: true,
      tryItOutEnabled: true
    }
  }));

  // Serve raw swagger JSON
  app.get('/api/docs/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
}

export { specs as swaggerSpecs };