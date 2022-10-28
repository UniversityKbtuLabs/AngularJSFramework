import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ob-advertising-card',
  templateUrl: './advertising-card.component.html',
  styleUrls: ['./advertising-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvertisingCardComponent implements OnInit {
  cardType: number;

  constructor() {}

  ngOnInit(): void {
    this.cardType = 1;
  }
}
