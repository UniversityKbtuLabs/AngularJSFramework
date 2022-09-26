import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  ViewEncapsulation,
  Input,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  OnChanges,
  DoCheck,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SubscriptionAccumulator } from '@core/helpers/SubscriptionAccumulator';
import { DropdownService } from '@core/services/dropdown.service';
import { InstructionService } from '@core/services/instruction.service';
import { LoginService } from '@core/services/login.service';

@Component({
  selector: 'ob-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent extends SubscriptionAccumulator {
  @Input() login: boolean = false;
  @Input() title: string = '';
  @Output() OpenMenu = new EventEmitter<boolean>();
  value: string = 'Рус';
  @ViewChild('ngSelect') ngselect!: NgSelectComponent;
  bin: string = '2504412448 432423';
  langs = [{ item: 'Каз' }, { item: 'Рус' }, { item: 'Анг' }];
  modalRef: BsModalRef | undefined;
  step: any;
  notification: number = 3;
  username: string = 'Алмас';
  usernameLetter: string = 'A';
  user: string = '';
  userBin: string = '';
  showProfiles: boolean = false;
  contracts: any = [];

  constructor(
    private changeDetector: ChangeDetectorRef,
    private instructionService: InstructionService,
    private loginService: LoginService,
    private dropdownService: DropdownService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    super();

    this.getServiceValues();
  }

  getServiceValues() {
    this.step = this.instructionService.welcome_step_id.subscribe(value => {
      this.step = value;
      this.changeDetector.detectChanges();
      if (this.step == 10) {
        //
      }
    });

    this.addSubscriber(
      this.loginService.currentContracts.subscribe((data: any) => {
        this.contracts = data;
      })
    );

    this.addSubscriber(
      this.loginService.selectedUser.subscribe((value: any) => {
        this.username = value;
        this.usernameLetter = value.substr(0, 1);
      })
    );

    this.addSubscriber(
      this.loginService.selectedContract.subscribe(val => {
        this.dropdownService.setDropdownValue(val);
      })
    );

    this.addSubscriber(this.step);
  }

  getContracts(event: boolean) {
    if (event) {
      this.contracts = this.contracts;
    }
  }

  setContract(item: any): void {
    this.addSubscriber(
      this.loginService.setContractNum(item).subscribe((data: any) => {
        this.user = data.currentContract.name;
        this.username = data.user.name;
        this.dropdownService.setDropdownValue(data.currentContract.name);
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigate([this.router.url]);
      })
    );
  }

  getId() {
    this.step = this.instructionService.welcome_step_id.subscribe(value => {
      this.step = value;
    });
  }

  openDropdown(): void {
    this.ngselect.open();
  }

  openTabMenu() {
    this.OpenMenu.emit(true);
  }
}
