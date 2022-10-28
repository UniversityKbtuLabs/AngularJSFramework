import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ob-mail-form',
  templateUrl: './mail-form.component.html',
  styleUrls: ['./mail-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MailFormComponent {
  public mailValue: string;

  constructor() {
    this.mailValue = '';
  }

  sendForm() {
    //
  }
}
