import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import productData from '../../../assets/menu.json';
import categoryData from '../../../assets/categories.json';
import { CartService } from 'src/app/services/cart.service';
import { ModalController } from '@ionic/angular';
import { FilterModalPage } from '../filter-modal/filter-modal.page';
import { Product } from 'src/app/models/product.model';
import { InventoryService } from 'src/app/services/inventory.service';
import { category } from 'src/app/models/category.model';
import { filter } from 'rxjs';
@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})
export class ProductsPage implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: category[] = [];

  constructor(
    private route: ActivatedRoute,
    private cartService: CartService,
    private modalCtrl: ModalController,
    private inventoryService: InventoryService
  ) {
    this.inventoryService.getInventory().subscribe((products) => {
      this.products = products;
    });
  }

  ngOnInit() {
    this.inventoryService.getInventory().subscribe((products) => {
      this.products = products;
      this.filteredProducts = products;
    });

    this.inventoryService.getCategories().subscribe((categories) => {
      this.categories = categories;
    });
  }

  async openFilter() {
    const modal = await this.modalCtrl.create({
      component: FilterModalPage,
      breakpoints: [0, 0.5],
      initialBreakpoint: 0.5,
      handle: false,
      componentProps: {
        categories: this.categories,
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      this.filterProducts(data.category?.slug);
    }
  }

  filterProducts(categorySlug: string) {
    this.inventoryService
      .filterProducts(categorySlug)
      .subscribe((filteredProducts) => {
        this.filteredProducts = filteredProducts;
      });
  }
  addProductToCart(product) {
    this.cartService.addProduct(product);
  }
}
