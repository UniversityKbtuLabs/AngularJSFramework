import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService as AuthGuard } from '@core/guards/auth-guard.service';
import { LoginComponent } from '@modules/users/page/login.component';
import { MainComponent } from './main.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'main',
    component: MainComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'home',
        loadChildren: () =>
          import('../../modules/home/home.module').then(m => m.HomeModule),
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
        path: 'operations',
        loadChildren: () =>
          import('../../modules/operations/operations.module').then(
            m => m.OperationsModule
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
export class MainRoutingModule {}
