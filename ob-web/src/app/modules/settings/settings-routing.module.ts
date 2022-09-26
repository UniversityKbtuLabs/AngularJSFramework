import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from '@modules/settings/settings.component';
import { UsersComponent } from '@modules/settings/components/users/users.component';
import { TarifsComponent } from '@modules/settings/components/tarifs/tarifs.component';
import { EmployeesComponent } from '@modules/settings/components/employees/employees.component';
import { ContragentsComponent } from '@modules/settings/components/contragents/contragents.component';
import { NotificationsComponent } from '@modules/settings/components/notifications/notifications.component';
import { CompanyComponent } from '@modules/settings/components/company/company.component';
import { AllTariffsComponent } from './components/all-tariffs/all-tariffs.component';
import { ConnectTariffComponent } from './components/connect-tariff/connect-tariff.component';
import { ConfirmationComponent } from '../operations';

const routes: Routes = [
  { path: '', redirectTo: '' },
  {
    path: '',
    component: SettingsComponent,
    children: [
      { path: '', redirectTo: 'company' },
      { path: 'company', component: CompanyComponent },
      { path: 'users', component: UsersComponent },
      {
        path: 'tariffs',
        children: [
          { path: '', component: TarifsComponent },
          { path: 'all', component: AllTariffsComponent },
          { path: 'connect/:tariffName', component: ConnectTariffComponent },
          {
            path: 'connect/:tariffName/confirm',
            component: ConfirmationComponent,
          },
          {
            path: 'details/:tariffName/:tariffId',
            component: ConnectTariffComponent,
          },
        ],
      },
      { path: 'employees', component: EmployeesComponent },
      { path: 'contragents', component: ContragentsComponent },
      { path: 'notifications', component: NotificationsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {}
