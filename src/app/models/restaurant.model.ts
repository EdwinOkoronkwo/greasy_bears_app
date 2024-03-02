export class Restaurant {
  constructor(
    public id: number,
    public cover: string,
    public name: string,
    public cuisines: string[],
    public rating: number,
    public deliveryTime: number,
    public price: number,
    public closeTime?: string,
    public restaurantAddress?: string,
    public distance?: number,
    public email?: string,
    public phone?: string,
    public isClose?: boolean,
    public openTime?: string,
    public location?: any,
    public latitude?: any,
    public longitude?: any,
    public status?: string,
    public postalCode?: string,
    public description?: string,
    public cityId?: number,
    public userId?: number,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}
}
