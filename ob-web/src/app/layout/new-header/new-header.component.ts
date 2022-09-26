import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ChangeDetectorRef,
  OnDestroy,
  ElementRef,
  HostListener,
} from '@angular/core';
import { SubscriptionAccumulator } from '@app/core/helpers/SubscriptionAccumulator';
import { NgSelectComponent } from '@ng-select/ng-select';
import { LoginService } from '@core/services/login.service';
import { NavigationEnd, Router } from '@angular/router';
import { redirectRoutes } from '@core/constants';
import { errorMessage, getIn, successMessage } from '@core/helpers';
import { ToastrService } from 'ngx-toastr';
import { IUserInfo } from '@data/models/auth-types';
import { ICheifSigner } from '@data/models/document-type';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { DocumentService } from '@core/services/document.service';
import { AccountsService } from '@core/services/accounts.service';
import { OperationsService } from '@core/services/operations.service';
import { DictionaryService } from '@core/services/dictionary.service';
import { Subscription } from 'rxjs';
import { TARIFFS, WELCOME } from '@app/core/constants/pathnames';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '@env/environment';
import { BreakpointObserver } from '@angular/cdk/layout';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { WelcomeModalComponent } from '@app/modules/home/components/welcome-modal/welcome-modal.component';

@Component({
  selector: 'ob-new-header',
  templateUrl: './new-header.component.html',
  styleUrls: ['./new-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewHeaderComponent
  extends SubscriptionAccumulator
  implements OnInit, OnDestroy
{
  @Input() login: boolean | null = false;
  @Output() appSignIn = new EventEmitter();
  @ViewChild('ngSelect') ngselect!: NgSelectComponent;
  @ViewChild('profile') profileElement: ElementRef;
  @ViewChild('contact') contactElement: ElementRef;
  langValue: string = 'RU';
  langs = [
    { item: 'KZ', value: 'kk' },
    { item: 'RU', value: 'ru' },
    { item: 'EN', value: 'en' },
  ];
  contracts: any = [];
  contractNum: number | string = 0;
  contractName: string = '';
  contractFirstLetter: string = '';
  username: string = '';
  showProfile: boolean = false;
  showContact: boolean = false;
  companyName: string = '';
  contractBin: any = '';
  circleColor: number;
  public subscriptionList: Subscription[] = [];
  selected_one: number | string = -1;
  selectedContractNum: any;
  binNotification: string;
  contractNotification: string;
  extractNotification: string;
  private bc: any;
  public showSmallHeader: boolean = false;
  public showMenu: boolean = false;
  public isProduction: boolean = environment.production;

  modalRef?: BsModalRef;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
    private toastrService: ToastrService,
    private documentService: DocumentService,
    private accountService: AccountsService,
    private operationsService: OperationsService,
    private dictionaryService: DictionaryService,
    private translate: TranslateService,
    private breakpointObserver: BreakpointObserver,
    private modalService: BsModalService
  ) {
    super();
  }

  ngOnInit(): void {
    try {
      this.bc = new BroadcastChannel('test channel');
    } catch (error) {
      console.info('bc not supported');
    }
    this.getPrefill();
    this.getServiceValues();
    this.getTranslates();
    if (this.bc) {
      try {
        this.bc.onmessage = (ev: any) => {
          if (getIn(ev, 'origin') === environment.host) {
            if (getIn(ev, 'data') === 'RELOAD') {
              window.location.reload();
            }
          }
        };
      } catch (error) {
        console.info('bc not supported');
      }
    }
    this.langValue = localStorage.getItem('locale')
      ? localStorage.getItem('locale')
      : 'ru';

    this.breakpointObserver
      .observe(['(max-width: 767.5px)'])
      .subscribe(result => {
        this.showSmallHeader = result.matches;
        this.enableBodyScrolling(this.showProfile, 'unset');
        this.changeDetector.detectChanges();
      });

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        this.showMenu = false;
        this.enableBodyScrolling(true, 'hidden');
      });
  }

  ngOnDestroy(): void {
    this.subscriptionList.forEach(s => {
      s.unsubscribe();
    });
  }

  getServiceValues() {
    this.addSubscriber(
      this.loginService.currentContracts.subscribe((data: any) => {
        this.contracts = data;
        this.changeDetector.detectChanges();
      })
    );

    this.addSubscriber(
      this.loginService.userInfoObject$.subscribe({
        next: data => {
          if (data.currentContract && data.currentContract.bin) {
            this.contractBin = data.currentContract.bin;
          }
          if (data.currentContract && data.currentContract.name) {
            this.contractName = data.currentContract.name;
            this.contractFirstLetter = this.contractName.substr(0, 2);
          }
          if (data.currentContract && data.user.name) {
            this.username = data.user.name;
          }
          this.changeDetector.detectChanges();
        },
      })
    );

    this.addSubscriber(
      this.loginService.selectedContract.subscribe(value => {
        this.contractNum = value;
        this.changeDetector.detectChanges();
      })
    );

    this.addSubscriber(
      this.loginService.currentUser.subscribe(value => {
        this.companyName = value;
        this.changeDetector.markForCheck();
      })
    );

    this.addSubscriber(
      this.loginService.currentContractCircleColor.subscribe(data => {
        this.circleColor = data;
      })
    );
  }

  getTranslates() {
    this.translate
      .get([
        'toast-messages.success.bin',
        'toast-messages.success.contract',
        'toast-messages.success.extract',
      ])
      .subscribe(translations => {
        this.binNotification = translations['toast-messages.success.bin'];
        this.contractNotification =
          translations['toast-messages.success.contract'];
        this.extractNotification =
          translations['toast-messages.success.extract'];
      });
  }

  openDropdown(): void {
    this.ngselect.open();
  }

  getContracts(event: boolean) {
    if (event) {
      this.contracts = this.contracts;
    }
  }

  changeContractStatus() {
    this.contracts = [
      ...this.contracts.sort((a: any, b: any) =>
        a.contractNum == this.selectedContractNum
          ? -1
          : b.contractNum == this.selectedContractNum
          ? 1
          : 0
      ),
    ];
  }
  setContract(item: any, index: number) {
    if (this.contractNum !== item) {
      this.selected_one = item;
      this.selectedContractNum = item;
      this.addSubscriber(
        this.loginService.setContractNum(item).subscribe({
          next: (data: any) => {
            //Этот behavior subject нужен для обновления данных в настройках
            this.loginService.isContractChanged$.next(true);
            this.bc.postMessage('RELOAD');
            this.contractNum = data.currentContract.contractNum;
            this.contractName = data.currentContract.name;
            this.contractFirstLetter = data.currentContract.name.substr(0, 2);
            this.router.routeReuseStrategy.shouldReuseRoute = () => false;
            this.router.onSameUrlNavigation = 'reload';
            this.showProfile = false;
            this.circleColor = index;
            this.changeContractStatus();
            const url = this.router.url.split('/');
            if (redirectRoutes.includes(url[1])) {
              this.router.navigate([WELCOME]);
            } else if (url[1] === 'home') {
              this.router.navigate([WELCOME]);
            } else if (url[url.length - 1] === 'sign-confirm') {
              this.router.navigate([WELCOME]);
            } else if (
              this.router.url.includes('settings/tariffs') &&
              url.length > 3
            ) {
              this.router.navigate([TARIFFS]);
            } else {
              let routerURL = this.router.url;
              if (routerURL.includes('#')) {
                routerURL = routerURL.substring(0, routerURL.indexOf('#'));
              }
              this.router.navigateByUrl(routerURL);
            }
            this.selected_one = -1;
            this.changeDetector.detectChanges();
          },
          error: error => {
            console.info(error);
            // errorMessage(error, this.toastrService) // TODO ошибка импорта
            this.selected_one = -1;
            this.changeDetector.detectChanges();
          },
        })
      );
    }
  }

  isShowProfile(event: any) {
    if (this.showSmallHeader) {
      this.enableBodyScrolling(this.showProfile, 'scroll');
    }
    this.showProfile = !this.showProfile;
  }

  isShowContact() {
    if (this.showSmallHeader) {
      let initialState = {
        isContact: true,
      };
      this.modalRef = this.modalService.show(WelcomeModalComponent, {
        class: 'modal-lg',
        id: 1,
        initialState,
      });
    } else this.showContact = !this.showContact;
  }

  logout() {
    this.loginService.logout();
    this.appSignIn.emit(false);
    this.showProfile = false;
  }

  onSettingsClick(event: any) {
    this.showProfile = false;
    this.router.navigate(['settings']);
  }

  getCircleColor(index: number) {
    let colorNum: number = (index % 10) + 1;
    return 'circle_color_' + String(colorNum);
  }

  copyBin(e: any) {
    e.stopPropagation();
    navigator.clipboard.writeText(this.contractBin);
    successMessage(this.binNotification, this.toastrService);
  }

  copyContract(e: any) {
    e.stopPropagation();
    navigator.clipboard.writeText(String(this.contractNum));
    successMessage(this.contractNotification, this.toastrService);
  }

  useLanguage() {
    if (this.langValue) {
      localStorage.setItem('locale', this.langValue);
      this.translate.use(this.langValue);
    }
  }

  onProfileClick(e: any) {
    e.stopPropagation();
  }

  getPrefill(): void {
    this.loginService.isContractChanged$.subscribe(
      (isContractChanged: boolean) => {
        if (isContractChanged === true && this.login) {
          this.subscriptionList.push(
            this.loginService.getContracts().subscribe(val => {
              this.loginService.contracts.next(val);
              this.contracts = val;
              this.loginService.setCircleColor(
                this.contracts,
                Number(this.contractNum)
              );
              if (this.selectedContractNum) {
                this.changeContractStatus();
              }
            })
          );

          this.loginService.isLoadingUserInfo$.next(true);
          this.subscriptionList.push(
            this.loginService.getUserInfo().subscribe({
              next: (value: IUserInfo) => {
                this.loginService.userInfoObject$.next(value);
                this.loginService.defaultContract.next(
                  value.currentContract.contractNum
                );
                this.loginService.defaultUser.next(value.user.name);
                this.loginService.userInfo$.next(value.currentContract.name);
                this.contractNum = value.currentContract.contractNum;
                this.loginService.setCircleColor(
                  this.contracts,
                  this.contractNum
                );
                this.loginService.isLoadingUserInfo$.next(false);
                this.accountService.postStatementsRefresh().subscribe({
                  next: v => {
                    this.loginService.isContractChanged$.next(false);
                  },
                });
              },
              error: error => {
                this.loginService.isLoadingUserInfo$.next(false);
                errorMessage(error, this.toastrService);
              },
            })
          );
          this.subscriptionList.push(
            this.documentService
              .getSignersChief()
              .subscribe((data: ICheifSigner[]) => {
                if (data && data.length) {
                  this.documentService.firstChiefSigner$.next(data[0]);
                  this.documentService.chiefSigners$.next(data);
                } else {
                  this.documentService.chiefSigners$.next([]);
                }
              })
          );
          this.subscriptionList.push(
            this.documentService.getSignersAccountant().subscribe({
              next: (data: any) => {
                if (data.length) {
                  this.documentService.accountantSigner$.next(data[0]);
                  this.documentService.accountantSigners$.next(data);
                } else {
                  this.documentService.accountantSigners$.next([]);
                }
              },
            })
          );
          this.subscriptionList.push(
            this.operationsService
              .getStaffList()
              .pipe(distinctUntilChanged())
              .subscribe(data => {
                this.operationsService.staffList.next(data.content);
              })
          );
          this.subscriptionList.push(
            this.dictionaryService
              .getCounteragents()
              .pipe(distinctUntilChanged())
              .subscribe(data => {
                this.dictionaryService.counteragents$.next(data.content);
              })
          );
        }
      }
    );
  }

  onMenuClick() {
    this.enableBodyScrolling(this.showMenu, 'hidden');
    this.showMenu = !this.showMenu;
  }

  enableBodyScrolling(flag: boolean, overflowType: string) {
    let hmtl = document.getElementsByTagName('html')[0];
    let body = document.getElementsByTagName('body')[0];
    if (!flag) {
      hmtl.style.overflow = overflowType;
      body.style.overflow = overflowType;
    } else {
      hmtl.style.overflow = 'unset';
      body.style.overflow = 'unset';
    }
  }

  //Для закрытия окна профиля при клике в сторону или переходе
  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: any): void {
    if (
      !this.profileElement?.nativeElement.contains(event.target) &&
      this.profileElement
    ) {
      this.showProfile = false;
    }
    if (
      !this.contactElement?.nativeElement.contains(event.target) &&
      this.contactElement
    ) {
      this.showContact = false;
    }
  }
}
