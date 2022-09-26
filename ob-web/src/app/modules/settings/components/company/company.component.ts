import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { ICurrentContract, IUser } from '@data/models/auth-types';
import { LoginService } from '@core/services/login.service';
import { take } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CertificateModalComponent } from '@app/modules/ecp/certificate-modal/certificate-modal.component';
import { SocketService } from '@app/core/services/socket.service';
import { Subscription } from 'rxjs';
import { errorMessage } from '@app/core/helpers';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ob-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyComponent implements OnInit, OnDestroy {
  public btnList: any[] = [];
  public user: IUser;
  public currentContract: ICurrentContract;
  public signatureGroupId: number;
  public phoneAuthorized: boolean = true;
  modalRef?: BsModalRef;
  public isConnecting: boolean = false;
  public socketDataSubscription: Subscription;
  public checkConnectionMessage: string = '';

  constructor(
    private loginService: LoginService,
    private changeDetector: ChangeDetectorRef,
    private modalService: BsModalService,
    private socketService: SocketService,
    private changeDetection: ChangeDetectorRef,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.getUserInfo();
    this.getTranslations();
  }

  ngOnDestroy(): void {
    if (this.socketDataSubscription) {
      this.socketDataSubscription.unsubscribe();
    }
  }

  getUserInfo() {
    this.loginService.userInfoObject$
      .pipe(take(2)) // TODO FIX
      .subscribe({
        next: v => {
          if (v.user) {
            this.user = v.user;
            this.currentContract = v.currentContract;
            this.signatureGroupId = v.signatureGroupId;
            this.changeDetector.detectChanges();
          }
        },
      });
  }

  toNormalName(name: string): string {
    let words: string[] = name.split(' ');
    // Проходимся по имени фамилии отчеству
    for (let i: number = 0; i < words.length; i++) {
      words[i] =
        words[i].charAt(0).toUpperCase() + words[i].toLowerCase().slice(1);
    }
    return words.join(' ');
  }

  connectWs() {
    //connect to socket
    this.isConnecting = true;
    this.socketService.connect(() => {
      this.socketDataSubscription = this.socketService.data$.subscribe({
        next: v => {
          if (
            v.isApiKeyChecked &&
            v.isApiKeyValid &&
            v.isLoadedKeysFromToken &&
            v.isProfileInfoLoaded &&
            v.isMACAddressLoaded &&
            v.version &&
            v.certificates &&
            v.certificates.length
          ) {
            if (this.isConnecting) {
              //для открывания один раз
              this.isConnecting = false;
              this.openModal();
            }
            if (this.socketDataSubscription) {
              this.socketDataSubscription.unsubscribe();
            }
          }
        },
      });
      this.changeDetection.detectChanges();
    });
  }

  showModal() {
    const initialState: any = { changeFromSettings: true };
    this.modalRef = this.modalService.show(CertificateModalComponent, {
      class: 'modal-lg modal-dialog-centered',
      initialState: initialState,
    });
  }

  openModal() {
    if (this.socketDataSubscription && !this.socketDataSubscription.closed) {
      this.socketDataSubscription.unsubscribe();
    }
    if (this.socketService.connectionStatus$.value) {
      const socketData = this.socketService.data$.value;
      /* 
        Есть connection. Делаем проверку:
        1.На валидность apiKey
        2.На посадку apiKey в системе
      */
      if (socketData.isLoadedKeysFromToken && socketData.certificates.length) {
        this.showModal();
      } else {
        this.socketService.checkApiKey();
        // нужно делать коннект так как клиент мог сменить токен
        this.connectWs();
      }
    } else {
      errorMessage({ message: this.checkConnectionMessage }, this.toastr);
      this.socketService.connect();
    }
  }

  getTranslations() {
    this.translate
      .get(['error.checkTokenConnection'])
      .subscribe(translations => {
        this.checkConnectionMessage =
          translations['error.checkTokenConnection'];
      });
  }
}
