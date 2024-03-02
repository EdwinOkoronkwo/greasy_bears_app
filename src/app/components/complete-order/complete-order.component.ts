import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Subscription, map } from 'rxjs';
import { Strings } from 'src/app/enum/strings';
import { Item } from 'src/app/models/item.model';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CartService } from 'src/app/services/cart/cart.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { ItemService } from 'src/app/services/item/item.service';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { OrderService } from 'src/app/services/orders/orders.service';
import { RestaurantService } from 'src/app/services/restaurant/restaurant.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-complete-order',
  templateUrl: './complete-order.component.html',
  styleUrls: ['./complete-order.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
})
export class CompleteOrderComponent implements OnDestroy {
  cartItems!: Item[];
  itemsSub!: Subscription;
  cartSub!: Subscription;
  items: Item[] = [];
  itemId!: any;
  status = 'paid';
  orderForm!: FormGroup;
  isSubmitted = false;
  isLoading = false;
  categories$ = this.restaurantService.categories$;
  paymentMode$ = this.orderService.paymentMode$;
  paymentStatus$ = this.orderService.paymentStatus$;
  status$ = this.orderService.status$;
  restaurants$ = this.restaurantService.restaurants$;

  onDelete(itemId: any) {
    console.log(itemId);
    const index = this.items.findIndex((item) => {
      return item.id === itemId;
    });

    this.items.filter((item) => itemId !== index);
    this.itemService.postDeleteItem(itemId).subscribe((result) => {
      console.log('item was deleted');
      window.alert('Item was deleted successfully');
    });
  }

  constructor(
    private itemService: ItemService,
    private route: ActivatedRoute,
    private cartService: CartService,
    private formBuilder: FormBuilder,
    private orderService: OrderService,
    private global: GlobalService,
    private restaurantService: RestaurantService
  ) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');
      this.itemId = id;
    });

    this.cartSub = this.cartService.getCart().subscribe((result: any) => {
      this.cartItems = result;
      console.log(result);
    });
    this.itemsSub = this.itemService.getItems().subscribe((result: any) => {
      this.items = result;
    });

    this.orderForm = this.formBuilder.group({
      status: ['', [Validators.required]],
      paymentMode: ['', [Validators.required]],
      paymentStatus: ['', [Validators.required]],
      restaurantId: ['', [Validators.required]],
      instruction: ['', [Validators.required]],
    });
  }

  onOrderSubmit() {
    let formData = new FormData();
    for (let key in this.orderForm.value) {
      formData.append(key, this.orderForm.value[key]);
    }
    this.isLoading = true;
    console.log('formData', formData);
    this.isSubmitted = true;
    this.orderService.postOrder(formData).subscribe({
      next: (result) => {
        console.log(result);
        this.isLoading = false;
        alert('Order was placed successfully');
        this.global.successToast('Order was placed successfully!');
        this.global.hideLoader();
      },
      error: (err) => {
        console.log(err);
        alert('Order placement failed!');
      },
    });
    this.isLoading = false;
    this.global.hideLoader();
  }

  // Getters
  get statusFormControl() {
    return this.orderForm.get('status');
  }

  get paymentModeFormControl() {
    return this.orderForm.get('paymentMode');
  }

  get paymentStatusFormControl() {
    return this.orderForm.get('paymentStatus');
  }

  get restaurantIdFormControl() {
    return this.orderForm.get('restaurantId');
  }

  get instructionFormControl() {
    return this.orderForm.get('instruction');
  }

  ngOnDestroy(): void {
    if (this.cartSub) this.cartSub.unsubscribe();
    if (this.itemsSub) this.itemsSub.unsubscribe();
  }
}
