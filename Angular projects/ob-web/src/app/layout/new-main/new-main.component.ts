import { Component, ChangeDetectionStrategy } from '@angular/core';
import { errorMessage } from '@app/core/helpers';
import { AccountsService } from '@app/core/services/accounts.service';
import { DocumentService } from '@app/core/services/document.service';
import { ICheifSigner } from '@app/data/models/document-type';
import { LoginService } from '@core/services/login.service';
import { IContracts, IUserInfo } from '@data/models/auth-types';
import { ToastrService } from 'ngx-toastr';
import { OperationsService } from '@core/services/operations.service';
import { distinctUntilChanged } from 'rxjs/operators';
import { IEmployee } from '@data/models/common-types';
import { IBank } from '@data/models/dictionary-types';
import { DictionaryService } from '@core/services/dictionary.service';
import { ICounteragent } from '@data/models/payment-types';

@Component({
  selector: 'ob-new-main',
  templateUrl: './new-main.component.html',
  styleUrls: ['./new-main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewMainComponent {
  constructor() {}
}
