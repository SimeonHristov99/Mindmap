import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebReqInterceptor implements HttpInterceptor {

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

  constructor(private authService: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    request = this.addAuthHeader(request);

    // call next() and handle the response
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        // console.log(err);

        if (err.status === 401) { // unauthorised


          this.authService.logout();
        }

        return throwError(err);
      })
    );
  }
}
