import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';

@Component({
  selector: 'ob-field-error-display',
  templateUrl: './field-error-display.component.html',
  styleUrls: ['./field-error-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldErrorDisplayComponent {
  @Input() displayError: boolean;
  @Input() errorMsg: string;
  constructor() {}
}
