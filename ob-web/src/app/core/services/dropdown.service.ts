import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DropdownService {
  dropdownValue: BehaviorSubject<any> = new BehaviorSubject('');
  dropdownSelectedValue = this.dropdownValue.asObservable();

  setDropdownValue(value: any) {
    this.dropdownValue.next(value);
  }
}
