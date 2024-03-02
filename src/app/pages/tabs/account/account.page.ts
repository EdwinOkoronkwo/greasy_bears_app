import {
  AfterContentChecked,
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { LoginComponent } from 'src/app/components/login/login.component';
import { Order } from 'src/app/models/order.model';
import { Subscription, map } from 'rxjs';
import { OrderService } from 'src/app/services/orders/orders.service';
import { CartService } from 'src/app/services/cart/cart.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { EditProfileComponent } from 'src/app/components/edit-profile/edit-profile.component';
import {
  checkmarkCircleOutline,
  chevronForwardOutline,
  homeOutline,
  powerOutline,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonListHeader,
  IonModal,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Strings } from 'src/app/enum/strings';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true,
  imports: [
    RouterLink,
    EditProfileComponent,
    CommonModule,
    FormsModule,
    LoginComponent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonButtons,
    IonContent,
    IonSpinner,
    IonItem,
    IonLabel,
    IonText,
    IonIcon,
    IonListHeader,
    IonModal,
  ],
})
export class AccountPage implements OnDestroy {
  @ViewChild('otp_modal') modal!: ModalController;
  profile: any = {};
  isLoading!: boolean;
  orders!: any[];
  ordersByUser: Order[] = [];
  ordersSub!: Subscription;
  profileSub!: Subscription;
  verifyOtp = false;
  serverUrl = environment.serverUrl;
  restaurantUrl = Strings.RESTAURANT_URL;
  profile_file: any;
  profile_image: any;
  profileUrl = Strings.PROFILE_URL;
  deliveryCharge = 10;
  cartItems: any;
  orderSub2!: Subscription;
  processedOrders: any;

  constructor(
    private orderService: OrderService,
    private cartService: CartService,
    private global: GlobalService,
    private profileService: ProfileService,
    private auth: AuthService
  ) {
    addIcons({
      powerOutline,
      homeOutline,
      chevronForwardOutline,
      checkmarkCircleOutline,
    });
  }

  ionViewDidEnter() {
    this.ordersSub = this.orderService.getOrders().subscribe(
      (result: any) => {
        this.orders = result;
        console.log(this.orders);
      },

      (e) => {
        console.log(e);
      }
    );

    this.profileSub = this.profileService
      .getProfile()
      .subscribe((profile: any) => {
        this.profile = profile;
        console.log(this.profile);
      });
    this.orderService.getOrdersPrice().subscribe((result) => {
      this.processedOrders = result;
      console.log(this.processedOrders);
    });
  }

  confirmLogout() {
    this.global.showAlert('Are you sure you want to sign-out?', 'Confirm', [
      {
        text: 'No',
        role: 'cancel',
      },
      {
        text: 'Yes',
        handler: () => this.logout(),
      },
    ]);
  }

  logout() {
    this.auth.logout();
  }

  async reorder(order: any) {
    console.log(order);
    let data: any = await this.cartService.getCart();
    console.log('data: ', data);
    if (data?.value) {
      this.cartService.alertClearCart(null, null, null, order);
    } else {
      this.cartService.addCartToServer(order);
    }
  }

  async editProfile() {
    const options = {
      component: EditProfileComponent,
      componentProps: {
        profile: this.profile,
      },
      //cssClass: 'custom-modal',
      cssClass: 'inline-modal',
      breakpoints: [0, 0.5, 0.7],
      initialBreakpoint: 0.7,
      swipeToClose: true,
    };
    await this.global.createModal(options);
  }

  ngOnDestroy() {
    if (this.ordersSub) this.ordersSub.unsubscribe();
    if (this.profileSub) this.profileSub.unsubscribe();
  }
}

/////////////////////////////////////////////////////////////////////////////////
///////////////////////////   OLD CODE //////////////////////////////////////////////////////

// getHelp(order: any) {
//   console.log(order);
// }

// removeBracketsAndQuotes(order: any) {
//   let str = '';
//   let regx = /["\\[ \\]]/g;
//   str = order.replace(regx, '');
//   return str;
// }
