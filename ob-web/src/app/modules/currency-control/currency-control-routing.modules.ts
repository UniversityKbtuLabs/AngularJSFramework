import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CurrencyControlComponent } from './currency-control.component';
import { ConvertationComponent } from '@modules/currency-control/pages/convertation/convertation.component';
import { ContractCreationComponent } from './pages/contract-creation/contract-creation.component';
import { ConfirmationComponent as CurrencyConfirmationComponent } from './components/confirmation/confirmation.component';
import { FXPageComponent } from '@modules/currency-control/pages/fx-page/fx-page.component';
import { ConfirmationComponent, OperationComponent } from '@modules/operations';
import { CurrencyTransferComponent } from './components/currency-transfer/currency-transfer.component';
import { PaymentConfirmationComponent } from '../operations/components/payment-confirmation/payment-confirmation.component';

const routes: Routes = [
  { path: '', component: CurrencyControlComponent },
  { path: 'convertation', component: ConvertationComponent },
  { path: 'convertation/:id', component: ConvertationComponent },
  { path: 'contract-creation', component: ContractCreationComponent },
  { path: 'confirmation', component: CurrencyConfirmationComponent },
  { path: 'halykfx', component: FXPageComponent },
  { path: 'currency-transfer', component: CurrencyTransferComponent },
  {
    path: 'payment/:type',
    children: [
      { path: 'confirm', component: ConfirmationComponent },
      { path: 'sign-confirm', component: PaymentConfirmationComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CurrencyControlRoutingModule {}
