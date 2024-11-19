import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from './header/header.component';
import { RouterModule } from '@angular/router';
import { InventoryComponent } from './inventory/inventory.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [HeaderComponent, InventoryComponent],
  imports: [CommonModule, IonicModule, RouterModule, FormsModule],
  exports: [HeaderComponent, InventoryComponent],
})
export class SharedComponentsModule {}
