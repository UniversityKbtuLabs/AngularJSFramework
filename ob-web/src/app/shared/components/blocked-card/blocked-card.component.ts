import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ob-blocked-card',
  templateUrl: './blocked-card.component.html',
  styleUrls: ['./blocked-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockedCardComponent {
  constructor() {}
}
