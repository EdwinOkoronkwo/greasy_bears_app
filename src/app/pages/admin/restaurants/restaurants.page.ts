import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RestaurantService } from 'src/app/services/restaurant/restaurant.service';
import { Restaurant } from 'src/app/models/restaurant.model';
import { EmptyScreenComponent } from 'src/app/components/empty-screen/empty-screen.component';
import { GlobalService } from 'src/app/services/global/global.service';
import { NavigationExtras, Router, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  chevronForwardOutline,
  createOutline,
  homeOutline,
  locationOutline,
  trashOutline,
} from 'ionicons/icons';
import { environment } from 'src/environments/environment';
import { Strings } from 'src/app/enum/strings';

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.page.html',
  styleUrls: ['./restaurants.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    EmptyScreenComponent,
    RouterLink,
  ],
})
export class RestaurantsPage implements OnDestroy, OnInit {
  restaurants!: Restaurant[];
  restaurantSub!: any;
  isLoading = false;
  model = {
    title: 'No Restaurants added yet',
    icon: 'location-outline',
  };
  serverUrl = environment.serverUrl;
  restaurantUrl = Strings.RESTAURANT_URL;
  restaurants$ = this.restaurantService.restaurants$;
  constructor(
    private restaurantService: RestaurantService,
    private global: GlobalService,
    private router: Router
  ) {
    addIcons({
      homeOutline,
      chevronForwardOutline,
      checkmarkCircleOutline,
      locationOutline,
      createOutline,
      trashOutline,
    });
  }

  ngOnInit(): void {
    this.restaurantSub = this.restaurantService.restaurants$.subscribe(
      (result) => {
        this.restaurants = result;
        console.log(this.restaurants);
        this.isLoading = false;
      }
    );
  }

  getIcon(title: any) {
    return this.global.getIcon(title);
  }

  editRestaurant(restaurant: Restaurant) {
    console.log(restaurant);
    const navData: NavigationExtras = {
      queryParams: {
        data: JSON.stringify(restaurant),
      },
    };
    this.router.navigate([this.router.url, '/../add-restaurant'], navData);
  }

  deleteRestaurantAlert(restaurant: Restaurant) {
    console.log('restaurant: ', restaurant);
    this.global.showAlert(
      'Are you sure you want to delete this address?',
      'Confirm',
      [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('cancel');
            return;
          },
        },
        {
          text: 'Yes',
          handler: () => {
            this.deleteRestaurant(restaurant);
          },
        },
      ]
    );
  }

  deleteRestaurant(restaurant: any) {
    try {
      this.global.showLoader();
      this.restaurantService.deleteRestaurant(restaurant);
      this.global.hideLoader();
    } catch (e: any) {
      console.log(e);
      this.global.hideLoader();
      let msg;
      if (e?.error?.message) {
        msg = e.error.message;
      }
      this.global.errorToast(msg);
    }
  }

  ngOnDestroy(): void {
    if (this.restaurantSub) this.restaurantSub.unsubscribe();
  }
}
