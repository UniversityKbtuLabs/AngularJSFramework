import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { listLocales } from 'ngx-bootstrap/chronos';

@Component({
  selector: 'ob-operations-table-header',
  templateUrl: './operations-table-header.component.html',
  styleUrls: ['./operations-table-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationsTableHeaderComponent implements OnInit {
  locale = 'ru';
  locales = listLocales();

  constructor(private localeService: BsLocaleService) {}

  ngOnInit(): void {
    this.localeService.use(this.locale);
  }
}
