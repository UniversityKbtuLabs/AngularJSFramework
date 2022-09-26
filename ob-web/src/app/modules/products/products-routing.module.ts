import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfirmationComponent } from '../operations';
import { ProductConfirmationComponent } from './components/product-confirmation/product-confirmation.component';
import { CreateProductComponent } from './page/create-product/create-product.component';
import { ProductsMainComponent } from './page/products-main/products-main.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: ProductsMainComponent },
      { path: 'create/:productType', component: CreateProductComponent },
      {
        path: 'create/:productType',
        children: [
          { path: 'confirm', component: ConfirmationComponent },
          { path: 'sign-confirm', component: ProductConfirmationComponent },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductsRoutingModule {}
