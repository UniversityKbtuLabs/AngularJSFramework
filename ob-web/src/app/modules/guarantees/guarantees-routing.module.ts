import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GuaranteeComponent } from '@modules/guarantees/page/guarantee/guarantee.component';
import { GuaranteesMainComponent } from '@modules/guarantees/page/guarantees-main/guarantees-main.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: GuaranteesMainComponent },
      { path: ':status', component: GuaranteeComponent },
      { path: ':status/:id', component: GuaranteeComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GuaranteesRoutingModule {}
