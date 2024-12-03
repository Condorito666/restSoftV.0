import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { CartService } from 'src/app/services/cart.service';
import { CartItem } from 'src/app/models/cart-item.model';
import { Sale } from 'src/app/models/sale.model';
import { doc, runTransaction } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-cart-modal',
  templateUrl: './cart-modal.page.html',
  styleUrls: ['./cart-modal.page.scss'],
})
export class CartModalPage implements OnInit {
  cart: CartItem[] = [];
  cartSum: number = 0;
  tip: number = 0;

  constructor(
    private cartService: CartService,
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private firestore: Firestore
  ) {}

  ngOnInit() {
    this.cartService.cartItems$.subscribe((cart) => {
      this.cart = cart;
      this.cartSum = this.cartService.getCartTotal();
      this.calculateTip();
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  increaseQuantity(cartItem: CartItem) {
    this.cartService.increaseQuantity(cartItem.product);
    this.calculateTip();
  }

  decreaseQuantity(cartItem: CartItem) {
    this.cartService.decreaseQuantity(cartItem.product);
    this.calculateTip();
  }

  calculateTip() {
    this.tip = this.cartSum * 0.1; // Calculate tip as 10% of the total
  }

  async promptForTip() {
    const totalWithTip = this.cartSum + this.tip;
    const alert = await this.alertController.create({
      header: 'Leave a Tip?',
      message: `Total without tip: ${this.cartSum.toFixed(
        2
      )} CLP<br>Total with 10% tip: ${totalWithTip.toFixed(2)} CLP`,
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            this.tip = 0;
            this.goToCheckout();
          },
        },
        {
          text: 'Yes',
          handler: () => {
            this.calculateTip();
            this.goToCheckout();
          },
        },
      ],
    });

    await alert.present();
  }

  async goToCheckout() {
    const sale: Sale = {
      items: this.cart,
      total: this.cartSum + this.tip,
      date: new Date(),
      tip: this.tip,
    };

    try {
      const saleId = await this.cartService.storeSale(sale);
      console.log('Sale stored with ID:', saleId);

      // Update the stock of each product
      for (const cartItem of this.cart) {
        await this.updateProductStock(cartItem.product.id, cartItem.quantity);
      }

      // Navigate to the checkout page or show a success message
      this.dismiss();
    } catch (error) {
      console.error('Error storing sale:', error);
      // Handle the error, e.g., show an error message
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
        const productData = productDoc.data();
        const currentStock = productData?.['stock'] ?? 0; // Use default value of 0 if stock is undefined
        const newStock = currentStock - quantity;
        if (newStock < 0) {
          throw new Error('Insufficient stock!');
        }
        transaction.update(productRef, { stock: newStock });
      });
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw error;
    }
  }

  feeInfo(event: Event) {
    // Display information about the fees
    console.log('Displaying fee information...');
  }
}
