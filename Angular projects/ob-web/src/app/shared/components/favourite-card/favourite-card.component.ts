import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
/*
  favourite-card reusable component`
  need to use 'favourite' == false

*/
@Component({
  selector: 'ob-favourite-card',
  templateUrl: './favourite-card.component.html',
  styleUrls: ['./favourite-card.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavouriteCardComponent {
  @Input() public title: string = this.translate.instant(
    'transfers.freeTransfers'
  );
  @Input() public total: string = '10 из 10';
  @Input() public subMessage: string = 'до 01.11.2021 г.';
  @Input() public favourite: boolean = false;
  @Input() public borderClass: string = '';

  constructor(private translate: TranslateService) {}
}
