import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  EventEmitter,
  Output,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ob-knp-cbc',
  templateUrl: './knp-cbc.component.html',
  styleUrls: ['./knp-cbc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KnpCbcComponent {
  @Input() filteredData: any = [];
  @Input() searchTitle: string = this.translate.instant('budget.knp-cbc');
  @Input() flag: boolean = false;
  @Output() selectedId = new EventEmitter<any>();

  @Input() knp: string = '';
  @Input() cbc: string = '';
  @Input() cbcName: string = '';
  @Input() knpName: string = '';

  constructor(private translate: TranslateService) {}

  selectedItem(index: number) {
    this.selectedId.emit(index);
    this.filteredData = [];
  }
}
