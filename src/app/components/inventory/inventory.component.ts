import { Component, OnInit } from '@angular/core';
import { InventoryService } from 'src/app/services/inventory.service';
import { Product } from 'src/app/models/product.model';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
})
export class InventoryComponent implements OnInit {
  products: Product[] = [];
  newProduct: Product = {
    name: '',
    price: 0,
    stock: 0,
    description: '',
    category: 0,
    imageUrl: '',
  };
  categories: any[] = [];
  constructor(private inventoryService: InventoryService) {}

  ngOnInit() {
    this.inventoryService.getInventory().subscribe((products) => {
      this.products = products;
      console.log(this.products);
    });

    this.inventoryService.getCategories().subscribe((categories) => {
      this.categories = categories;
      console.log(this.categories);
    });
  }
  async takePicture() {
    const imageUrl = await this.inventoryService.takePicture();
    if (imageUrl) {
      this.newProduct.imageUrl = imageUrl;
    }
  }

  async addProduct() {
    this.inventoryService.addProduct(this.newProduct);
    this.newProduct = {
      name: '',
      price: 0,
      stock: 0,
      description: '',
      imageUrl: '',
      category: 0,
    };
  }

  async deleteProduct(product: Product) {
    await this.inventoryService.deleteProduct(product);
  }

  async updateProduct(product: Product) {
    await this.inventoryService.updateProduct(product);
  }

  async getInventory() {
    await this.inventoryService.getInventory().subscribe((products) => {
      this.products = products;
    });
  }
}
