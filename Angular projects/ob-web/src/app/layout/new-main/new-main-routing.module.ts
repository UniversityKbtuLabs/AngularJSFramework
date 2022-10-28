import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from '@modules/users/page/login.component';
import { NewMainComponent } from './new-main.component';
import { AuthGuardService as AuthGuard } from '@core/guards/auth-guard.service';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '',
    component: NewMainComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'home',
        loadChildren: () =>
          import('../../modules/home/home.module').then(m => m.HomeModule),
        data: { preload: true },
      },
      {
        path: 'accounts',
        loadChildren: () =>
          import('../../modules/accounts/accounts.module').then(
            m => m.AccountsModule
          ),
        data: { preload: true },
      },
      {
        path: 'card',
        loadChildren: () =>
          import('../../modules/account/account.module').then(
            m => m.AccountModule
          ),
        data: { preload: true },
      },
      {
        path: 'account',
        loadChildren: () =>
          import('../../modules/account/account.module').then(
            m => m.AccountModule
          ),
        data: { preload: true },
      },
      {
        path: 'deposit',
        loadChildren: () =>
          import('../../modules/account-savings/account-savings.module').then(
            m => m.AccountSavingsModule
          ),
        data: { preload: true },
      },
      {
        path: 'credit',
        loadChildren: () =>
          import('../../modules/account-savings/account-savings.module').then(
            m => m.AccountSavingsModule
          ),
        data: { preload: true },
      },
      {
        path: 'card-account',
        loadChildren: () =>
          import('../../modules/account/account.module').then(
            m => m.AccountModule
          ),
        data: { preload: true },
      },
      {
        path: 'operations',
        loadChildren: () =>
          import('../../modules/operations/operations.module').then(
            m => m.OperationsModule
          ),
        data: { preload: true },
      },
      {
        path: 'guarantees',
        loadChildren: () =>
          import('../../modules/guarantees/guarantees.module').then(
            m => m.GuaranteesModule
          ),
        data: { preload: true },
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('../../modules/settings/settings.module').then(
            m => m.SettingsModule
          ),
        data: { preload: true },
      },
      {
        path: 'products',
        loadChildren: () =>
          import('../../modules/products/products.module').then(
            m => m.ProductsModule
          ),
        data: { preload: true },
      },
      {
        path: 'currency-control',
        loadChildren: () =>
          import('../../modules/currency-control/currency-control.module').then(
            m => m.CurrencyControlModule
          ),
        data: { preload: true },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class NewRoutingModule {}
