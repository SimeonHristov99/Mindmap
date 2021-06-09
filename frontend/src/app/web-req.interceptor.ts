import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, empty, Observable, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebReqInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) { }

  private refreshingAccessToken = false;

  private addAuthHeader(request: HttpRequest<any>): HttpRequest<any> {
    // add the access token to each request
    const token = this.authService.getAccessToken();

    if (token) {
      // append it to the request header
      return request.clone({
        setHeaders: {
          'x-access-token': token
        }
      });
    }

    return request;
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    request = this.addAuthHeader(request);

    // call next() and handle the response
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {

        if (err.status === 401 && !this.refreshingAccessToken) { // unauthorised

          return this.refreshAccessToken().pipe(
            switchMap(() => {
              request = this.addAuthHeader(request);
              return next.handle(request);
            }),
            catchError((error: any) => {
              console.log(error);
              this.authService.logout();
              return EMPTY;
            })
          );

        }

        return throwError(err);
      })
    );
  }

  refreshAccessToken(): Observable<object> {

    this.refreshingAccessToken = true;

    return this.authService.getNewAccessToken().pipe(
      tap(() => { // like subscribe but does not consume the observable
        this.refreshingAccessToken = false;
        console.log('Acess Token Refreshed!');
      })
    );
  }
}
