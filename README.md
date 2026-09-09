# Fraud Admin Portal

A comprehensive fraud detection and management system for Capitec Bank built with Angular, TypeScript, and Node.js.

## Features

- **User Authentication**: Secure login with SHA-256 password hashing
- **Processed Files Management**: View and track ingested transaction files
- **Fraud Alerts Monitoring**: Real-time fraud alert tracking with transaction details
- **Fraud Rules Management**: Create, read, update, and delete fraud detection rules with CRUD operations
- **Rule Conditions**: Support for multiple operators (>, <, >=, <=, ==, !=, CONTAINS, NOT_CONTAINS)
- **Rule Status Management**: Toggle rule activation status
- **Responsive UI**: Mobile-friendly interface with modern design

## Prerequisites

- Node.js (v18+)
- npm or yarn
- Angular CLI (optional, for development)

## Installation

1. Navigate to the project directory:
   ```bash
   cd fraud-portal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

Before running the application, configure the API endpoint in `src/app/services/api.service.ts`:

```typescript
private apiUrl = 'http://localhost:5218/api/v1'; // Update with your API URL
```

## Running the Application

### Development Server

```bash
npm start
```

The application will be available at `http://localhost:4200`

### Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/fraud-portal` directory.

## API Endpoints

The application connects to the following API endpoints:

### Authentication
- `POST /api/v1/auth/login` - User login

### Processed Files
- `GET /api/v1/files` - Get all processed files

### Fraud Alerts
- `GET /api/v1/alerts` - Get all fraud alerts

### Fraud Rules
- `GET /api/v1/rules` - Get all fraud rules
- `POST /api/v1/rules` - Create new fraud rule
- `PUT /api/v1/rules/{id}` - Update fraud rule
- `DELETE /api/v1/rules/{id}` - Delete fraud rule

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── processed-files/
│   │   ├── fraud-alerts/
│   │   └── fraud-rules/
│   ├── guards/
│   │   └── auth.guard.ts
│   ├── services/
│   │   ├── api.service.ts
│   │   └── auth.service.ts
│   ├── app.component.ts
│   └── app.routes.ts
├── index.html
├── main.ts
└── styles.css
```

## Technologies Used

- **Angular 18**: Frontend framework
- **TypeScript**: Programming language
- **RxJS**: Reactive programming
- **CSS3**: Styling
- **HTTP Client**: API communication

## Error Handling

The application includes comprehensive error handling:
- Login validation and error messages
- API error handling with user-friendly messages
- Loading states during API calls
- Retry functionality for failed data loads

## Security Features

- Authentication guard for protected routes
- Token-based authentication
- Session management
- Secure password handling

## Future Enhancements

- Advanced filtering and search capabilities
- Fraud rule templates
- Audit logging
- Role-based access control (RBAC)
- Real-time notifications
- Export reports
- Dashboard analytics

## License

© 2024 Capitec Bank. All rights reserved.
