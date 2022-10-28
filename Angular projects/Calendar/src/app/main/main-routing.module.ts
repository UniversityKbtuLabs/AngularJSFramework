import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MainCMComponent} from "./main-cm/main-cm.component";

const routes: Routes = [
  {
    path: '',
    component: MainCMComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule {
}
