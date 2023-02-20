import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from "./pages/home/home.component";
import {GameListComponent} from "./pages/game-list/game-list.component";
import {BasketComponent} from "./pages/basket/basket.component";
import {MyGamesComponent} from "./pages/my-games/my-games.component";

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'games', component: GameListComponent},
  {path: 'cart', component: BasketComponent},
  {path: 'my_games', component: MyGamesComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PortalRoutingModule {
}
