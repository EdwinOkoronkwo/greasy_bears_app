import { OrderItem } from '../interfaces/orderItem.interface';
import { Address } from './address.model';
import { Item } from './item.model';
import { Restaurant } from './restaurant.model';

export interface Order {
  id: number;
  uuid: string;
  userId: number;
  restaurantId: number;
  Restaurant: Restaurant;
  Items: Item;
  OrderItem: OrderItem;
  address: string;
  total: number;
  grandTotal: number;
  deliveryCharge: number;
  status: string;
  orders: string;
  paymentStatus: string;
  paymentMode: string;
  instruction?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
