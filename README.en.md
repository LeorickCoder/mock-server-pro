# Mock Server Pro

English | [简体中文](./README.md)

A powerful mock server focused on solving API mocking needs in frontend development. Supports complete network request chain simulation, parameterized routing, file uploads, and more.

## Latest Features (v1.1.0)

- **Parameterized Route Support**: Added complete support for Express-style parameterized routes
  - Path parameter extraction (e.g., `/api/users/:id`)
  - Multi-parameter routes (e.g., `/api/users/:userId/posts/:postId`)
  - Regular expression constraints (e.g., `/api/items/:id([0-9]+)`)
  - Wildcard paths (e.g., `/api/files/*`)
- **Route Matching Optimization**: Improved route matching algorithm and performance
  - More precise route matching and sorting
  - Caching mechanism for improved matching performance
  - Intelligent path parameter extraction
- **Module Format Support**: Support for multiple module formats and environments
  - ESM (ES Modules)
  - CommonJS
  - TypeScript

For detailed documentation, please refer to [Path Parameters Documentation](https://github.com/LeorickCoder/mock-server-pro/blob/main/docs/path-params.md)

## Why Choose Mock Server Pro?

### Pain Points with Existing Mock Solutions

1. **Limitations of Mock.js**
   - Cannot mock file upload interfaces
   - No support for complete network request chain
   - Incompatible with Axios interceptors
   - Lack of type support

2. **Shortcomings of Traditional Mock Servers**
   - Complex configuration, requires separate maintenance
   - Difficult integration with development servers
   - No hot reload support
   - Lack of modular management

### Advantages of Mock Server Pro

1. **Complete Request Chain Simulation**
   - Support for file upload interfaces
   - Perfect compatibility with Axios interceptors
   - Request timeout and concurrency control
   - Built-in CORS support

2. **Flexible Integration Methods**
   - Can be integrated as Express middleware
   - Support for Vite, Webpack, and other build tools
   - Hot reload support
   - TypeScript support

3. **Modular Management**
   - Organize mock interfaces by functional modules
   - Middleware registration support
   - Route conflict detection
   - Configuration system

## Quick Start

### 1. Installation

\`\`\`bash
npm install mock-server-pro
\`\`\`

### 2. Integration Examples

#### Vite Integration (ESM)

\`\`\`typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { createMockMiddleware } from 'mock-server-pro';

export default defineConfig({
  server: {
    middleware: [
      await createMockMiddleware(app, {
        base: {
          prefix: '/api'
        },
        modules: {
          dir: './src/mocks'
        }
      })
    ]
  }
});
\`\`\`

#### Webpack/Express Integration (CommonJS)

\`\`\`javascript
// webpack.config.js or express server
const { createMockMiddleware } = require('mock-server-pro');

module.exports = {
  devServer: {
    before: async (app) => {
      await createMockMiddleware(app, {
        base: {
          prefix: '/api'
        },
        modules: {
          dir: './src/mocks'
        }
      });
    }
  }
};
\`\`\`

### 3. Creating Mock Modules

Supports multiple module formats:

#### ESM Format (Recommended for Vite/Modern Projects)

\`\`\`typescript
// src/mocks/user.ts
import type { ModuleContext } from 'mock-server-pro';

export default function(ctx: ModuleContext) {
  // Register route
  ctx.registerRoute('get', '/users', (req, res) => {
    res.json([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ]);
  });
}
\`\`\`

#### CommonJS Format (for Webpack/Express Projects)

\`\`\`javascript
// src/mocks/user.js
module.exports = function(ctx) {
  // Register route
  ctx.registerRoute('get', '/users', (req, res) => {
    res.json([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ]);
  });
};
\`\`\`

## Features

- ✨ Complete request chain simulation
- 🔥 Hot reload support
- 📦 Modular management
- 🚀 Build tool integration
- 🔌 Flexible configuration system
- 📝 TypeScript support
- 🎯 Route conflict detection
- 🔄 Concurrent request control
- 🌈 CORS support
- 🔧 Multiple module format support

## Configuration

### Default Configuration

\`\`\`typescript
const defaultConfig = {
  base: {
    prefix: '/api', // API prefix
    prefixConfig: {
      value: '/api',
      mode: 'auto',        // Prefix handling mode: 'auto'|'append'|'mount'
      detectBasePath: true // Auto-detect base path
    }
  },
  request: {
    timeout: 30000,     // Request timeout (ms)
    maxConcurrent: 100, // Maximum concurrent requests
    bodyLimit: '1mb'    // Request body size limit
  },
  hotReload: {
    enabled: process.env.NODE_ENV === 'development', // Enable hot reload
    ignored: ['**/node_modules/**', '**/.git/**'],   // Ignored files
    stabilityThreshold: 1000,                        // Stability threshold (ms)
    pollInterval: 100                                // Poll interval (ms)
  },
  modules: {
    dir: 'modules',           // Module directory path
    pattern: '**/*.{js,ts}',  // Module file pattern
    recursive: true,          // Recursively search subdirectories
    ignore: [                 // Ignored file patterns
      '**/node_modules/**',
      '**/.git/**',
      '**/*.d.ts',
      '**/*.test.*'
    ]
  },
  typescript: {
    sourcemap: true,         // Enable source maps
    compilerOptions: {       // TypeScript compiler options
      module: 'commonjs',
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      moduleResolution: 'node',
      target: 'es2018',
      strict: false
    }
  }
};
\`\`\`

## API

### createMockServer(options)

Creates a standalone mock server.

- \`options\`: Configuration options (optional)
- Returns: Promise<Express.Application>

### createMockMiddleware(app, options)

Integrates the mock server as middleware into an existing Express application.

- \`app\`: Express application instance
- \`options\`: Configuration options (optional)
- Returns: Promise<void>

### ModuleContext

Module context interface, providing the following methods:

- \`registerRoute(method: HttpMethod, path: string, handler: RouteHandler)\`: Register a route
- \`registerMiddleware(path: string, handler: MiddlewareHandler)\`: Register middleware

## Best Practices

1. **Module Format Selection**:
   - Modern projects (Vite/ESM): Use ESM format
   - Traditional projects (Webpack/Express): Use CommonJS format
   - Hybrid projects: Choose format based on build tools

2. **Modular Organization**:
   - Divide files by functional modules
   - Each module manages its own routes and middleware
   - Use TypeScript for better type hints

3. **Error Handling**:
   - Use try-catch to handle exceptions
   - Standardize error response format
   - Avoid returning Response objects in route handlers

4. **Hot Reload**:
   - Enable in development environment
   - Configure ignored files appropriately
   - Avoid frequent file modifications

5. **Concurrency Control**:
   - Set maxConcurrent based on actual needs
   - Monitor request queue

6. **Directory Structure**:
   - Place mock modules in src/mocks directory
   - Use index.ts/js as module entry
   - Organize subdirectories by functionality

## Common Issues

1. **Module Import Issues**:
   - ESM environment: Use \`export default function(ctx) {}\`
   - CommonJS environment: Use \`module.exports = function(ctx) {}\`
   - Ensure compatibility with project's module system

2. **Route Conflicts**:
   - Check for duplicate route definitions
   - Ensure correct path format (starting with /)
   - Avoid using special characters like ..

3. **Hot Reload Not Working**:
   - Confirm hotReload.enabled is true
   - Check if file changes are within monitored scope
   - Review file change logs

4. **Type Errors**:
   - Ensure correct type definition imports
   - Check route handler return types
   - Use TypeScript strict mode

5. **Concurrency Limits**:
   - Adjust maxConcurrent configuration
   - Check for unclosed requests
   - Monitor pendingRequests count

## License

MIT 