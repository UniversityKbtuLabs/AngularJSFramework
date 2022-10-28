import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InstructionService {
  stepper: any;
  public welcome_step_id: Subject<number> = new Subject<number>();

  constructor() {
    this.welcome_step_id.subscribe(val => {
      this.stepper = val;
    });
  }
  setWelcomeStepId(id: number) {
    this.welcome_step_id.next(id);
  }

  getWelcomeStepId() {
    return this.welcome_step_id;
  }
}
