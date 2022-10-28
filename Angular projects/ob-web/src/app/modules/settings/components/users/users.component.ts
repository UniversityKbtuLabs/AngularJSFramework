import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { ICurrentContract, IUser } from '@data/models/auth-types';
import { LoginService } from '@core/services/login.service';
import { DocumentService } from '@core/services/document.service';
import { ISigner } from '@data/models/document-type';
import { take } from 'rxjs/operators';
import { environment } from '@env/environment';

@Component({
  selector: 'ob-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent implements OnInit {
  public btnList: any[] = [];
  public usersList: any[] = [];
  public user: IUser;
  public currentContract: ICurrentContract;
  public phoneAuthorized: boolean = true;
  public allSigners: ISigner[] = [];
  public allSignersHelper: ISigner[] = [];
  public currentPageSigners: ISigner[] = [];
  public accauntType: string = 'all';
  public searchWord: string = '';
  public totalElements: number;
  public currentPage: number = 1;
  public maxSize = 7;
  public lastPage: number;
  public chiefSigners: ISigner[] = [];
  public accountantSigners: ISigner[] = [];
  public isProduction: boolean = environment.production;

  constructor(
    private loginService: LoginService,
    private documentService: DocumentService,
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

  //Получаем начальные данные
  getData() {
    //Получаем подписантов со статусом Chief
    this.documentService.chiefSigners$.subscribe(dataChief => {
      this.chiefSigners = [];
      dataChief.map(signer => {
        this.chiefSigners.push(new ISigner(signer.id, signer.name, 'chief'));
      });
      this.documentService.signersChief$.next(this.chiefSigners);
      this.setAllSigners();
      this.changeDetector.reattach();
      this.changeDetector.detectChanges();
    });
    //Получаем подписантов со статусом Accountant
    this.documentService.accountantSigners$.subscribe(dataAccountant => {
      this.accountantSigners = [];
      dataAccountant.map(signer => {
        this.accountantSigners.push(
          new ISigner(signer.id, signer.name, 'accauntant')
        );
      });
      this.documentService.signersAccountant$.next(this.accountantSigners);
      this.setAllSigners();
      this.changeDetector.reattach();
      this.changeDetector.detectChanges();
    });
  }

  setAllSigners(): void {
    this.allSigners = [...this.chiefSigners, ...this.accountantSigners];
    this.documentService.allSigners$.next(this.allSigners);
    this.totalElements = this.allSigners.length;
    this.lastPage = Math.ceil(this.totalElements / this.maxSize);
    this.allSignersHelper = this.allSigners;
    this.currentPageSigners = this.allSigners.slice(0, 10);
    this.changeDetector.detectChanges();
  }

  getSigners(pageNum: number) {
    this.documentService.allSigners$.subscribe(data => {
      this.allSigners = data;
      this.allSignersHelper = data;
      this.totalElements = this.allSigners.length;
      this.lastPage = Math.ceil(this.totalElements / this.maxSize);
      this.currentPageSigners = this.allSigners.slice(
        pageNum * 10,
        pageNum * 10 + 10
      );
      if (this.searchWord !== '') {
        this.findUser(pageNum);
      }
      this.changeDetector.detectChanges();
    });
  }

  onAccauntTypeChange($event: any) {
    switch (this.accauntType) {
      case 'all': {
        this.currentPage = 0;
        this.getSigners(this.currentPage);
        break;
      }
      case 'chief': {
        this.currentPage = 0;
        this.getTypedSigners('chief', this.currentPage);
        break;
      }
      case 'accauntant': {
        this.currentPage = 0;
        this.getTypedSigners('accauntant', this.currentPage);
        break;
      }
      default: {
        break;
      }
    }
  }

  findUser(pageNum: number) {
    this.allSigners = this.allSignersHelper;
    let searchedList: ISigner[] = [];
    for (let i: number = 0; i < this.allSigners.length; i++) {
      if (
        this.allSigners[i].name
          .toLowerCase()
          .includes(this.searchWord.toLowerCase())
      ) {
        searchedList.push(this.allSigners[i]);
      }
    }
    this.allSigners = searchedList;
    this.totalElements = this.allSigners.length;
    this.lastPage = Math.ceil(this.totalElements / this.maxSize);
    this.currentPageSigners = this.allSigners.slice(
      pageNum * 10,
      pageNum * 10 + 10
    );
  }

  changePage(page: any) {
    this.currentPage = page.page;
    if (page.page === this.currentPage) {
      this.getSigners(this.currentPage - 1);
    }
  }

  getTypedSigners(type: string, pageNum: number) {
    if (type === 'chief') {
      this.documentService.signersChief$.subscribe(signersChief => {
        this.allSigners = signersChief;
        this.allSignersHelper = signersChief;
      });
    } else if (type === 'accauntant') {
      this.documentService.signersAccountant$.subscribe(signersAccountant => {
        this.allSigners = signersAccountant;
        this.allSignersHelper = signersAccountant;
      });
    }
    this.currentPageSigners = this.allSigners.slice(
      pageNum * 10,
      pageNum * 10 + 10
    );
    this.findUser(pageNum);
    this.changeDetector.detectChanges();
  }

  emptySearch() {
    this.searchWord = '';
    this.findUser(0);
  }
}
