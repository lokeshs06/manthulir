import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Manthulir API',
      version: '1.0.0',
      description:
        'Transition support platform for farmers moving from chemical to organic/natural farming in Tamil Nadu.',
    },
    servers: [{ url: '/api', description: 'Current environment' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        SchemeInput: {
          type: 'object',
          required: ['name', 'description', 'department'],
          properties: {
            name: { type: 'string', example: 'Organic Farming Transition Subsidy' },
            nameTa: { type: 'string', example: 'இயற்கை விவசாய மாற்ற உதவித்தொகை' },
            description: { type: 'string', example: 'Support for farmers transitioning to organic methods.' },
            descriptionTa: { type: 'string' },
            department: { type: 'string', example: 'Department of Agriculture, Tamil Nadu' },
            category: { type: 'string', example: 'subsidy' },
            benefitsSummary: { type: 'string', example: 'PLACEHOLDER: verify exact benefit amount with the department' },
            officialUrl: { type: 'string', example: 'PLACEHOLDER: verify official scheme URL before publishing' },
            eligibility: {
              type: 'object',
              properties: {
                applicableDistricts: { type: 'array', items: { type: 'string' } },
                applicableCrops: { type: 'array', items: { type: 'string' } },
                farmerCategories: { type: 'array', items: { type: 'string', enum: ['marginal', 'small', 'medium'] } },
                minLandSizeAcres: { type: 'number', nullable: true },
                maxLandSizeAcres: { type: 'number', nullable: true },
                requiresCertification: { type: 'boolean', nullable: true },
              },
            },
            applicableFromMonth: { type: 'integer', nullable: true, example: 0 },
            applicableToMonth: { type: 'integer', nullable: true, example: 12 },
          },
        },
        ProduceInput: {
          type: 'object',
          required: ['cropName', 'quantity', 'unit', 'pricePerUnit'],
          properties: {
            cropName: { type: 'string', example: 'Tomato' },
            cropNameTa: { type: 'string', example: 'தக்காளி' },
            description: { type: 'string' },
            quantity: { type: 'number', example: 50 },
            unit: { type: 'string', enum: ['kg', 'quintal', 'ton', 'dozen', 'piece', 'bundle'], example: 'kg' },
            pricePerUnit: { type: 'number', example: 25 },
            images: { type: 'array', items: { type: 'string' } },
            clusterId: { type: 'string', nullable: true },
          },
        },
        ClusterInput: {
          type: 'object',
          required: ['name', 'district'],
          properties: {
            name: { type: 'string', example: 'Thanjavur Organic Growers' },
            district: { type: 'string', example: 'Thanjavur' },
          },
        },
        ArticleInput: {
          type: 'object',
          required: ['title', 'content', 'category'],
          properties: {
            title: { type: 'string', example: 'Why Natural Farming?' },
            titleTa: { type: 'string' },
            content: { type: 'string', example: '## Introduction\n\nNatural farming...' },
            contentTa: { type: 'string' },
            category: { type: 'string', enum: ['philosophy', 'practice'] },
            tags: { type: 'array', items: { type: 'string' } },
            coverImageUrl: { type: 'string' },
            isPublished: { type: 'boolean', default: false },
          },
        },
        PestRemedyInput: {
          type: 'object',
          required: ['modelClassLabel', 'pestName', 'problemType'],
          properties: {
            modelClassLabel: { type: 'string', example: 'tomato_early_blight' },
            pestName: { type: 'string', example: 'Tomato Early Blight' },
            pestNameTa: { type: 'string' },
            scientificName: { type: 'string', example: 'Alternaria solani' },
            problemType: { type: 'string', enum: ['insect', 'disease', 'deficiency'] },
            affectedCrops: { type: 'array', items: { type: 'string' } },
            symptoms: { type: 'string' },
            organicTreatments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  method: { type: 'string', example: 'Copper-based spray (Bordeaux mixture)' },
                  ingredients: { type: 'array', items: { type: 'string' } },
                  preparationSteps: { type: 'array', items: { type: 'string' } },
                  applicationFrequency: { type: 'string' },
                  precautions: { type: 'string' },
                },
              },
            },
            severity: { type: 'string', enum: ['low', 'medium', 'high'] },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
