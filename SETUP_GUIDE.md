# Fraud Admin Portal - Setup & Deployment Guide

## Quick Start

### Prerequisites
- Node.js v18+ installed
- npm or yarn package manager
- Visual Studio Code (recommended)

### 1. Installation

```bash
cd C:\Users\lonwa\source\repos\fraud-portal
npm install
```

The installation will download and install all required dependencies including:
- Angular 18
- TypeScript
- RxJS
- Angular CLI tools

### 2. Configuration

Update the API endpoint in `src/app/services/api.service.ts`:

```typescript
private apiUrl = 'http://localhost:5218/api/v1'; // Change port if needed
```

### 3. Running the Development Server

```bash
npm start
```

Or with Angular CLI:

```bash
ng serve
```

The application will be available at:
- **http://localhost:4200**

### 4. Building for Production

```bash
npm run build
```

Production files will be in `dist/fraud-portal/`

## Project Features

### Authentication
- Login screen with SHA-256 password validation
- Session management with localStorage
- Protected routes using Angular guards

### Dashboard Components

#### 1. Processed Files Tab
- Displays all processed transaction files
- Shows file metadata (ID, name, hash, ingest date, record count)
- Read-only table view
- Auto-formats dates

#### 2. Fraud Alerts Tab
- Real-time fraud alert monitoring
- Displays transaction details that triggered alerts
- Shows rule violations and conditions
- Currency formatting (ZAR)
- Linked to fraud rules and transactions

#### 3. Fraud Rules Management Tab
- **View Rules**: Display all fraud detection rules with status
- **Create Rule**: Add new fraud detection rules
  - Rule Name
  - Field Name (Amount, TransactionCount, AccountAge, etc.)
  - Operator (>, <, >=, <=, ==, !=, CONTAINS, NOT_CONTAINS)
  - Threshold Value
  - Active/Inactive status
- **Edit Rule**: Modify existing rules
- **Delete Rule**: Remove rules with confirmation
- **Toggle Status**: Activate/Deactivate rules
- Real-time feedback with success/error messages

## API Integration

The portal connects to the Capitec Fraud Engine API with the following endpoints:

### Authentication
```
POST /api/v1/auth/login
Request: { userName: string, password: string }
Response: { message: string, user: UserDto }
```

### Processed Files
```
GET /api/v1/files
Response: ProcessedFile[]
```

### Fraud Alerts
```
GET /api/v1/alerts
Response: FraudAlert[]
```

### Fraud Rules
```
GET /api/v1/rules
POST /api/v1/rules
PUT /api/v1/rules/{id}
DELETE /api/v1/rules/{id}
```

## Project Structure

```
fraud-portal/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── login/
│   │   │   │   ├── login.component.ts
│   │   │   │   ├── login.component.html
│   │   │   │   └── login.component.css
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard.component.ts
│   │   │   │   ├── dashboard.component.html
│   │   │   │   └── dashboard.component.css
│   │   │   ├── processed-files/
│   │   │   │   ├── processed-files.component.ts
│   │   │   │   ├── processed-files.component.html
│   │   │   │   └── processed-files.component.css
│   │   │   ├── fraud-alerts/
│   │   │   │   ├── fraud-alerts.component.ts
│   │   │   │   ├── fraud-alerts.component.html
│   │   │   │   └── fraud-alerts.component.css
│   │   │   └── fraud-rules/
│   │   │       ├── fraud-rules.component.ts
│   │   │       ├── fraud-rules.component.html
│   │   │       └── fraud-rules.component.css
│   │   ├── guards/
│   │   │   └── auth.guard.ts
│   │   ├── services/
│   │   │   ├── api.service.ts
│   │   │   └── auth.service.ts
│   │   ├── app.component.ts
│   │   ├── app.component.css
│   │   └── app.routes.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── angular.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
├── package.json
├── .editorconfig
├── .gitignore
├── .browserslistrc
├── .env.example
└── README.md
```

## Development Workflow

### Adding New Components

```bash
ng generate component components/my-component
```

### Adding Services

```bash
ng generate service services/my-service
```

### Running Tests

```bash
npm test
```

### Linting Code

```bash
ng lint
```

## Troubleshooting

### Port Already in Use
Change the port in angular.json:
```bash
ng serve --port 4201
```

### API Connection Issues
- Verify the API is running on the configured port
- Check CORS settings on the backend API
- Verify network connectivity

### Module Not Found Errors
```bash
npm install
rm -rf node_modules package-lock.json
npm install
```

## Performance Optimization

### Build Optimization
- Use `--configuration production` for optimized builds
- Lazy load routes for better performance
- Implement OnPush change detection strategy

### Caching Strategies
- Implement HTTP caching headers
- Cache fraud rules after initial load
- Store user session locally

## Security Considerations

- ✅ Password validation via HTTPS
- ✅ Token-based authentication
- ✅ Protected routes with guards
- ✅ Secure storage of auth tokens
- ⚠️ TODO: Implement CSRF protection
- ⚠️ TODO: Add rate limiting
- ⚠️ TODO: Implement audit logging
- ⚠️ TODO: Add role-based access control

## Deployment

### Deploying to Web Server

1. Build the application:
```bash
npm run build
```

2. Upload contents of `dist/fraud-portal/` to web server

3. Configure server to serve `index.html` for all routes

### Docker Deployment

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/fraud-portal /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t fraud-portal .
docker run -p 8080:80 fraud-portal
```

## Environment Variables

Create `.env` file:
```
API_URL=http://localhost:5218/api/v1
NODE_ENV=production
```

## Support & Contact

For issues or support:
1. Check the troubleshooting section
2. Review API endpoint documentation
3. Check browser console for errors
4. Verify network connectivity

## License

© 2024 Capitec Bank. All rights reserved.
