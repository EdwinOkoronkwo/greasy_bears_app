export class ItemCategory {
  constructor(
    public id: number,
    public uuid: string,
    public name: string,
    public restaurantId: number,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}
}
