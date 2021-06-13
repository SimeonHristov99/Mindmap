import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';
import { shareReplay, tap } from 'rxjs/operators';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { EMPTY, empty, Observable, OperatorFunction, throwError } from 'rxjs';
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

  constructor(
    private webService: WebRequestService,
    private router: Router,
    private http: HttpClient,
  ) { }

  removeSession(): void {
    localStorage.removeItem('user-id');
    localStorage.removeItem('x-access-token');
    localStorage.removeItem('x-refresh-token');
  }

  getUserId(): string | null {
    return localStorage.getItem('user-id');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('x-access-token');
  }

  getNewAccessToken(): Observable<object> {
    const refreshToken: string | null = this.getRefreshToken();
    const id: string | null = this.getUserId();

    if (refreshToken && id) {
      return this.http.get(`${this.webService.ROOT_URL}/users/me/access-token`, {
        headers: {
          'x-refresh-token': refreshToken,
          _id: id
        },
        observe: 'response'
      }).pipe(
        tap((res: HttpResponse<any>) => {
          const accToken: string | null = res.headers.get('x-access-token');

          if (accToken) {
            this.setAccessToken(accToken);
          }

        })
      );
    }

    return throwError('No token or ID');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('x-refresh-token');
  }

  setAccessToken(value: string): void {
    localStorage.setItem('x-access-token', value);
  }

  /**
   * This method checks the passed in credentials and creates
   * an account for the user if they are valid.
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
  signup(email: string, password: string): Observable<object> {
    return this.webService.signup(email, password).pipe(
      shareReplay() as OperatorFunction<object, HttpResponse<any>>,
      tap((res: HttpResponse<any>) => {

        this.setSession(
          res.body._id,
          res.headers.get('x-access-token'),
          res.headers.get('x-refresh-token'),
        );
      })
    );
  }

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
      })
    );
  }

  /**
   * This method removes the tokens from local storage
   * and redirects the user gets to the 'Log in' page.
   */
  logout(): void {
    this.removeSession();
    this.router.navigateByUrl('/login');
  }

  getUsers(): Observable<object> {
    const userId = localStorage.getItem('user-id');
    return this.webService.get(`users/${userId}`);
  }

  /**
   * This method removes the user,
   * their documents and the shapes they have created
   * from the database.
   *
   * @param[in] userId
   *     The id of the user to be deleted.
   *
   * @returns
   *     The object returned from the database wrapped in an Observable.
   */
  delete(): Observable<object> {
    const userId = localStorage.getItem('user-id');
    return this.webService.delete(`users/${userId}`);
  }

}
