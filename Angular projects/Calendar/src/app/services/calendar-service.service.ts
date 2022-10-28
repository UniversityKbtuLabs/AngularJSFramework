import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {Appointment} from "../models/Appointment";

@Injectable({
  providedIn: 'root'
})
export class CalendarServiceService {
  appointments$: BehaviorSubject<Appointment[]> = new BehaviorSubject<Appointment[]>([]);

  constructor() {
  }
}
