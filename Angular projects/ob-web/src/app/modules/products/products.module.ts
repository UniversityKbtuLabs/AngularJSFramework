import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsRoutingModule } from './products-routing.module';
import { CreateAccountComponent } from './components/create-account/create-account.component';
import { CreateProductComponent } from './page/create-product/create-product.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@app/shared';
import { NgxMaskModule } from 'ngx-mask';
import { CreateDepositComponent } from './components/create-deposit/create-deposit.component';
import { ProductsMainComponent } from './page/products-main/products-main.component';
import { ProductStatementsComponent } from './components/product-statements/product-statements.component';
import { AccountHistoryModule } from '../account-history/account-history.module';
import { AllProductsComponent } from './components/all-products/all-products.component';
import { CreateBusinessCardComponent } from './components/create-business-card/create-business-card.component';
import { ProductConfirmationComponent } from './components/product-confirmation/product-confirmation.component';

@NgModule({
  declarations: [
    CreateAccountComponent,
    CreateProductComponent,
    CreateDepositComponent,
    ProductsMainComponent,
    ProductStatementsComponent,
    AllProductsComponent,
    CreateBusinessCardComponent,
    ProductConfirmationComponent,
  ],
  imports: [
    CommonModule,
    ProductsRoutingModule,
    TranslateModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgxMaskModule.forChild(),
    AccountHistoryModule,
  ],
})
export class ProductsModule {}
