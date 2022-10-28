import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'ob-small-input',
  templateUrl: './small-input.component.html',
  styleUrls: ['./small-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmallInputComponent {
  @Input() value: any = '';
  @Input() type: string = 'text';
  @Output() toggleChange = new EventEmitter();

  constructor() {}

  changeValue() {
    this.toggleChange.emit(this.value);
  }
}
