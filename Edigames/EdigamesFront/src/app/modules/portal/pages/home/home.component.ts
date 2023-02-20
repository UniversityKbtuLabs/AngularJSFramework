import {Component, OnInit} from '@angular/core';
import {SubscriptionAccumulator} from "../../../../core/helpers/SubscriptionAccumulator";
import {GameService} from "../../../../core/services/game.service";
import {MatDialog} from "@angular/material/dialog";
import {GameDialogComponent} from "../../../../shared/game-dialog/game-dialog.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent extends SubscriptionAccumulator implements OnInit {
  games: any[] = []

  constructor(private gameService: GameService,
              private matDialog: MatDialog) {
    super();
  }

  ngOnInit(): void {
    this.addSubscriber(
      this.gameService.getGamesByYear(2022, 5, 1).subscribe(value => {
        this.games = value
      })
    )
  }

  openGameDialog(item: any) {
    this.gameService.dialogGame$.next(item)
    this.matDialog.open(GameDialogComponent, {width: '800px', height: ''});
  }

}
