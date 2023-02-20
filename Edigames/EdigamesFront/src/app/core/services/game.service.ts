import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class GameService {

  dialogGame$: BehaviorSubject<any> = new BehaviorSubject({});

  constructor(private http: HttpClient) {
  }

  getGamesByYear(year: number, number: number, page: number): Observable<any> {
    return this.http.get('http://localhost:8000/api/games/' + year + '/' + number + '/' + page
    )
  }
}
