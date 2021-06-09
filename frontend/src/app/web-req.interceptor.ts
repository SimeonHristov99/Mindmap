import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { EMPTY, Observable, Subscription, throwError } from 'rxjs';
import { Subject } from 'rxjs/internal/Subject';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebReqInterceptor implements HttpInterceptor, OnDestroy {

  constructor(private authService: AuthService) { }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private refreshingAccessToken = false;
  private subscription: Subscription = new Subscription();

  /**
   * @Note
   *     Subjects are a special type of Observable. They are like EventEmitters.
   *     They can be subscribed to (list normal Observables)
   *     but they can also call next() which sends a message
   *     to each observer (kind of like emitting an event).
   * 
   *     Used because sometimes the documents in the right menu
   *     are not shown.
   */

  accessTokenRefreshed: Subject<any> = new Subject();

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

        if (err.status === 401) { // unauthorised

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
    if (this.refreshingAccessToken) {

      return new Observable(observer => {
        this.subscription = this.accessTokenRefreshed.subscribe(() => {
          observer.next();
          observer.complete();
        });
      });

    } else {
      this.refreshingAccessToken = true;

      return this.authService.getNewAccessToken().pipe(
        tap(() => { // like subscribe but does not consume the observable
          console.log('Acess Token Refreshed!');
          this.refreshingAccessToken = false;
          this.accessTokenRefreshed.next();
        })
      );
    }
  }
}
