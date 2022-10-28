import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'ob-info-block',
  templateUrl: './info-block.component.html',
  styleUrls: ['./info-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoBlockComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() color: string = '';
  @Input() hint?: string = '';

  constructor() {}
}
