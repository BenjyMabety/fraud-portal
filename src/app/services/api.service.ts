import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface UserDto {
  userId: number;
  userName: string;
  userCreatedDate: string;
  userLastLogin: string;
}

export interface LoginResponse {
  message: string;
  user: UserDto;
}

export interface ProcessedFile {
  fileId: number;
  fileName: string;
  fileHash: string;
  ingestedAt: string;
  recordCount: number;
}

export interface FraudAlert {
  alertId: number;
  triggeredAt: string;
  transactionId: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  transactionType: string;
  ruleBroken: string;
  ruleCondition: string;
}

export interface FraudRule {
  ruleId: number;
  ruleName: string;
  fieldName: string;
  operator: string;
  thresholdValue: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:5214/api/v1'; // Adjust port as needed
  private token: string | null = null;

  constructor(private http: HttpClient) {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private getHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    if (this.token) {
      return headers.set('Authorization', `Bearer ${this.token}`);
    }
    return headers;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        // Store token if available (you might need to adjust based on actual response structure)
        this.setToken('user_token_' + response.user.userId);
      }),
      catchError(this.handleError)
    );
  }

  getProcessedFiles(): Observable<ProcessedFile[]> {
    return this.http.get<ProcessedFile[]>(`${this.apiUrl}/files`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getFraudAlerts(): Observable<FraudAlert[]> {
    return this.http.get<FraudAlert[]>(`${this.apiUrl}/alerts`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getFraudRules(): Observable<FraudRule[]> {
    return this.http.get<FraudRule[]>(`${this.apiUrl}/rules`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  createFraudRule(rule: Omit<FraudRule, 'ruleId'>): Observable<FraudRule> {
    return this.http.post<FraudRule>(`${this.apiUrl}/rules`, rule, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  updateFraudRule(id: number, rule: Omit<FraudRule, 'ruleId'>): Observable<FraudRule> {
    return this.http.put<FraudRule>(`${this.apiUrl}/rules/${id}`, rule, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  deleteFraudRule(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/rules/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  generateSampleFile(): Observable<any> {
    return this.http.post(`${this.apiUrl}/generator/sample-file`, {}, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => new Error(error?.error?.error || 'An error occurred'));
  }
}
