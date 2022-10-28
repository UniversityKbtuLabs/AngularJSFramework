import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { InstructionService } from '@core/services/instruction.service';

@Component({
  selector: 'ob-instruction-step',
  templateUrl: './instruction-step.component.html',
  styleUrls: ['./instruction-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstructionStepComponent {
  @Input() public title: string = '';
  @Input() public desc: string = '';
  @Input() public pos: string = '';
  @Input() public step: string = '';
  @Output() public skip = new EventEmitter<boolean>();
  @Output() public next = new EventEmitter<boolean>();
  @Output() public arrow_top: boolean = false;
  currentStep: any;
  constructor(
    private instructionService: InstructionService,
    private changeDetector: ChangeDetectorRef
  ) {
    this.currentStep = instructionService.stepper;
  }

  nextStep() {
    this.instructionService.setWelcomeStepId(++this.currentStep);
    this.next.emit(true);
  }
  skipAll() {
    this.instructionService.setWelcomeStepId(-1);
    this.skip.emit(true);
  }
}
