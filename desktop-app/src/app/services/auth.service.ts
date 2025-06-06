import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
 private apiUrl = environment.apiUrl+"login";
  private tokenKey = 'authToken';
  private loginIdKey = 'loginId';
  private expireKey = 'tokenExpire';
  private logoutTimer: any;

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient,private router: Router) {
    this.autoLogoutCheckOnStart(); // <-- ตรวจสอบทุกครั้งที่เปิดแอป
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { username, password }).pipe(
      tap(response => {
        localStorage.setItem(this.tokenKey, response.token);
        localStorage.setItem(this.loginIdKey, response.loginID);
        localStorage.setItem(this.expireKey, response.tokenExpireDate);

        this.isAuthenticatedSubject.next(true);
        this.setAutoLogout(); // <-- ตั้ง Timer
      })
    );
  }

logout(): void {
  localStorage.removeItem(this.tokenKey);
  localStorage.removeItem(this.loginIdKey);
  localStorage.removeItem(this.expireKey);

  if (this.logoutTimer) {
    clearTimeout(this.logoutTimer);
  }

  this.isAuthenticatedSubject.next(false);
  console.log("คุณถูก logout อัตโนมัติเนื่องจาก token หมดอายุ");

  this.router.navigate(['/login']); // <-- Redirect ไปหน้า login
}

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getLoginId(): string | null {
    return localStorage.getItem(this.loginIdKey);
  }

  isLoggedIn(): boolean {
    return this.hasValidToken();
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    const expireDateStr = localStorage.getItem(this.expireKey);
    if (!token || !expireDateStr) return false;

    const expireDate = new Date(expireDateStr);
    return expireDate > new Date();
  }

  private setAutoLogout(): void {
    const expireDateStr = localStorage.getItem(this.expireKey);
    if (!expireDateStr) return;

    const expireDate = new Date(expireDateStr);
    const now = new Date();
    const timeUntilExpiry = expireDate.getTime() - now.getTime();

    if (timeUntilExpiry > 0) {
      this.logoutTimer = setTimeout(() => {
        this.logout();
      }, timeUntilExpiry);
    } else {
      this.logout();
    }
  }

  private autoLogoutCheckOnStart(): void {
    if (this.hasValidToken()) {
      this.setAutoLogout();
    } else {
      this.logout();
    }
  }
}
