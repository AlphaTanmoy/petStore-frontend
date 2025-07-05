import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopupComponent } from '../page-components/pop-up/pop-up.component';
import { PopupService } from '../services/popup.service';

@NgModule({
  declarations: [
    PopupComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    PopupComponent
  ],
  providers: [
    PopupService
  ]
})
export class PopupModule { }
