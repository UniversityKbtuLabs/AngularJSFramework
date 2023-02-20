import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class HelperService {
  backfromAuth$: BehaviorSubject<string> = new BehaviorSubject('');

  constructor() {
  }
}
