export default {
    openapi: '3.0.0',
    info: {
        title: 'HBL Banking API',
        version: '1.0.0',
        description: 'A comprehensive banking API for HBL Clone application',
        contact: {
            name: 'Muhammad Junaid Afzal',
            email: 'me@junaidafzal.dev'
        },
        license: {
            name: 'ISC',
            url: 'https://opensource.org/licenses/ISC'
        }
    },
    servers: [
        {
            url: process.env.API_BASE_URL || 'http://localhost:8000',
            description: 'Development server'
        },
        {
            url: 'https://your-production-url.com',
            description: 'Production server'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        },
        schemas: {
            User: {
                type: 'object',
                required: ['email', 'password', 'firstName', 'lastName'],
                properties: {
                    _id: {
                        type: 'string',
                        description: 'Auto-generated MongoDB ObjectId'
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        description: 'User email address'
                    },
                    firstName: {
                        type: 'string',
                        description: 'User first name'
                    },
                    lastName: {
                        type: 'string',
                        description: 'User last name'
                    },
                    phoneNumber: {
                        type: 'string',
                        description: 'User phone number'
                    },
                    role: {
                        type: 'string',
                        enum: ['customer', 'admin'],
                        default: 'customer'
                    },
                    isActive: {
                        type: 'boolean',
                        default: true
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time'
                    }
                }
            },
            Account: {
                type: 'object',
                properties: {
                    _id: {
                        type: 'string'
                    },
                    accountNumber: {
                        type: 'string',
                        description: 'Unique account number'
                    },
                    accountType: {
                        type: 'string',
                        enum: ['savings', 'checking', 'credit']
                    },
                    balance: {
                        type: 'number',
                        description: 'Account balance'
                    },
                    userId: {
                        type: 'string',
                        description: 'Reference to User'
                    },
                    isActive: {
                        type: 'boolean',
                        default: true
                    }
                }
            },
            Transaction: {
                type: 'object',
                properties: {
                    _id: {
                        type: 'string'
                    },
                    fromAccount: {
                        type: 'string',
                        description: 'Source account ID'
                    },
                    toAccount: {
                        type: 'string',
                        description: 'Destination account ID'
                    },
                    amount: {
                        type: 'number',
                        description: 'Transaction amount'
                    },
                    type: {
                        type: 'string',
                        enum: ['transfer', 'deposit', 'withdrawal', 'payment']
                    },
                    status: {
                        type: 'string',
                        enum: ['pending', 'completed', 'failed']
                    },
                    description: {
                        type: 'string'
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time'
                    }
                }
            },
            Loan: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    userId: { type: 'string', description: 'User ID' },
                    loanType: { type: 'string', enum: ['personal', 'home', 'car', 'business'] },
                    amount: { type: 'number' },
                    tenure: { type: 'number' },
                    interestRate: { type: 'number' },
                    monthlyInstallment: { type: 'number' },
                    status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'active', 'closed'] },
                    applicationDate: { type: 'string', format: 'date-time' },
                    approvedDate: { type: 'string', format: 'date-time' },
                    disbursedDate: { type: 'string', format: 'date-time' },
                    purpose: { type: 'string' },
                    collateral: { type: 'string' },
                    outstandingAmount: { type: 'number' },
                    rejectionReason: { type: 'string', description: 'Reason for loan rejection' },
                    rejectedDate: { type: 'string', format: 'date-time', description: 'Date when loan was rejected' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            Error: {
                type: 'object',
                properties: {
                    success: {
                        type: 'boolean',
                        example: false
                    },
                    message: {
                        type: 'string',
                        description: 'Error message'
                    },
                    error: {
                        type: 'string',
                        description: 'Detailed error information'
                    }
                }
            }
        },
        responses: {
            Unauthorized: {
                description: 'Unauthorized - Invalid or missing token',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/Error'
                        },
                        example: {
                            success: false,
                            error: 'Unauthorized access'
                        }
                    }
                }
            },
            Forbidden: {
                description: 'Forbidden - Insufficient permissions',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/Error'
                        },
                        example: {
                            success: false,
                            error: 'Access forbidden'
                        }
                    }
                }
            },
            NotFound: {
                description: 'Resource not found',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/Error'
                        },
                        example: {
                            success: false,
                            error: 'Resource not found'
                        }
                    }
                }
            },
            ValidationError: {
                description: 'Validation error',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/Error'
                        },
                        example: {
                            success: false,
                            error: 'Validation failed'
                        }
                    }
                }
            },
            InternalServerError: {
                description: 'Internal server error',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/Error'
                        },
                        example: {
                            success: false,
                            error: 'Internal server error'
                        }
                    }
                }
            }
        }
    },
    security: [
        {
            bearerAuth: []
        }
    ]
};
