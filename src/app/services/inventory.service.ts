import { Injectable } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { category } from '../models/category.model';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import {
  getDownloadURL,
  ref,
  Storage,
  uploadString,
} from '@angular/fire/storage';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  constructor(private firestore: Firestore, private storage: Storage) {}

  getInventory(): Observable<Product[]> {
    const inventoryRef = collection(this.firestore, 'inventory');
    return collectionData(inventoryRef, { idField: 'id' }) as Observable<
      Product[]
    >;
  }

  getProductById(id: string): Observable<Product> {
    const productDocRef = doc(this.firestore, `inventory/${id}`);
    return docData(productDocRef, { idField: 'id' }) as Observable<Product>;
  }

  addProduct(product: Product) {
    const inventoryRef = collection(this.firestore, 'inventory');
    return addDoc(inventoryRef, product);
  }

  updateProduct(product: Product) {
    const productDocRef = doc(this.firestore, `inventory/${product.id}`);
    return updateDoc(productDocRef, { ...product });
  }

  deleteProduct(product: Product) {
    const productDocRef = doc(this.firestore, `inventory/${product.id}`);
    return deleteDoc(productDocRef);
  }

  async takePicture(): Promise<string> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
      });
      if (image && image.dataUrl) {
        const imageName = `inventory/${Date.now()}.jpeg`;
        const imageRef = ref(this.storage, imageName);
        await uploadString(imageRef, image.dataUrl, 'data_url');
        const imageUrl = await getDownloadURL(imageRef);
        return imageUrl;
      }
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  getCategories(): Observable<category[]> {
    const categoriesRef = collection(this.firestore, 'categories');
    return collectionData(categoriesRef, { idField: 'id' }) as Observable<
      category[]
    >;
  }
  filterProductsByCategory(categorySlug: string): Observable<Product[]> {
    return new Observable((observer) => {
      this.getInventory().subscribe((products) => {
        if (!categorySlug) {
          observer.next(products);
        } else {
          this.getCategories().subscribe((categories) => {
            const category = categories.find((c) => c.slug === categorySlug);
            if (category) {
              const filteredProducts = products.filter(
                (p) => p.category === category.id
              );
              observer.next(filteredProducts);
            } else {
              observer.next([]);
            }
          });
        }
      });
    });
  }
}
