import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {PortalRoutingModule} from './portal-routing.module';
import {HomeComponent} from './pages/home/home.component';
import {GameListComponent} from './pages/game-list/game-list.component';
import {BasketComponent} from './pages/basket/basket.component';
import {MatDialogModule} from "@angular/material/dialog";
import { MyGamesComponent } from './pages/my-games/my-games.component';


@NgModule({
  declarations: [
    HomeComponent,
    GameListComponent,
    BasketComponent,
    MyGamesComponent,
  ],
  imports: [
    CommonModule,
    PortalRoutingModule,
    MatDialogModule
  ]
})
export class PortalModule {
}
