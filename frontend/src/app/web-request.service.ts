import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * This service corrdinates the actual REST requests that
 * go to the backend/api.
 */
@Injectable({
  providedIn: 'root'
})
export class WebRequestService {

  /**
   * This property is the URI on which the API is listening for requests.
   */
  readonly ROOT_URL;

  constructor(private http: HttpClient) {
    this.ROOT_URL = 'http://localhost:3001';
  }

  /**
   * This method sends a GET request to the API.
   *
   * @param[in] uri
   *     The URI that the GET request is for.
   *
   * @returns
   *     The object returned from the database wrapped in an Observable.
   */
  get(uri: string): Observable<object> {
    return this.http.get(`${this.ROOT_URL}/${uri}`);
  }

  /**
   * This method sends a POST request to the API.
   *
   * @param[in] uri
   *     The URI that the POST request is for.
   *
   * @returns
   *     The new object returned from the database wrapped in an Observable.
   *
   * @Note
   *     Should be used when creating new objects, not when updating.
   */
  post(uri: string, payload: object): Observable<object> {
    return this.http.post(`${this.ROOT_URL}/${uri}`, payload);
  }

  /**
   * This method sends a PATCH request to the API.
   *
   * @param[in] uri
   *     The URI that the PATCH request is for.
   *
   * @returns
   *     The updated object returned from the database wrapped in an Observable.
   *
   * @Note
   *     Should be used when updaing already created objects.
   */
  patch(uri: string, payload: object): Observable<object> {
    return this.http.patch(`${this.ROOT_URL}/${uri}`, payload);
  }

  /**
   * This method sends a DELETE request to the API.
   *
   * @param[in] uri
   *     The URI that the DELETE request is for.
   *
   * @returns
   *     The deleted object returned from the database wrapped in an Observable.
   */
  delete(uri: string): Observable<object> {
    return this.http.delete(`${this.ROOT_URL}/${uri}`);
  }

  /**
   * This method sends a POST request to the API in order to log in a user
   * while also observing the full server response
   * instead of only the respose body.
   *
   * @param[in] email
   *     The email the user entered.
   *
   * @param[in] password
   *     The password the user entered.
   *
   * @returns
   *     The full server response holding the user object
   *     wrapped in an Observable.
   */
  login(email: string, password: string): Observable<object> {
    return this.http.post(`${this.ROOT_URL}/users/login`, {
      email, password
    }, {
      observe: 'response'
    });
  }

  /**
   * This method sends a POST request to the API in order to sign in a user
   * while also observing the full server response
   * instead of only the respose body.
   *
   * @param[in] email
   *     The email the user entered.
   *
   * @param[in] password
   *     The password the user entered.
   *
   * @returns
   *     The full server response holding the new user object
   *     wrapped in an Observable.
   */
  signup(email: string, password: string): Observable<object> {
    return this.http.post(`${this.ROOT_URL}/users`, {
      email, password
    }, {
      observe: 'response'
    });
  }
}
