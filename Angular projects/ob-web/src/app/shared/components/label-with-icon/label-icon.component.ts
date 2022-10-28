import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';
/*
 `Label-with-Icon reusable component`

to display label on the left send 'label-on-left' class into [labelPosition]
to display label on the right send 'label-on-right' class into [labelPosition]

*/

@Component({
  selector: 'ob-label-with-icon',
  template: ` <div class="label-icon-container {{ labelPosition }}">
    <span class="icon {{ iconClass }}"></span>
    <p class="label-icon-container__{{ textStyle }}">{{ title }}</p>
  </div>`,
  styleUrls: ['../../shared.module.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelWithIconComponent {
  @Input() title: string = '';
  @Input() iconClass: string = '';
  @Input() textStyle: string = '';
  @Input() labelPosition: string = '';

  constructor() {}
}
