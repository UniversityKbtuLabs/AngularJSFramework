import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountSavingsComponent } from '@modules/account-savings/account-savings.component';

const routes: Routes = [
  {
    path: '',
    children: [{ path: ':id', component: AccountSavingsComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountSavingsRoutingModule {}
