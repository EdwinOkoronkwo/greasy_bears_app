export interface City {
  id: number;
  uuid: string;
  name: string;
  lat: number;
  lng: number;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}
