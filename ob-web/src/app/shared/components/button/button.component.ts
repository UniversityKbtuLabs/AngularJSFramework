import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { Router } from '@angular/router';
import { AccountsService } from '@core/services/accounts.service';

@Component({
  selector: 'ob-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  @Input() label: string = '';
  @Input() onClick: any = () => {};
  @Input() className: string = '';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() type: string = 'submit';
  @Output() clicked = new EventEmitter();

  constructor(public router: Router, public accountsService: AccountsService) {}

  click() {
    if (!this.disabled) {
      this.onClick();
      this.clicked.emit(true);
    }
  }
}
