import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OperationsComponent } from './page/operations-main/operations.component';
import { OperationComponent } from './page/operation/operation.component';
import { ConfirmationComponent } from './components/confirmation/confirmation.component';
import { PaymentConfirmationComponent } from './components/payment-confirmation/payment-confirmation.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: OperationsComponent },
      { path: ':operationType/:type', component: OperationComponent },
      {
        path: ':operationType/:type',
        children: [
          { path: 'confirm', component: ConfirmationComponent },
          { path: 'sign-confirm', component: PaymentConfirmationComponent },
        ],
      },
      { path: ':operationType/:type/:id', component: OperationComponent },
      { path: ':operationType/:type/:iban', component: OperationComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OperationsRoutingModule {}
