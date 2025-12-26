import swaggerJsdoc from 'swagger-jsdoc';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'yamljs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the swagger configuration (fix the path)
const swaggerConfig = (await import('../config/swagger.js')).default;

const options = {
    definition: swaggerConfig,
    apis: ['./src/routes/*.js', './src/models/*.js']
};

const specs = swaggerJsdoc(options);

// Write swagger.json
fs.writeFileSync('swagger.json', JSON.stringify(specs, null, 2));

// Also create YAML version using proper YAML formatting
const yamlString = yaml.stringify(specs, 4);
fs.writeFileSync('swagger.yaml', yamlString);

console.log('✅ API documentation generated successfully!');
console.log('📄 Files created:');
console.log('  - swagger.json');
console.log('  - swagger.yaml');
console.log('🌐 Start server and visit: http://localhost:8000/api-docs');
