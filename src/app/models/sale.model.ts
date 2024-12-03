// src/app/models/sale.model.ts
import { CartItem } from './cart-item.model';

export interface Sale {
  id?: string;
  items: CartItem[];
  total: number;
  date: Date;
  tip: number;
 
}