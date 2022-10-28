import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AccountsService } from '@core/services/accounts.service';

@Component({
  selector: 'ob-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  public settingsList: any = [
    {
      label: 'default.information',
      img: 'assets/icons/settings_info.svg',
      code: 'info',
      description: '',
    },
    {
      label: 'accounts.actions.atm-withdrawal',
      img: 'assets/icons/settings_withdraw.svg',
      code: 'withdrawal',
      description: 'Разрешить снимать свыше 700 000 тенге',
    },
    {
      label: 'accounts.actions.internet-operations',
      img: 'assets/icons/settings_withdraw.svg',
      code: 'operations',
      description: '',
    },
    {
      label: 'accounts.actions.password-set',
      img: 'assets/icons/settings_pin.svg',
      code: 'pin',
      description: '',
    },
    {
      label: 'accounts.actions.install-3d',
      img: 'assets/icons/settings_reissue.svg',
      code: '3dsecure',
      description: '',
    },
    {
      label: 'accounts.actions.reissue-card',
      img: 'assets/icons/settings_reissue.svg',
      code: 'reissue',
      description: '',
    },
    {
      label: 'accounts.actions.block',
      img: 'assets/icons/settings_block.svg',
      code: 'block',
      description: '',
    },
  ];

  constructor(public accountsService: AccountsService) {}
  goBack() {
    this.accountsService.changeAccountSettingsStatus(false);
  }
}
