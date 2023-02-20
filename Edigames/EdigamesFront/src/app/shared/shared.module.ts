import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { GameDialogComponent } from './game-dialog/game-dialog.component';



@NgModule({
    declarations: [
        HeaderComponent,
        FooterComponent,
        GameDialogComponent
    ],
  exports: [
    HeaderComponent,
    FooterComponent
  ],
    imports: [
        CommonModule
    ]
})
export class SharedModule { }
