import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeAccountsComponent } from '../home/page/home-accounts/home-accounts.component';

const routes: Routes = [
  {
    path: '',
    component: HomeAccountsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountsRoutingModule {}
