# Fraud Admin Portal - Testing Guide

## Testing Strategy

This guide outlines the testing approach for the Fraud Admin Portal across unit, integration, and end-to-end tests.

## Test Setup

### Dependencies

Tests use Angular's built-in testing framework:
- **Jasmine**: Testing framework
- **Karma**: Test runner
- **Protractor**: E2E testing (deprecated, use Cypress/Playwright)

### Running Tests

```bash
# Run unit tests
npm test

# Run unit tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- --include='**/login.component.spec.ts'

# Run tests in headless mode (CI/CD)
npm test -- --watch=false --browsers=ChromeHeadless
```

## Unit Testing

### Login Component Tests

```typescript
// src/app/components/login/login.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['login']);
    const authSpy = jasmine.createSpyObj('AuthService', ['setCurrentUser']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, RouterTestingModule],
      providers: [
        { provide: ApiService, useValue: apiSpy },
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate required fields', () => {
    component.onLogin();
    expect(component.error).toBe('Username and password are required');
  });

  it('should call API service on successful login', () => {
    const response = {
      message: 'Success',
      user: { userId: 1, userName: 'admin', userCreatedDate: '', userLastLogin: null }
    };
    apiService.login.and.returnValue(of(response));

    component.username = 'admin';
    component.password = 'password123';
    component.onLogin();

    expect(apiService.login).toHaveBeenCalled();
    expect(authService.setCurrentUser).toHaveBeenCalledWith(response.user);
  });

  it('should handle login error', () => {
    const error = new Error('Invalid credentials');
    apiService.login.and.returnValue(throwError(() => error));

    component.username = 'admin';
    component.password = 'wrong';
    component.onLogin();

    expect(component.error).toBe('Invalid credentials');
  });
});
```

### API Service Tests

```typescript
// src/app/services/api.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login with credentials', () => {
    const mockResponse = {
      message: 'Success',
      user: { userId: 1, userName: 'test', userCreatedDate: '', userLastLogin: null }
    };

    service.login({ userName: 'test', password: 'pass' }).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:5218/api/v1/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should get processed files', () => {
    const mockFiles = [
      { fileId: 1, fileName: 'test.csv', fileHash: 'abc123', ingestedAt: '2024-01-01', recordCount: 100 }
    ];

    service.getProcessedFiles().subscribe(files => {
      expect(files).toEqual(mockFiles);
    });

    const req = httpMock.expectOne('http://localhost:5218/api/v1/files');
    expect(req.request.method).toBe('GET');
    req.flush(mockFiles);
  });

  it('should create fraud rule', () => {
    const mockRule = { ruleId: 1, ruleName: 'Test', fieldName: 'Amount', operator: '>', thresholdValue: '1000', isActive: true };

    service.createFraudRule({
      ruleName: 'Test',
      fieldName: 'Amount',
      operator: '>',
      thresholdValue: '1000',
      isActive: true
    }).subscribe(rule => {
      expect(rule.ruleId).toBe(1);
    });

    const req = httpMock.expectOne('http://localhost:5218/api/v1/rules');
    expect(req.request.method).toBe('POST');
    req.flush(mockRule);
  });
});
```

## Integration Testing

### Component Integration

```typescript
describe('Dashboard Integration', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let apiService: ApiService;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent, HttpClientTestingModule],
      providers: [ApiService, AuthService]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService);
    authService = TestBed.inject(AuthService);
  });

  it('should load files on tab switch', (done) => {
    spyOn(apiService, 'getProcessedFiles').and.returnValue(of([]));
    component.switchTab('files');
    fixture.detectChanges();

    setTimeout(() => {
      expect(apiService.getProcessedFiles).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should load alerts on tab switch', (done) => {
    spyOn(apiService, 'getFraudAlerts').and.returnValue(of([]));
    component.switchTab('alerts');
    fixture.detectChanges();

    setTimeout(() => {
      expect(apiService.getFraudAlerts).toHaveBeenCalled();
      done();
    }, 100);
  });
});
```

## End-to-End Testing

### Using Cypress

#### Setup

```bash
npm install --save-dev cypress
npx cypress open
```

#### Test Scenarios

```typescript
// cypress/e2e/login.cy.ts

describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200');
  });

  it('should display login form', () => {
    cy.get('input[id="username"]').should('be.visible');
    cy.get('input[id="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should show error for empty credentials', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('Username and password are required').should('be.visible');
  });

  it('should login successfully', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        message: 'Success',
        user: { userId: 1, userName: 'admin', userCreatedDate: '', userLastLogin: null }
      }
    });

    cy.get('input[id="username"]').type('admin');
    cy.get('input[id="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard');
  });
});

describe('Dashboard Navigation', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/dashboard');
  });

  it('should switch between tabs', () => {
    cy.contains('Processed Files').click();
    cy.get('app-processed-files').should('be.visible');

    cy.contains('Fraud Alerts').click();
    cy.get('app-fraud-alerts').should('be.visible');

    cy.contains('Fraud Rules').click();
    cy.get('app-fraud-rules').should('be.visible');
  });

  it('should create new fraud rule', () => {
    cy.contains('Fraud Rules').click();
    cy.contains('+ Create New Fraud Rule').click();

    cy.get('input[id="ruleName"]').type('Test Rule');
    cy.get('select[id="fieldName"]').select('Amount');
    cy.get('select[id="operator"]').select('>');
    cy.get('input[id="thresholdValue"]').type('50000');

    cy.get('button').contains('Save Rule').click();
    cy.contains('Fraud rule created successfully').should('be.visible');
  });

  it('should delete fraud rule with confirmation', () => {
    cy.contains('Fraud Rules').click();
    cy.get('button').contains('Delete').first().click();
    
    // Confirm dialog
    cy.on('window:confirm', () => true);
    
    cy.contains('Fraud rule deleted successfully').should('be.visible');
  });
});
```

### Using Playwright

```typescript
// tests/fraud-rules.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Fraud Rules CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/login');
    await page.fill('input[id="username"]', 'admin');
    await page.fill('input[id="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('should create, read, update, and delete rule', async ({ page }) => {
    await page.click('button:has-text("Fraud Rules")');
    
    // Create
    await page.click('button:has-text("Create New Fraud Rule")');
    await page.fill('input[id="ruleName"]', 'E2E Test Rule');
    await page.selectOption('select[id="fieldName"]', 'Amount');
    await page.selectOption('select[id="operator"]', '>');
    await page.fill('input[id="thresholdValue"]', '75000');
    await page.click('button:has-text("Save Rule")');
    
    await expect(page.locator('text=Fraud rule created successfully')).toBeVisible();

    // Read
    await expect(page.locator('text=E2E Test Rule')).toBeVisible();

    // Update
    const editBtn = page.locator('button:has-text("Edit")').first();
    await editBtn.click();
    await page.fill('input[id="ruleName"]', 'Updated E2E Rule');
    await page.click('button:has-text("Save Rule")');
    
    await expect(page.locator('text=Updated E2E Rule')).toBeVisible();

    // Delete
    const deleteBtn = page.locator('button:has-text("Delete")').first();
    await deleteBtn.click();
    page.once('dialog', dialog => dialog.accept());
    
    await expect(page.locator('text=Fraud rule deleted successfully')).toBeVisible();
  });
});
```

## Performance Testing

### Lighthouse Testing

```bash
npm install --save-dev lighthouse

# Run Lighthouse
lighthouse http://localhost:4200 --view
```

### Load Testing with Apache JMeter

1. Create test plan with multiple users
2. Set ramp-up period
3. Run stress tests
4. Analyze response times and error rates

## Test Coverage

### Generate Coverage Report

```bash
npm test -- --coverage

# View coverage report
npm test -- --code-coverage
open coverage/index.html
```

### Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### Coverage by Component

| Component | Target | Current |
|-----------|--------|---------|
| ApiService | 90% | TBD |
| AuthService | 85% | TBD |
| LoginComponent | 85% | TBD |
| DashboardComponent | 80% | TBD |
| FraudRulesComponent | 90% | TBD |

## Continuous Integration Testing

### GitHub Actions Configuration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2
      
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - run: npm install
      
      - run: npm run lint
      
      - run: npm test -- --watch=false --code-coverage
      
      - uses: codecov/codecov-action@v2
        with:
          files: ./coverage/lcov.info
      
      - run: npm run build

  e2e:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - run: npm install
      
      - run: npm run build
      
      - run: npx cypress run
```

## Test Data Management

### Mock Data

```typescript
export const MOCK_USERS = [
  { userId: 1, userName: 'admin', userCreatedDate: '2024-01-01', userLastLogin: '2024-01-15' },
  { userId: 2, userName: 'user1', userCreatedDate: '2024-01-02', userLastLogin: '2024-01-14' }
];

export const MOCK_RULES = [
  { ruleId: 1, ruleName: 'High Amount', fieldName: 'Amount', operator: '>', thresholdValue: '50000', isActive: true },
  { ruleId: 2, ruleName: 'Frequent Transactions', fieldName: 'TransactionCount', operator: '>', thresholdValue: '10', isActive: true }
];

export const MOCK_ALERTS = [
  { alertId: 1, triggeredAt: '2024-01-15T10:30:00Z', transactionId: 'TXN001', accountNumber: '123456', accountName: 'John Doe', amount: 75000, transactionType: 'Transfer', ruleBroken: 'High Amount', ruleCondition: 'Amount > 50000' }
];
```

## Accessibility Testing

### WCAG Compliance

```bash
npm install --save-dev @axe-core/react

# Run accessibility tests
npm test -- --include='**/*.a11y.spec.ts'
```

## Security Testing

### OWASP Testing

- [ ] SQL Injection
- [ ] Cross-Site Scripting (XSS)
- [ ] Cross-Site Request Forgery (CSRF)
- [ ] Broken Authentication
- [ ] Sensitive Data Exposure

## Test Execution Checklist

```
Pre-Testing
□ Dependencies installed
□ Environment configured
□ Mock API ready
□ Test data prepared

Unit Testing
□ All components tested
□ All services tested
□ All guards tested
□ Coverage > 80%

Integration Testing
□ Component communication verified
□ Service integration verified
□ Route navigation verified

E2E Testing
□ Login flow tested
□ All tabs tested
□ CRUD operations verified
□ Error handling verified

Performance Testing
□ Load testing passed
□ Response times acceptable
□ No memory leaks
□ Lighthouse score > 90

Post-Testing
□ All tests passing
□ Coverage report reviewed
□ Results documented
□ Failures addressed
```

---

For test execution, run:
```bash
npm test
```

For E2E tests, run:
```bash
npx cypress run
# or
npx playwright test
```
