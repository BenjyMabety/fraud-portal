# Quick Reference Guide

## Project Location
```
C:\Users\lonwa\source\repos\fraud-portal
```

## Quick Start Commands

```bash
# Navigate to project
cd C:\Users\lonwa\source\repos\fraud-portal

# Install dependencies (currently running)
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Access Points

| Component | URL |
|-----------|-----|
| Frontend Application | http://localhost:4200 |
| Backend API | http://localhost:5218 |
| API Documentation (Swagger) | http://localhost:5218/swagger/index.html |

## Default Login Credentials

**Endpoint**: `POST /api/v1/auth/login`

```json
{
  "userName": "admin",
  "password": "password123"
}
```

*Note: Update with actual credentials from database*

## Main Features

### 1. Login Screen
- Username and password authentication
- Session management
- Error handling

### 2. Processed Files Tab
- Read-only data grid
- Shows: File ID, Name, Hash, Ingest Date, Record Count
- Endpoint: `GET /api/v1/files`

### 3. Fraud Alerts Tab
- Real-time fraud alert monitoring
- Shows: Alert ID, Date, Transaction Info, Rule Broken
- Endpoint: `GET /api/v1/alerts`

### 4. Fraud Rules Tab - CRUD Operations

#### View Rules
- Displays all existing fraud rules
- Shows status (Active/Inactive)
- Endpoint: `GET /api/v1/rules`

#### Create Rule
- Click "+ Create New Fraud Rule"
- Fill form with:
  - Rule Name (e.g., "High Transaction Amount")
  - Field Name (dropdown)
  - Operator (>, <, >=, <=, ==, !=, CONTAINS, NOT_CONTAINS)
  - Threshold Value (e.g., "50000")
  - Active checkbox
- Submit to create
- Endpoint: `POST /api/v1/rules`

#### Edit Rule
- Click "Edit" button on any rule
- Modify fields
- Click "Save Rule"
- Endpoint: `PUT /api/v1/rules/{id}`

#### Delete Rule
- Click "Delete" button
- Confirm deletion
- Endpoint: `DELETE /api/v1/rules/{id}`

#### Toggle Status
- Click "✓ Active" or "✗ Inactive" button
- Status toggles immediately
- Endpoint: `PUT /api/v1/rules/{id}`

## File Structure Quick View

```
fraud-portal/
├── src/app/
│   ├── components/          [UI Components]
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── processed-files/
│   │   ├── fraud-alerts/
│   │   └── fraud-rules/
│   ├── services/            [API & Auth]
│   │   ├── api.service.ts
│   │   └── auth.service.ts
│   ├── guards/              [Route Protection]
│   │   └── auth.guard.ts
│   ├── app.routes.ts        [Routing]
│   └── app.component.ts     [Main App]
├── src/styles.css           [Global Styles - 450+ lines]
├── angular.json             [Build Config]
├── package.json             [Dependencies]
└── Documentation files
```

## Key Dependencies

- **@angular/core** - Angular framework
- **@angular/forms** - Form handling
- **@angular/common** - Common utilities
- **@angular/router** - Routing
- **@angular/platform-browser** - Browser platform
- **rxjs** - Reactive programming
- **typescript** - Language

## API Configuration

**File**: `src/app/services/api.service.ts`

Update API URL:
```typescript
private apiUrl = 'http://localhost:5218/api/v1';
```

## Environment Files

- `.env.example` - Template for environment variables
- Create `.env` file with:
  ```
  API_URL=http://localhost:5218/api/v1
  NODE_ENV=development
  ```

## Deployment

### Development
```bash
npm start
# Runs on http://localhost:4200
```

### Production Build
```bash
npm run build
# Creates dist/fraud-portal/ folder
# Deploy contents to web server
```

### Docker Deployment
```bash
docker build -t fraud-portal .
docker run -p 8080:80 fraud-portal
```

## Testing the API

### Login
```bash
curl -X POST http://localhost:5218/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userName":"admin","password":"password123"}'
```

### Get Rules
```bash
curl -X GET http://localhost:5218/api/v1/rules \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| npm install fails | Run `npm cache clean --force` then retry |
| Port 4200 in use | Use `ng serve --port 4201` |
| API not connecting | Verify backend running on port 5218 |
| CORS errors | Check backend CORS configuration |
| Authentication fails | Verify database has user records |

## Documentation Files

| File | Purpose |
|------|---------|
| README.md | Project overview |
| SETUP_GUIDE.md | Detailed setup instructions |
| API_CONFIGURATION.md | API endpoint documentation |
| IMPLEMENTATION_GUIDE.md | Complete feature documentation |
| QUICK_REFERENCE.md | This file |

## Development Workflow

1. **Start Development Server**
   ```bash
   npm start
   ```

2. **Open Browser**
   - Navigate to http://localhost:4200

3. **Login**
   - Enter credentials

4. **Test Features**
   - Click through tabs
   - Create/Edit/Delete fraud rules
   - Monitor alerts and files

5. **Check Console**
   - Press F12 for developer tools
   - View network requests and errors

6. **Make Changes**
   - Edit TypeScript components
   - Changes auto-reload in browser
   - Check console for errors

## Performance Tips

- Use Chrome DevTools for profiling
- Monitor network tab for API calls
- Check console for JavaScript errors
- Use Angular DevTools browser extension

## Security Checklist

- [ ] Backend running on secure connection (HTTPS)
- [ ] Password hashing implemented on backend
- [ ] CORS properly configured
- [ ] Authentication tokens validated
- [ ] Sensitive data not logged
- [ ] SQL injection prevention implemented
- [ ] Rate limiting enabled
- [ ] Audit logging active

## Useful VS Code Extensions

- Angular Language Service
- Angular Schematics
- Angular Snippets
- Prettier - Code Formatter
- TSLint / ESLint

## Contact & Support

For issues or questions, check:
1. SETUP_GUIDE.md - Troubleshooting section
2. Browser console (F12) - Error messages
3. Network tab - API requests/responses
4. API_CONFIGURATION.md - Endpoint details

## Next Steps

1. ✅ Project scaffolded
2. ⏳ npm install (in progress)
3. → Start development server
4. → Test login functionality
5. → Test each tab's functionality
6. → Create/edit/delete fraud rules
7. → Deploy to production

---

**Last Updated**: 2026-09-08
**Status**: Scaffolding complete, awaiting npm installation completion
