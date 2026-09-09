# Fraud Admin Portal - Deployment Guide

## Overview

This guide covers deploying the Fraud Admin Portal from development to production environments.

## Pre-Deployment Checklist

- [ ] All dependencies installed (`npm install`)
- [ ] Build process tested (`npm run build`)
- [ ] Environment variables configured
- [ ] API endpoint verified and accessible
- [ ] Backend API deployed and running
- [ ] Database migrations completed
- [ ] CORS properly configured on backend
- [ ] SSL/TLS certificates installed (for HTTPS)
- [ ] Security headers configured
- [ ] Logging and monitoring setup

## Development Environment

### Installation

```bash
cd C:\Users\lonwa\source\repos\fraud-portal
npm install
```

### Running Development Server

```bash
npm start
```

**Access**: http://localhost:4200

### Configuration for Development

**File**: `src/app/services/api.service.ts`

```typescript
private apiUrl = 'http://localhost:5218/api/v1';
```

## Production Build

### Build Process

```bash
npm run build
```

**Output Directory**: `dist/fraud-portal/`

**Build Artifacts**:
- `index.html` - Main HTML file
- `main.*.js` - Application code (minified)
- `styles.*.css` - Global styles (minified)
- `favicon.ico` - Browser icon

### Build Configuration

**File**: `angular.json`

Customizable build options:
- Output path
- Source maps
- Asset optimization
- Bundle size limits

### Production Environment Variables

Create `.env` file in production:

```
API_URL=https://api.fraud-portal.capitec.com
NODE_ENV=production
DEBUG=false
```

Update API service for production:

```typescript
private apiUrl = environment.apiUrl; // Use environment variable
```

## Deployment Options

### Option 1: Static Web Server

#### Using IIS (Windows)

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Create IIS Site**
   - Create new website in IIS Manager
   - Point to `dist/fraud-portal` folder
   - Set port (e.g., 80 for HTTP, 443 for HTTPS)

3. **Configure URL Rewrite**
   Add `web.config` to handle SPA routing:
   ```xml
   <configuration>
     <system.webServer>
       <rewrite>
         <rules>
           <rule name="Angular Routes" stopProcessing="true">
             <match url=".*" />
             <conditions logicalGrouping="MatchAll">
               <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
               <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
             </conditions>
             <action type="Rewrite" url="/" />
           </rule>
         </rules>
       </rewrite>
     </system.webServer>
   </configuration>
   ```

#### Using Nginx

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name fraud-portal.capitec.com;

       root /var/www/fraud-portal/dist/fraud-portal;
       index index.html index.htm;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

3. **Restart Nginx**
   ```bash
   sudo systemctl restart nginx
   ```

#### Using Apache

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Configure Apache**
   ```apache
   <Directory /var/www/fraud-portal/dist/fraud-portal>
       RewriteEngine On
       RewriteBase /
       RewriteRule ^index\.html$ - [L]
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteRule . /index.html [L]
   </Directory>
   ```

3. **Enable Rewrite Module**
   ```bash
   sudo a2enmod rewrite
   sudo systemctl restart apache2
   ```

### Option 2: Docker Deployment

#### Docker Setup

1. **Create Dockerfile**
   ```dockerfile
   # Stage 1: Build
   FROM node:18-alpine as build

   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build

   # Stage 2: Serve
   FROM nginx:alpine

   COPY --from=build /app/dist/fraud-portal /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf

   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Create nginx.conf**
   ```nginx
   server {
       listen 80;
       location / {
           root /usr/share/nginx/html;
           try_files $uri $uri/ /index.html;
       }
   }
   ```

3. **Build Docker Image**
   ```bash
   docker build -t fraud-portal:latest .
   ```

4. **Run Container**
   ```bash
   docker run -d \
     --name fraud-portal \
     -p 8080:80 \
     -e API_URL=https://api.capitec.com \
     fraud-portal:latest
   ```

5. **Push to Registry**
   ```bash
   docker tag fraud-portal:latest registry.example.com/fraud-portal:latest
   docker push registry.example.com/fraud-portal:latest
   ```

### Option 3: Cloud Deployment

#### Azure App Service

1. **Create Resource Group**
   ```bash
   az group create --name fraud-portal-rg --location eastus
   ```

2. **Create App Service Plan**
   ```bash
   az appservice plan create \
     --name fraud-portal-plan \
     --resource-group fraud-portal-rg \
     --sku B1 \
     --is-linux
   ```

3. **Create Web App**
   ```bash
   az webapp create \
     --resource-group fraud-portal-rg \
     --plan fraud-portal-plan \
     --name fraud-portal \
     --deployment-container-image-name fraud-portal:latest
   ```

4. **Configure Environment Variables**
   ```bash
   az webapp config appsettings set \
     --name fraud-portal \
     --resource-group fraud-portal-rg \
     --settings API_URL=https://api.capitec.com
   ```

#### AWS S3 + CloudFront

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Upload to S3**
   ```bash
   aws s3 sync dist/fraud-portal/ s3://fraud-portal-bucket/ --delete
   ```

3. **Create CloudFront Distribution**
   - Origin: S3 bucket
   - Default root object: index.html
   - Error page: 403 → index.html

4. **Set Cache Headers**
   ```bash
   aws s3 cp dist/fraud-portal/index.html s3://fraud-portal-bucket/index.html \
     --metadata-directive REPLACE \
     --cache-control max-age=0,no-cache,no-store,must-revalidate
   ```

#### Netlify Deployment

1. **Connect Repository**
   - Connect GitHub/GitLab account
   - Select fraud-portal repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist/fraud-portal`

3. **Set Environment Variables**
   - API_URL: `https://api.capitec.com`

4. **Configure Redirects**
   Create `netlify.toml`:
   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

## HTTPS/SSL Configuration

### Let's Encrypt (Free SSL)

#### Using Certbot with Nginx

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d fraud-portal.capitec.com
```

#### Update Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/fraud-portal.capitec.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fraud-portal.capitec.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
}

server {
    listen 80;
    return 301 https://$server_name$request_uri;
}
```

### Self-Signed Certificate (Development)

```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365
```

## Performance Optimization

### Compression

**Nginx Configuration**:
```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript;
```

### Caching Strategy

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location = /index.html {
    expires -1;
    add_header Cache-Control "public, max-age=0, must-revalidate";
}
```

### CDN Integration

Use CDN for static assets:
- CloudFront (AWS)
- Cloudflare
- Azure CDN
- Akamai

Update asset URLs in `angular.json`:
```json
{
  "assets": [
    {
      "glob": "**/*",
      "input": "src/assets",
      "output": "/assets"
    }
  ]
}
```

## Monitoring & Logging

### Application Monitoring

1. **Google Analytics**
   ```typescript
   // Add to main.ts
   gtag('config', 'GA_MEASUREMENT_ID');
   ```

2. **Sentry Error Tracking**
   ```typescript
   import * as Sentry from "@sentry/angular";
   Sentry.init({ dsn: "YOUR_DSN" });
   ```

3. **Application Insights (Azure)**
   ```typescript
   import { ApplicationInsights } from '@microsoft/applicationinsights-web';
   const appInsights = new ApplicationInsights({ config: {...} });
   ```

### Log Aggregation

- ELK Stack (Elasticsearch, Logstash, Kibana)
- Splunk
- Datadog
- New Relic

## Security Best Practices

### Content Security Policy

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline';" always;
```

### Security Headers

```nginx
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

### CORS Configuration (Backend)

Ensure backend API allows frontend origin:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("ProductionPolicy", policy =>
    {
        policy
            .WithOrigins("https://fraud-portal.capitec.com")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});
```

## Database Deployment

### Database Migration

```bash
# On backend server
cd CapitecFraudEngine
dotnet ef database update
```

### Backup Strategy

- Daily backups to secondary storage
- Point-in-time recovery enabled
- Automated backup verification

## Rollback Plan

### Version Management

```bash
# Tag releases
git tag -a v1.0.0 -m "Production Release v1.0.0"
git push origin v1.0.0

# Checkout previous version
git checkout v1.0.0
npm install
npm run build
```

### Rollback Steps

1. Stop current deployment
2. Restore previous version
3. Verify API connectivity
4. Test authentication
5. Monitor error rates

## Troubleshooting Deployment

| Issue | Solution |
|-------|----------|
| Blank page | Check browser console, verify API_URL |
| CORS errors | Configure backend CORS headers |
| 404 on refresh | Configure server routing to index.html |
| API timeout | Increase backend timeout settings |
| High memory usage | Implement lazy loading and code splitting |

## Maintenance

### Regular Tasks

- **Weekly**: Monitor error rates and performance
- **Monthly**: Review security patches and updates
- **Quarterly**: Performance optimization and cleanup
- **Annually**: Security audit and disaster recovery test

### Update Dependencies

```bash
npm outdated
npm audit
npm update
npm audit fix
```

## Success Metrics

- Page load time < 3 seconds
- 99.9% uptime
- < 1% error rate
- API response time < 500ms
- User session retention > 90%

## Deployment Checklist

```
Pre-Deployment
□ Build tested locally
□ All tests passing
□ Environment variables configured
□ API endpoint verified
□ Database backups current
□ Security review completed

Deployment
□ Build artifacts generated
□ Deployed to staging
□ Smoke tests passed
□ Performance acceptable
□ Logs monitoring enabled
□ Deployed to production

Post-Deployment
□ Production tests passed
□ Monitoring alerts active
□ Team notified
□ Documentation updated
□ Incident response plan ready
```

---

For detailed instructions, refer to:
- SETUP_GUIDE.md - Development setup
- API_CONFIGURATION.md - Backend configuration
- QUICK_REFERENCE.md - Common commands
