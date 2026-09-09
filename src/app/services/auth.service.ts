import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserDto } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserDto | null>(this.getUserFromStorage());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {}

  setCurrentUser(user: UserDto): void {
    this.currentUserSubject.next(user);
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  getCurrentUser(): UserDto | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('current_user');
    localStorage.removeItem('auth_token');
  }

  private getUserFromStorage(): UserDto | null {
    const user = localStorage.getItem('current_user');
    return user ? JSON.parse(user) : null;
  }
}
