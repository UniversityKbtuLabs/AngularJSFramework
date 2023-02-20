import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {SubscriptionAccumulator} from "../../core/helpers/SubscriptionAccumulator";
import {GameService} from "../../core/services/game.service";

@Component({
  selector: 'app-game-dialog',
  templateUrl: './game-dialog.component.html',
  styleUrls: ['./game-dialog.component.scss']
})
export class GameDialogComponent extends SubscriptionAccumulator implements OnInit {
  dialogGame: any = {}

  constructor(private matDialogRef: MatDialogRef<GameDialogComponent>, private gameService: GameService) {
    super();
  }

  closeDialog() {
    this.matDialogRef.close();
  }

  ngOnInit(): void {
    this.addSubscriber(
      this.gameService.dialogGame$.subscribe(value => {
        this.dialogGame = value
      })
    )
  }
}
