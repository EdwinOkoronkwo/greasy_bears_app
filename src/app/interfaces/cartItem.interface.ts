export interface CartItem {
  id: number;
  uuid: string;
  cartId: number;
  itemId: string;
  item: {
    name: string;
    price: number;
  };
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}
