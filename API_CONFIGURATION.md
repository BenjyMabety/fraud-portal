# API Configuration Guide

## Connecting to CapitecFraudEngine

This guide explains how to configure the Fraud Admin Portal to connect to the Capitec Fraud Engine API.

### Backend API Details

The Capitec Fraud Engine API is located at:
```
C:\Users\lonwa\source\repos\CapitecFraudEngine
```

**API Base URL**: `http://localhost:5218/api/v1` (default, adjust port as needed)

### API Endpoints Overview

#### Authentication Endpoint
```
POST /api/v1/auth/login

Request Body:
{
  "userName": "string",
  "password": "string"
}

Response:
{
  "message": "Authentication successful.",
  "user": {
    "userId": number,
    "userName": "string",
    "userCreatedDate": "ISO8601 date",
    "userLastLogin": "ISO8601 date"
  }
}

Status Codes:
- 200: Success
- 400: Missing credentials
- 401: Invalid username or password
- 500: Server error
```

#### Processed Files Endpoint
```
GET /api/v1/files

Response:
[
  {
    "fileId": number,
    "fileName": "string",
    "fileHash": "string (SHA-256)",
    "ingestedAt": "ISO8601 date",
    "recordCount": number
  }
]

Status Codes:
- 200: Success
- 401: Unauthorized
- 500: Server error
```

#### Fraud Alerts Endpoint
```
GET /api/v1/alerts

Response:
[
  {
    "alertId": number,
    "triggeredAt": "ISO8601 date",
    "transactionId": "string",
    "accountNumber": "string",
    "accountName": "string",
    "amount": number (decimal),
    "transactionType": "string (Deposit|Withdrawal|Transfer|Payment)",
    "ruleBroken": "string",
    "ruleCondition": "string"
  }
]

Status Codes:
- 200: Success
- 401: Unauthorized
- 500: Server error
```

#### Fraud Rules Endpoints

##### Get All Rules
```
GET /api/v1/rules

Response:
[
  {
    "ruleId": number,
    "ruleName": "string",
    "fieldName": "string",
    "operator": "string (>, <, >=, <=, ==, !=, CONTAINS, NOT_CONTAINS)",
    "thresholdValue": "string",
    "isActive": boolean
  }
]

Status Codes:
- 200: Success
- 401: Unauthorized
- 500: Server error
```

##### Create New Rule
```
POST /api/v1/rules

Request Body:
{
  "ruleName": "string",
  "fieldName": "string",
  "operator": "string",
  "thresholdValue": "string",
  "isActive": boolean
}

Response:
{
  "ruleId": number,
  "ruleName": "string",
  "fieldName": "string",
  "operator": "string",
  "thresholdValue": "string",
  "isActive": boolean
}

Status Codes:
- 201: Created
- 400: Invalid input
- 401: Unauthorized
- 500: Server error
```

##### Update Rule
```
PUT /api/v1/rules/{ruleId}

Request Body:
{
  "ruleName": "string",
  "fieldName": "string",
  "operator": "string",
  "thresholdValue": "string",
  "isActive": boolean
}

Response:
{
  "ruleId": number,
  "ruleName": "string",
  "fieldName": "string",
  "operator": "string",
  "thresholdValue": "string",
  "isActive": boolean
}

Status Codes:
- 200: Success
- 400: Invalid input
- 401: Unauthorized
- 404: Rule not found
- 500: Server error
```

##### Delete Rule
```
DELETE /api/v1/rules/{ruleId}

Response: 200 OK (empty body)

Status Codes:
- 200: Success
- 401: Unauthorized
- 404: Rule not found
- 500: Server error
```

### Configuration Steps

1. **Start the Backend API**:
   ```bash
   cd C:\Users\lonwa\source\repos\CapitecFraudEngine
   dotnet run
   ```

2. **Verify API is Running**:
   - Open browser and navigate to: `http://localhost:5218/swagger/index.html`
   - You should see the Swagger API documentation

3. **Update Frontend Configuration**:
   - Edit `src/app/services/api.service.ts`
   - Verify the `apiUrl` matches your backend URL:
   ```typescript
   private apiUrl = 'http://localhost:5218/api/v1';
   ```

4. **Start Frontend Development Server**:
   ```bash
   npm start
   ```

5. **Test the Connection**:
   - Navigate to `http://localhost:4200`
   - Try logging in with test credentials
   - Check browser console (F12) for any errors

### Database Connection

The backend API requires a MySQL database. Ensure:

1. **MySQL is Running**:
   ```bash
   mysql -u root -p
   ```

2. **Database Configuration**:
   - Check `appsettings.json` in the CapitecFraudEngine project
   - Connection string should point to your MySQL instance
   - Example: `Server=localhost;Database=CapitecFraud;User=root;Password=***;`

3. **Database Schema**:
   - Run migrations if needed
   - Ensure required tables exist:
     - Users
     - ProcessedFiles
     - Transactions
     - FraudAlerts
     - FraudRules

### Testing the API

#### Using curl:
```bash
# Test login
curl -X POST http://localhost:5218/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userName":"admin","password":"password123"}'

# Get fraud rules
curl -X GET http://localhost:5218/api/v1/rules \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Using Postman:
1. Import the API endpoints into Postman
2. Set base URL: `http://localhost:5218/api/v1`
3. Test each endpoint with sample data

### Troubleshooting API Connection

| Issue | Solution |
|-------|----------|
| **Connection refused** | Verify backend API is running on correct port |
| **CORS errors** | Check backend CORS configuration in Program.cs |
| **401 Unauthorized** | Verify authentication token is valid |
| **404 Not Found** | Check endpoint URL spelling and HTTP method |
| **500 Server Error** | Check backend logs for detailed error message |

### CORS Configuration

If you encounter CORS errors, ensure the backend allows the frontend origin:

In `Program.cs`:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

app.UseCors("AllowFrontend");
```

### Environment-Specific URLs

#### Development
```
Frontend: http://localhost:4200
Backend: http://localhost:5218
```

#### Production
```
Frontend: https://fraud-portal.capitec.com
Backend: https://api.fraud-portal.capitec.com
```

Update `src/app/services/api.service.ts` based on environment:

```typescript
import { environment } from '../../environments/environment';

private apiUrl = environment.apiUrl;
```

### Security Notes

- ✅ Passwords are hashed with SHA-256 on backend
- ✅ Authentication tokens should be sent in Authorization header
- ✅ Use HTTPS in production
- ✅ Implement rate limiting on backend
- ✅ Add CSRF protection tokens
- ✅ Validate all inputs on backend

### Next Steps

1. Verify all endpoints are working with test data
2. Implement error handling for API failures
3. Add loading states and user feedback
4. Test with production data
5. Monitor API response times
6. Set up logging and monitoring

## Support

For API-related issues:
1. Check CapitecFraudEngine backend logs
2. Verify database connectivity
3. Review browser network tab for request/response details
4. Check API response status codes and error messages
