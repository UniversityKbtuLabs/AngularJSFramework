import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {LoginModalComponent} from "../dialogs/login-modal/login-modal.component";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(private router: Router, private matDialog: MatDialog) {
  }

  ngOnInit(): void {
  }

  goToPage(page: string) {
    this.router.navigate([page])
  }

  openLoginModal() {
    this.matDialog.open(LoginModalComponent, {width: '500px', height: '450px'});
  }
}
