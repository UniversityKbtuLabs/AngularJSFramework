import {
  Component,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'ob-input-calendar',
  templateUrl: './input-calendar.component.html',
  styleUrls: ['./input-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputCalendarComponent {
  public bsValue = new Date();
  @Output() selectedDate = new EventEmitter<Date>();
  constructor() {}

  onChanges() {
    this.selectedDate.emit(this.bsValue);
  }
}
