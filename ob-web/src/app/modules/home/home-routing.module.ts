import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { HomeSearchComponent } from './page/home-search/home-search.component';
import { HomeWelcomeComponent } from './page/home-welcome/home-welcome.component';
import { HomeOperationsComponent } from './page/home-operations/home-operations.component';
import { SuccessComponent } from './components/success/success.component';
import { HomeAccountsComponent } from './page/home-accounts/home-accounts.component';
import { AccountsComponent } from '../accounts/accounts.component';

const itemRoutes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: HomeWelcomeComponent },
      {
        path: 'operation-details/:type/:id/:status',
        component: HomeWelcomeComponent,
      },
    ],
  },
  { path: 'search', component: HomeSearchComponent },
  {
    path: 'operations',
    children: [
      { path: '', component: HomeOperationsComponent },
      { path: 'success', component: SuccessComponent },
    ],
  },
  //{ path: 'accounts', component: AccountsComponent }
];

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: itemRoutes,
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
