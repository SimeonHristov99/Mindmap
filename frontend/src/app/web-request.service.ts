import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebRequestService {

  readonly ROOT_URL;

  constructor(private http: HttpClient) {
    this.ROOT_URL = 'http://localhost:3001';
  }

  get(uri: string): Observable<object> {
    return this.http.get(`${this.ROOT_URL}/${uri}`);
  }

  post(uri: string, payload: object): Observable<object> {
    return this.http.post(`${this.ROOT_URL}/${uri}`, payload);
  }

  patch(uri: string, payload: object): Observable<object> {
    return this.http.patch(`${this.ROOT_URL}/${uri}`, payload);
  }

  delete(uri: string): Observable<object> {
    return this.http.delete(`${this.ROOT_URL}/${uri}`);
  }

  login(email: string, password: string): Observable<object> {
    return this.http.post(`${this.ROOT_URL}/users/login`, {
      email, password
    }, {
      observe: 'response'
    });
  }
}
