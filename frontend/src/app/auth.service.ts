import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';
import { shareReplay, tap } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
import { Observable, OperatorFunction } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private setSession(userId: string, accessToken: string | null, refreshToken: string | null): void {
    if (accessToken && refreshToken) {
      localStorage.setItem('user-id', userId);
      localStorage.setItem('x-access-token', accessToken);
      localStorage.setItem('x-refresh-token', refreshToken);
    } else {
      alert('AuthService: Error in setSession!');
    }
  }

  private removeSession(): void {
    localStorage.removeItem('user-id');
    localStorage.removeItem('x-access-token');
    localStorage.removeItem('x-refresh-token');
  }

  constructor(
    private webService: WebRequestService,
    private router: Router
  ) { }

  /**
   * This method checks the passed in credentials and logs the user in,
   * if they are valid.
   *
   * @param[in] email
   *     This is the provided email.
   *
   * @param[in] password
   *     This is the provided password.
   *
   * @returns
   *     The object returned from the database wrapped in an Observable.
   */
  login(email: string, password: string): Observable<object> {
    return this.webService.login(email, password).pipe(
      shareReplay() as OperatorFunction<object, HttpResponse<any>>,
      tap((res: HttpResponse<any>) => {

        this.setSession(
          res.body._id,
          res.headers.get('x-access-token'),
          res.headers.get('x-refresh-token'),
        );

        console.log('LOGGED IN!');
      })
    );
  }

  logout(): void {
    this.removeSession();

    this.router.navigateByUrl('/login');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('x-access-token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('x-refresh-token');
  }
  
  setAccessToken(value: string): void {
    localStorage.setItem('x-access-token', value);
  }
}
