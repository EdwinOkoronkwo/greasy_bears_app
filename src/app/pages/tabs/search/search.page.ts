import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {
  IonContent,
  IonHeader,
  IonLabel,
  IonList,
  IonListHeader,
  IonSearchbar,
  IonToolbar,
} from '@ionic/angular/standalone';
import { EmptyScreenComponent } from 'src/app/components/empty-screen/empty-screen.component';
import { RestaurantComponent } from 'src/app/components/restaurant/restaurant.component';
import { RouterLink } from '@angular/router';
import { LoadingRestaurantComponent } from 'src/app/components/loading-restaurant/loading-restaurant.component';
import { Restaurant } from 'src/app/models/restaurant.model';
import { AddressService } from 'src/app/services/address/address.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { RestaurantService } from 'src/app/services/restaurant/restaurant.service';
import { Subscription, take } from 'rxjs';
import { addIcons } from 'ionicons';
import { addOutline, searchOutline, trophyOutline } from 'ionicons/icons';
import { serialize } from 'object-to-formdata';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    EmptyScreenComponent,
    RestaurantComponent,
    RouterLink,
    LoadingRestaurantComponent,
  ],
})
export class SearchPage implements OnInit {
  @ViewChild('searchInput') sInput: any;
  model: any = {
    icon: 'search-outline',
    title: 'No Restaurants Record Found',
  };
  isLoading!: boolean;
  query: any;
  location: any = {};
  allRestaurants!: any;
  restaurantsSub!: Subscription;
  restaurants$ = this.restaurantService.restaurants$;

  restaurants: any[] = [];

  constructor(
    private restaurantService: RestaurantService,
    private addressService: AddressService,
    private global: GlobalService
  ) {
    this.restaurantService.restaurants$.subscribe((result) => {
      this.allRestaurants = result;
    });
    addIcons({
      trophyOutline,
      addOutline,
      searchOutline,
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.sInput.setFocus();
    }, 500);
  }

  onSearchChange(event: any) {
    console.log(event.detail.value);
    this.query = event.detail.value;
    this.restaurants = [];
    console.log(this.query);
    if (this.query.length > 0) {
      this.isLoading = true;
      setTimeout(async () => {
        this.restaurants = this.allRestaurants.filter((element: any) => {
          return element.postalCode
            .toLowerCase()
            .startsWith(this.query.toLowerCase());
        });
        console.log(this.restaurants);
        this.isLoading = false;
      }, 3000);
    }
  }
}

////////////////////////////////////////////////////////////////////////////////////////////
//////////////////  OLD CODE /////////////////////////////////////////////////////////////////
// async onSearchChange(event: any) {
//   console.log(event.detail.value);
//   this.query = event.detail.value.toLowerCase();
//   this.restaurants = [];
//   if (this.query.length > 0) {
//     this.isLoading = true;
//     try {
//       const radius = this.addressService.radius;
//       const data = {
//         lat: this.location.lat,
//         lng: this.location.lng,
//         radius,
//         name: this.query,
//       };
//       console.log(data);
//       this.restaurantsSub = (
//         await this.restaurantService.getNearbyRestaurants(data)
//       ).subscribe((result) => {
//         this.restaurants = result;
//       });
//       console.log('restaurants: ', this.restaurants);
//       this.isLoading = false;
//     } catch (e: any) {
//       this.isLoading = false;
//       let msg;
//       if (e?.error?.message) {
//         msg = e.error.message;
//       }
//       this.global.errorToast(msg);
//     }
//   }
// }

//let data = { query: this.query };
// let formData: any = serialize(data, {
//   dotsForObjectNotation: true,
// });
// console.log(formData);
// this.restaurantService.searchRestaurants(formData).subscribe({
//   next: (result) => {
//     console.log(result);
//     alert('User was created successfully');
//     this.restaurants = result;
//     // this.router.navigate(['/login']);
//   },
//   error: (err) => {
//     console.log(err);
//     alert('Registration failed!');
//   },
// });
