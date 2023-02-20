import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {
  }

  register(body: any): Observable<any> {
    return this.http.post('http://localhost:8000/api/register', body)
  }

  login(body: any): Observable<any> {
    return this.http.post('http://localhost:8000/api/login', body)
  }
}
