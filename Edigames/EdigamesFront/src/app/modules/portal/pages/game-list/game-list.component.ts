import {Component} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {GameDialogComponent} from "../../../../shared/game-dialog/game-dialog.component";

@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss']
})
export class GameListComponent {
  constructor(private matDialog: MatDialog) {
  }

  openGameDialog() {
    this.matDialog.open(GameDialogComponent, {width: '800px', height: ''});
  }
}
