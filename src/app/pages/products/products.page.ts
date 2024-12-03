// src/app/pages/products/products.page.ts
import { Component, OnInit } from '@angular/core';
import { InventoryService } from 'src/app/services/inventory.service';
import { Product } from 'src/app/models/product.model';
import { CartService } from 'src/app/services/cart.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})
export class ProductsPage implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: any[] = [];

  constructor(
    private inventoryService: InventoryService,
    private cartService: CartService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.inventoryService.getInventory().subscribe((products) => {
      this.products = products;
      this.filteredProducts = products;
    });

    this.inventoryService.getCategories().subscribe((categories) => {
      this.categories = categories;
    });
  }

  filterProducts(categorySlug: string) {
    if (categorySlug === 'all') {
      this.filteredProducts = this.products;
    } else {
      this.inventoryService
        .filterProductsByCategory(categorySlug)
        .subscribe((filteredProducts) => {
          this.filteredProducts = filteredProducts;
        });
    }
  }

  addProductToCart(product) {
    this.cartService.addProduct(product);
  }

  async editProduct(product: Product) {
    const alert = await this.alertController.create({
      header: 'Edit Product',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Name',
          value: product.name,
        },
        {
          name: 'description',
          type: 'text',
          placeholder: 'Description',
          value: product.description,
        },
        {
          name: 'price',
          type: 'number',
          placeholder: 'Price',
          value: product.price,
        },
        {
          name: 'stock',
          type: 'number',
          placeholder: 'Stock',
          value: product.stock,
        },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: (data) => {
            product.name = data.name;
            product.description = data.description;
            product.price = data.price;
            product.stock = data.stock;
            this.inventoryService.updateProduct(product).catch((error) => {
              console.error('Error Ingresando Producto:', error);
            });
          },
        },
      ],
    });

    await alert.present();
  }

  async deleteProduct(product: Product) {
    const alert = await this.alertController.create({
      header: 'Confirmación de Borrado',
      message: `Este Producto: ${product.name} será borrado permanentemente`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Borrar',
          handler: () => {
            this.inventoryService.deleteProduct(product).catch((error) => {
              console.error('Error borrando Producto:', error);
            });
          },
        },
      ],
    });

    await alert.present();
  }
}
