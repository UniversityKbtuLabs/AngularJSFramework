import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { ICurrentContract, IUser } from '@data/models/auth-types';
import { LoginService } from '@core/services/login.service';
import { DictionaryService } from '@core/services/dictionary.service';
import { ICounteragent } from '@data/models/payment-types';
import { distinctUntilChanged, take } from 'rxjs/operators';
import { IBank } from '@data/models/dictionary-types';

@Component({
  selector: 'ob-contragents',
  templateUrl: './contragents.component.html',
  styleUrls: ['./contragents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContragentsComponent implements OnInit {
  public btnList: any[] = [];
  public currentContent: ICounteragent[] = [];
  public user: IUser;
  public currentContract: ICurrentContract;
  public phoneAuthorized: boolean = true;
  public accauntType: string = 'all';
  public searchWord: string = '';
  public maxSize = 5;
  public totalElements: number;
  public currentPage = 0;
  public bankType: number = 0;
  public lastPage: number;

  constructor(
    private loginService: LoginService,
    private dictionaryService: DictionaryService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getUserInfo();
    this.getData();
  }

  getUserInfo() {
    this.loginService.userInfoObject$
      .pipe(take(2)) // TODO FIX
      .subscribe({
        next: v => {
          if (v.user) {
            this.user = v.user;
            this.currentContract = v.currentContract;
            this.changeDetector.detectChanges();
          }
        },
      });
  }

  //Берем начальные данные
  getData() {
    this.dictionaryService
      .getCounteragentsPagination(this.currentPage, 10)
      .pipe(distinctUntilChanged())
      .subscribe(data => {
        this.totalElements = data.totalElements;
        this.lastPage = data.totalPages;
        this.currentContent = data.content;
        this.currentPage = data.currentPage + 1;
        this.changeDetector.detectChanges();
      });
  }

  //Получаем страницу контрагентов
  getCounterAgentsPage(page: number) {
    this.dictionaryService
      .getCounteragentsPagination(page, 10)
      .subscribe(data => {
        this.totalElements = data.totalElements;
        this.lastPage = data.totalPages;
        this.currentContent = data.content;
        this.currentPage = data.currentPage + 1;
        this.changeDetector.detectChanges();
      });
  }

  //выполняется при NgSelect
  // onAccauntTypeChange($event: any) {
  //     switch (this.accauntType) {
  //         case "all": {
  //             this.bankType = 0;
  //             this.currentPage = 0
  //             this.getCounterAgentsPage(this.currentPage);
  //             break;
  //         }
  //         case "Halyk": {
  //             this.bankType = 1;
  //             this.currentPage = 0
  //             this.getBankCounterAgents(this.currentPage);
  //             break;
  //         }
  //         case "Other": {
  //             this.bankType = 2;
  //             this.currentPage = 0;
  //             this.getBankCounterAgents(this.currentPage);
  //             break;
  //         }
  //         default: {
  //             break;
  //         }
  //     }
  // }

  //Получить контрагентов Халык банка
  // getBankCounterAgents(page: number) {
  //     if (this.bankType === 1) {
  //         this.dictionaryService.halykBankContragents.subscribe(data => {
  //             this.countragentList = data;
  //             this.countragentListHelper = data;
  //         })
  //     } else if (this.bankType === 2) {
  //         this.dictionaryService.otherBanksContragents.subscribe(data => {
  //             this.countragentList = data;
  //             this.countragentListHelper = data;
  //         })
  //     }
  //     this.totalElements = this.countragentList.length
  //     this.lastPage = Math.ceil(this.totalElements / this.maxSize)
  //     this.currentContent = this.countragentList.slice(page * 10, page * 10 + 10)
  //     if (this.searchWord !== "") {
  //         this.findContragent(page);
  //     }
  //     this.changeDetector.detectChanges();
  // }

  //Поиск контрагента по имени
  // findContragent(page: number) {
  //     this.countragentList = this.countragentListHelper
  //     let searchedList: ICounteragent[] = []
  //     for (let i: number = 0; i < this.countragentList.length; i++) {
  //         if (this.countragentList[i].name.toLowerCase().includes(this.searchWord.toLowerCase()) ||
  //             this.countragentList[i].idn.includes(this.searchWord)) {
  //             searchedList.push(this.countragentList[i])
  //         }
  //     }
  //     this.countragentList = searchedList;
  //     this.totalElements = this.countragentList.length
  //     this.lastPage = Math.ceil(this.totalElements / this.maxSize)
  //     this.currentContent = this.countragentList.slice(page * 10, page * 10 + 10)
  // }

  //Метод смены страницы для пагинации
  changePage(page: any) {
    if (page.page !== this.currentPage) {
      this.getCounterAgentsPage(page.page - 1);
    }
  }

  getBank(list: IBank[], code: string) {
    let bank: IBank = null;
    for (let i: number = 0; i < list.length; i++) {
      if (list[i].code === code) {
        bank = list[i];
        break;
      }
    }
    return bank;
  }
}
