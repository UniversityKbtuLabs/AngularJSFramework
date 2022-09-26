import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'ob-notification-card',
  templateUrl: './notification-card.component.html',
  styleUrls: ['./notification-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationCardComponent {
  @Input() title: string = '';
  @Input() btnTitle: string = '';
  @Input() description: string = '';
  @Input() count: number = 0;
  constructor(private router: Router) {}

  onClick() {
    this.router.navigate(['/home/operations'], {
      queryParams: { operation: 'all', isSigning: true },
    });
  }
}
