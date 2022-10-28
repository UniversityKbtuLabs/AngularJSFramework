import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import { SharedModule } from '@app/shared';
import { UsersComponent } from './components/users/users.component';
import { TarifsComponent } from './components/tarifs/tarifs.component';
import { EmployeesComponent } from './components/employees/employees.component';
import { ContragentsComponent } from './components/contragents/contragents.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { MatButtonModule } from '@angular/material/button';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { CompanyComponent } from './components/company/company.component';
import { TranslateModule } from '@ngx-translate/core';
import { AllTariffsComponent } from './components/all-tariffs/all-tariffs.component';
import { ConnectTariffComponent } from './components/connect-tariff/connect-tariff.component';
import { OperationsModule } from '../operations';

@NgModule({
  declarations: [
    SettingsComponent,
    UsersComponent,
    TarifsComponent,
    EmployeesComponent,
    ContragentsComponent,
    NotificationsComponent,
    CompanyComponent,
    AllTariffsComponent,
    ConnectTariffComponent,
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    SharedModule,
    MatButtonModule,
    NgSelectModule,
    FormsModule,
    PaginationModule,
    TranslateModule,
    ReactiveFormsModule,
    OperationsModule,
  ],
})
export class SettingsModule {}
