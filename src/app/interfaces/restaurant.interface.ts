export interface Restaurant {
  id: number;
  cityId: number;
  userId: number;
  cover: string;
  name: string;
  cuisines: string[];
  rating: number;
  deliveryTime: number;
  price: number;
  closeTime?: string;
  address?: string;
  distance?: number;
  email?: string;
  phone?: string;
  isClose?: boolean;
  openTime?: string;
  location?: any;
  latitude?: any;
  longitude?: any;
  status?: string;
  totalRating?: number;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  city: {
    id: number;
    uuid: string;
    name: string;
  };
}
