import { Address } from '../models/address.model';
import { Item } from '../models/item.model';
import { Restaurant } from '../models/restaurant.model';

export interface Cart {
  id: number;
  uuid: string;
  userId: number;
  totalItem?: number;
  totalPrice?: number;
  grandTotal?: number;
  deliveryCharge?: number;
}
