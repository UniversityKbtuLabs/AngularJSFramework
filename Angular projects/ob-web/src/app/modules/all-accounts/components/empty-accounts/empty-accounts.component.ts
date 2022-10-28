import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ob-empty-accounts',
  templateUrl: './empty-accounts.component.html',
  styleUrls: ['./empty-accounts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyAccountsComponent {
  @Input() type: string;
  public cardLabel: string;
  public depositLabel: string;
  public creditLabel: string;
  public accountLabel: string;

  constructor(public translate: TranslateService) {
    this.getTranslations();
  }

  getTranslations() {
    this.translate
      .get([
        'general.operations.card',
        'general.operations.deposit',
        'general.operations.credit',
        'general.operations.account',
      ])
      .subscribe(translations => {
        this.cardLabel = translations['general.operations.card'];
        this.depositLabel = translations['general.operations.deposit'];
        this.creditLabel = translations['general.operations.credit'];
        this.accountLabel = translations['general.operations.account'];
      });
  }
  getText() {
    switch (this.type) {
      case 'accounts':
        return this.accountLabel;
      case 'cards':
        return this.cardLabel;
      case 'deposits':
        return this.depositLabel;
      case 'credits':
        return this.creditLabel;
      default:
        return this.cardLabel;
    }
  }
}
