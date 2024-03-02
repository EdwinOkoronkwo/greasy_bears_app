export interface OrderItem {
  id: number;
  uuid: string;
  orderId: number;
  itemId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}
