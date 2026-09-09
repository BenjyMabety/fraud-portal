# Fraud Admin Portal - Troubleshooting Guide

## Common Issues and Solutions

### Installation Issues

#### Issue: npm install fails with permission errors

**Error**:
```
npm ERR! code EACCES
npm ERR! syscall mkdir
npm ERR! path /usr/local/lib/node_modules
```

**Solutions**:
```bash
# Option 1: Use sudo (not recommended)
sudo npm install -g angular-cli

# Option 2: Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Option 3: Clear npm cache
npm cache clean --force
npm install
```

#### Issue: npm install takes too long or times out

**Error**:
```
npm WARN retry will retry, error on last attempt
npm ERR! request to https://registry.npmjs.org/... timed out
```

**Solutions**:
```bash
# Increase timeout
npm config set fetch-timeout 60000
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 120000

# Use npm registry mirror
npm config set registry https://registry.npmmirror.com

# Or use yarn instead
yarn install
```

#### Issue: Peer dependency warnings

**Error**:
```
npm WARN @angular/core@18.0.0 requires peer tslib@^2.6.0 but none is installed
```

**Solution**:
```bash
npm install --save-peer tslib@^2.6.0
```

### Running the Application

#### Issue: Port 4200 already in use

**Error**:
```
✖ Port 4200 is already in use
```

**Solutions**:
```bash
# Find process using port 4200
netstat -ano | findstr :4200  # Windows
lsof -i :4200                 # Mac/Linux

# Kill the process
taskkill /PID <PID> /F         # Windows
kill -9 <PID>                  # Mac/Linux

# Or use different port
ng serve --port 4201
npm start -- --port 4201
```

#### Issue: Module not found errors

**Error**:
```
ERROR in src/app/app.component.ts - error TS2307: Cannot find module 'path/to/module'
```

**Solutions**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear Angular cache
ng cache clean
rm -rf .angular

# Update imports in your code
# Ensure all import paths are correct
```

#### Issue: TypeScript compilation errors

**Error**:
```
ERROR in src/app/services/api.service.ts:45:12
TS2559: Type 'X' has no properties in common with type 'Y'
```

**Solutions**:
1. Check type definitions match API responses
2. Update model interfaces in `api.service.ts`
3. Ensure strict mode is disabled if needed:
   ```json
   {
     "strict": false
   }
   ```

### API Connection Issues

#### Issue: Cannot connect to backend API

**Error**:
```
HttpErrorResponse { status: 0 }
GET http://localhost:5218/api/v1/files 0 Unknown Error
```

**Solutions**:
1. Verify backend is running:
   ```bash
   cd C:\Users\lonwa\source\repos\CapitecFraudEngine
   dotnet run
   ```

2. Check backend is on correct port:
   ```bash
   netstat -ano | findstr :5218
   ```

3. Update API URL in `src/app/services/api.service.ts`:
   ```typescript
   private apiUrl = 'http://localhost:5218/api/v1';
   ```

4. Test API manually:
   ```bash
   curl -X GET http://localhost:5218/api/v1/rules
   ```

#### Issue: CORS errors

**Error**:
```
Access to XMLHttpRequest at 'http://localhost:5218/api/v1/...' 
from origin 'http://localhost:4200' has been blocked by CORS policy
```

**Solutions**:

1. Enable CORS on backend (`Program.cs`):
   ```csharp
   builder.Services.AddCors(options =>
   {
       options.AddPolicy("AllowAll", policy =>
       {
           policy.AllowAnyOrigin()
                 .AllowAnyMethod()
                 .AllowAnyHeader();
       });
   });

   app.UseCors("AllowAll");
   ```

2. For production, restrict origins:
   ```csharp
   policy.WithOrigins("https://fraud-portal.capitec.com")
         .AllowAnyMethod()
         .AllowAnyHeader();
   ```

3. If using proxy (development only), create `proxy.conf.json`:
   ```json
   {
     "/api": {
       "target": "http://localhost:5218",
       "pathRewrite": {
         "^/api": "/api/v1"
       }
     }
   }
   ```

4. Start with proxy:
   ```bash
   ng serve --proxy-config proxy.conf.json
   ```

#### Issue: 401 Unauthorized errors

**Error**:
```
HttpErrorResponse { status: 401, statusText: 'Unauthorized' }
```

**Solutions**:
1. Verify login credentials are correct
2. Check token is being sent with requests
3. Verify token hasn't expired
4. Check backend authentication implementation
5. Test login endpoint directly:
   ```bash
   curl -X POST http://localhost:5218/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"userName":"admin","password":"password123"}'
   ```

#### Issue: 404 Not Found errors

**Error**:
```
GET http://localhost:5218/api/v1/files 404 Not Found
```

**Solutions**:
1. Verify endpoint URL spelling
2. Check HTTP method (GET/POST/PUT/DELETE)
3. Verify backend has implemented endpoint
4. Check API version in URL
5. Test endpoint with curl:
   ```bash
   curl -X GET http://localhost:5218/api/v1/files
   ```

### Login Issues

#### Issue: Login button not working

**Error**: Button click has no effect

**Solutions**:
1. Check browser console for errors (F12)
2. Verify API endpoint is correct
3. Check credentials are filled in
4. Verify backend is running
5. Check network tab in DevTools for API calls

#### Issue: Login succeeds but not redirected to dashboard

**Error**: Stays on login page after successful login

**Solutions**:
1. Check if routing is configured correctly in `app.routes.ts`
2. Verify `DashboardComponent` exists and is exported
3. Check for navigation errors in console
4. Ensure `AuthGuard` is properly configured

#### Issue: Credentials don't match database

**Error**: "Invalid username or password"

**Solutions**:
1. Verify database has user records in `Users` table
2. Check password hashing algorithm matches backend
3. Verify username/password case sensitivity
4. Test database connection from backend:
   ```bash
   mysql -u root -p
   USE CapitecFraud;
   SELECT * FROM Users;
   ```

### Data Display Issues

#### Issue: Tables show no data

**Error**: Tables are empty even though API returns data

**Solutions**:
1. Check network tab for API response
2. Verify data structure matches models
3. Check component subscription is active
4. Add console logging:
   ```typescript
   this.apiService.getProcessedFiles().subscribe({
     next: (data) => {
       console.log('Received data:', data);
       this.files = data;
     }
   });
   ```

#### Issue: Dates display incorrectly

**Error**: Dates show as invalid or wrong format

**Solutions**:
1. Update date formatting in component:
   ```typescript
   formatDate(date: string): string {
     return new Date(date).toLocaleString();
   }
   ```

2. Or use Angular date pipe in template:
   ```html
   {{ file.ingestedAt | date:'short' }}
   ```

#### Issue: Currency shows incorrectly

**Error**: Amounts not formatted as ZAR currency

**Solutions**:
```typescript
formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR'
  }).format(amount);
}
```

### Fraud Rules CRUD Issues

#### Issue: Cannot create new rule

**Error**: Form submission fails silently

**Solutions**:
1. Check all form fields are filled
2. Verify form validation logic
3. Check console for JavaScript errors
4. Verify API endpoint: `POST /api/v1/rules`
5. Test backend endpoint:
   ```bash
   curl -X POST http://localhost:5218/api/v1/rules \
     -H "Content-Type: application/json" \
     -d '{
       "ruleName": "Test",
       "fieldName": "Amount",
       "operator": ">",
       "thresholdValue": "1000",
       "isActive": true
     }'
   ```

#### Issue: Cannot edit rule

**Error**: Edit form doesn't populate or save fails

**Solutions**:
1. Verify rule ID is being passed correctly
2. Check PUT endpoint: `PUT /api/v1/rules/{id}`
3. Verify all required fields are filled
4. Check form validation

#### Issue: Cannot delete rule

**Error**: Delete button click doesn't trigger deletion

**Solutions**:
1. Check confirmation dialog appears
2. Verify DELETE endpoint: `DELETE /api/v1/rules/{id}`
3. Ensure proper CORS configuration for DELETE
4. Test backend endpoint:
   ```bash
   curl -X DELETE http://localhost:5218/api/v1/rules/1
   ```

### Build and Deployment Issues

#### Issue: Build fails with TypeScript errors

**Error**:
```
ng build
ERROR in src/app/...ts - error TS2307: Cannot find module
```

**Solutions**:
1. Fix import paths
2. Ensure all dependencies are installed
3. Check TypeScript configuration in `tsconfig.json`
4. Run linting:
   ```bash
   ng lint
   ```

#### Issue: Build succeeds but application doesn't run

**Error**: Blank page or 404 errors

**Solutions**:
1. Check `index.html` is present in dist folder
2. Verify server routing configuration
3. Check browser console for errors
4. Verify assets are copied correctly
5. Check `angular.json` build configuration

#### Issue: High bundle size

**Error**: Application loads slowly

**Solutions**:
1. Enable production build:
   ```bash
   ng build --configuration production
   ```

2. Implement lazy loading for routes
3. Use OnPush change detection
4. Analyze bundle:
   ```bash
   ng build --stats-json
   npm install -g webpack-bundle-analyzer
   webpack-bundle-analyzer dist/fraud-portal/stats.json
   ```

### Browser Console Errors

#### Common Error Patterns

| Error | Cause | Solution |
|-------|-------|----------|
| `Cannot read property 'xyz' of undefined` | Null/undefined object | Add null checks |
| `ReferenceError: variable is not defined` | Missing import | Add import statement |
| `TypeError: this.service.method is not a function` | Wrong service injection | Check service provider |
| `404 Not Found (favicon.ico)` | Missing favicon | Ignore or add favicon |

### Performance Issues

#### Issue: Application is slow

**Solutions**:
1. Check DevTools Performance tab
2. Look for slow API calls
3. Reduce change detection:
   ```typescript
   @Component({
     changeDetection: ChangeDetectionStrategy.OnPush
   })
   ```

4. Implement virtual scrolling for large lists
5. Lazy load components

#### Issue: High memory usage

**Solutions**:
1. Unsubscribe from observables:
   ```typescript
   private destroy$ = new Subject<void>();
   
   ngOnInit() {
     this.data$.pipe(takeUntil(this.destroy$)).subscribe(...);
   }
   
   ngOnDestroy() {
     this.destroy$.next();
     this.destroy$.complete();
   }
   ```

2. Remove event listeners
3. Clear intervals/timeouts

### Browser-Specific Issues

#### Chrome/Edge
- Check DevTools for errors
- Clear cache: Ctrl+Shift+Delete

#### Firefox
- Check console
- Disable extensions if conflicting

#### Safari
- Update to latest version
- Check console (Cmd+Option+I)

### Getting Help

If you encounter an issue:

1. **Check the documentation**:
   - SETUP_GUIDE.md
   - API_CONFIGURATION.md
   - IMPLEMENTATION_GUIDE.md

2. **Check browser console** (F12):
   - Look for error messages
   - Check network tab for API calls

3. **Check backend logs**:
   - Run backend with verbose logging
   - Check database connectivity

4. **Test API manually**:
   ```bash
   curl -X GET http://localhost:5218/api/v1/rules -v
   ```

5. **Review code**:
   - Compare with component examples
   - Check service integration
   - Verify routing configuration

## Debugging Tips

### Enable Debug Mode

```typescript
import { enableDebugTools } from '@angular/platform-browser';
enableDebugTools(componentRef);
```

### Add Console Logging

```typescript
// In components
console.log('Data:', this.data);
console.log('Loading:', this.loading);

// In services
console.log('API Call:', url, data);
```

### Use Chrome DevTools

- **Network Tab**: Monitor API calls
- **Console Tab**: View errors and logs
- **Elements Tab**: Inspect HTML structure
- **Performance Tab**: Profile performance
- **Application Tab**: Check storage/cookies

### Use Angular DevTools Extension

Install from Chrome Web Store for enhanced debugging

## Quick Fixes Checklist

```
□ Clear browser cache (Ctrl+Shift+Delete)
□ Restart development server (npm start)
□ Reinstall dependencies (rm node_modules, npm install)
□ Clear Angular cache (ng cache clean)
□ Check console for errors (F12)
□ Verify API is running
□ Check network requests (Network tab)
□ Review error messages carefully
□ Search online for error message
□ Check GitHub issues for your version
□ Ask for help with full error details
```

---

**Last Updated**: 2026-09-08

For additional help, refer to:
- Angular Documentation: https://angular.io/docs
- TypeScript Documentation: https://www.typescriptlang.org/docs/
- HTTP Client: https://angular.io/guide/http
