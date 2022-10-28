import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss']
})
export class LoginModalComponent implements OnInit {
  user = {username: '', password: '', remember: false};

  constructor(private matDialogRef: MatDialogRef<LoginModalComponent>) {
  }

  ngOnInit(): void {
  }

  onSubmit() {
    console.log('User: ', this.user);
    this.matDialogRef.close();
  }
}
