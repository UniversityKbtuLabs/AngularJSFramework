import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
@Component({
  selector: 'ob-knp',
  templateUrl: './knp.component.html',
  styleUrls: ['./knp.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KnpComponent {
  @Input() knpCode: string = '';
  @Input() knpName: string = '';
  @Input() searchTitle: string = '';

  constructor() {}
}
