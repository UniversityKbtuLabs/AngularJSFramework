import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'ob-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleComponent {
  @Input() value: boolean = false;
  @Output() toggleChange = new EventEmitter();

  constructor() {}

  changeValue(value: boolean) {
    this.toggleChange.emit(value);
  }
}
