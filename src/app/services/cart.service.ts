import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, runTransaction } from '@angular/fire/firestore';
import { BehaviorSubject, map } from 'rxjs';
import { Product } from '../models/product.model';
import { CartItem } from '../models/cart-item.model';
import { Sale } from '../models/sale.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cart: { [productId: string]: CartItem } = {};
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItems.asObservable();

  constructor(private firestore: Firestore) {}

  addProduct(product: Product) {
    if (!this.cart[product.id]) {
      this.cart[product.id] = {
        product,
        quantity: 1,
      };
    } else {
      this.cart[product.id].quantity += 1;
    }
    this.updateCartItems();
  }

  removeProduct(product: Product) {
    delete this.cart[product.id];
    this.updateCartItems();
  }

  increaseQuantity(product: Product) {
    if (this.cart[product.id]) {
      this.cart[product.id].quantity += 1;
      this.updateCartItems();
    }
  }

  decreaseQuantity(product: Product) {
    if (this.cart[product.id]) {
      if (this.cart[product.id].quantity > 1) {
        this.cart[product.id].quantity -= 1;
      } else {
        this.removeProduct(product);
      }
      this.updateCartItems();
    }
  }

  getCartItems() {
    return this.cartItems.value;
  }

  getCartTotal() {
    return this.cartItems.value.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }

  private updateCartItems() {
    this.cartItems.next(Object.values(this.cart));
  }

  getCartCount() {
    return this.cartItems$.pipe(map((items) => items.length));
  }

  async storeSale(sale: Sale) {
    try {
      const salesCollection = collection(this.firestore, 'sales');
      const saleRef = await addDoc(salesCollection, sale);
      return saleRef.id;
    } catch (error) {
      console.error('Error storing sale:', error);
      throw error;
    }
  }

  async updateProductStock(productId: string, quantity: number) {
    try {
      const productRef = doc(this.firestore, `products/${productId}`);
      await runTransaction(this.firestore, async (transaction) => {
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists) {
          throw new Error('Product does not exist!');
        }
        const newStock = productDoc.data()['stock'] - quantity;
        transaction.update(productRef, { stock: newStock });
      });
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw error;
    }
  }
}
