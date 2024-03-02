export class Address {
  constructor(
    public id: number,
    public uuid: string,
    public title: string,
    public address: string,
    public houseNumber: string,
    public landmark: string,
    public lat: number,
    public lng: number,
    public userId?: number,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}
}
