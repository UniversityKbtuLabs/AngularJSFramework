import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { InstructionService } from '@core/services/instruction.service';
import { LoginService } from '@core/services/login.service';
import { MainService } from '@core/services/main.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ob-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class MainComponent implements OnInit, OnDestroy {
  public showSubBank: boolean = false;
  public activeTitle: string = 'Главная';
  public isSideMenu: boolean = false;
  public step: any;
  public subscriptions: Subscription[] = [];
  constructor(
    public mainService: MainService,
    private instructionService: InstructionService,
    private changeDetector: ChangeDetectorRef,
    private loginService: LoginService
  ) {
    this.step = this.instructionService.welcome_step_id.subscribe(value => {
      this.step = value;
      this.changeDetector.detectChanges();
    });
  }

  ngOnInit() {
    this.subscriptions.push(
      this.loginService.getContracts().subscribe(val => {
        this.loginService.contracts.next(val);
      })
    );
    this.subscriptions.push(
      this.loginService.getUserInfo().subscribe((value: any) => {
        this.loginService.defaultContract.next(value.currentContract.name);
        this.loginService.defaultUser.next(value.user.name);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  assignTitle(title: string) {
    this.activeTitle = title;
  }

  onMenuClick(event: boolean) {
    this.isSideMenu = event;
  }

  closeMenu() {
    this.isSideMenu = false;
  }
}
