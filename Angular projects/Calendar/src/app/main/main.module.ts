import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingModule } from './main-routing.module';
import { MainCMComponent } from './main-cm/main-cm.component';
import { TableComponent } from './table/table.component';
import {DragDropModule} from "@angular/cdk/drag-drop";


@NgModule({
  declarations: [
    MainCMComponent,
    TableComponent
  ],
  imports: [
    CommonModule,
    MainRoutingModule,
    DragDropModule
  ]
})
export class MainModule { }
