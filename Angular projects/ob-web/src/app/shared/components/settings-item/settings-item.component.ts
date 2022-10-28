import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';

@Component({
  selector: 'ob-settings-item',
  templateUrl: './settings-item.component.html',
  styleUrls: ['./settings-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsItemComponent {
  @Input() setting: any;

  constructor() {}
}
