import { CartItem } from '../interfaces/cartItem.interface';
import { Restaurant } from './restaurant.model';

export class Item {
  constructor(
    public id: string,
    public uuid: string,
    public itemCategoryId: number,
    public restaurantId: number,
    public Restaurant: Restaurant,
    public CartItem: CartItem,
    public cover: string,
    public name: string,
    public description: string,
    public price: number,
    public status: boolean,
    public isVeg: boolean,
    public createdAt: Date,
    public updatedAt: Date,
    public quantity?: number
  ) {}
}
