import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostListener,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SubscriptionAccumulator } from '@core/helpers/SubscriptionAccumulator';
import { InstructionService } from '@core/services/instruction.service';
import { WelcomeModalComponent } from './components/welcome-modal/welcome-modal.component';
import { DocumentService } from '@app/core/services/document.service';
import { ICheifSigner } from '@app/data/models/document-type';

@Component({
  selector: 'ob-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent
  extends SubscriptionAccumulator
  implements OnDestroy
{
  public firstEntrance: boolean = false;
  private modalRef: BsModalRef | undefined;
  public startInst: boolean = false;

  constructor(
    private modalService: BsModalService,
    private changeDetector: ChangeDetectorRef,
    private instructionService: InstructionService,
    private translate: TranslateService
  ) {
    super();

    this.addSubscriber(
      this.instructionService.welcome_step_id.subscribe(value => {
        this.changeDetector.detectChanges();
        if (value == 10) {
          const initialState = {
            title: this.translate.instant(
              'home.welcome.welcome-modal.endTitle'
            ),
            info: this.translate.instant(
              'home.welcome.welcome-modal.endDetails'
            ),
            endFlag: true,
          };
          const modal = this.modalService.show(WelcomeModalComponent, {
            // ignoreBackdropClick: true,
            initialState,
            id: 1,
          });
        }
      })
    );
  }

  //restart home page instruction
  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key == 'i' || event.key == 'I') {
      this.instructionService.setWelcomeStepId(1);
    }
  }
  getStatus() {
    this.firstEntrance = true;

    if (this.firstEntrance) {
      const initialState = {
        title: this.translate.instant(
          'home.welcome.welcome-modal.intoductionTitle'
        ),
        info: this.translate.instant(
          'home.welcome.welcome-modal.intoductionDetails'
        ),
      };
      this.modalRef = this.modalService.show(WelcomeModalComponent, {
        //ignoreBackdropClick: true,
        initialState,
        id: 2,
      });
      this.addSubscriber(
        this.modalRef.content.onClose.subscribe((data: boolean) => {
          this.instructionService.setWelcomeStepId(1);
          this.startInst = data;
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.modalService.hide(1);
    this.modalService.hide(2);
  }
}
function ICheifSigner(data: any, ICheifSigner: any) {
  throw new Error('Function not implemented.');
}
