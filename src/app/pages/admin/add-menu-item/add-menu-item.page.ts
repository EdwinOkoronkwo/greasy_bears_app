import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';

import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';

import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgModel, NgForm } from '@angular/forms';
import { catchError, map, startWith, tap } from 'rxjs/operators';
import { BehaviorSubject, EMPTY, Subscription, combineLatest } from 'rxjs';
import { CommonModule } from '@angular/common';
import { GlobalService } from '../../../services/global/global.service';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonDatetime,
  IonIcon,
  IonImg,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { RestaurantService } from 'src/app/services/restaurant/restaurant.service';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { addIcons } from 'ionicons';
import {
  addOutline,
  call,
  cashOutline,
  cloudUploadOutline,
  key,
  mail,
  person,
  timeOutline,
} from 'ionicons/icons';
import { ItemCategoryService } from 'src/app/services/itemcategory/itemCategory.service';
import { ItemService } from 'src/app/services/item/item.service';
import { ItemCategory } from 'src/app/models/itemcategory.model';

@Component({
  selector: 'app-add-menu-item',
  templateUrl: './add-menu-item.page.html',
  styleUrls: ['./add-menu-item.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    IonImg,
    IonInfiniteScrollContent,
    IonRow,
    IonList,
    IonIcon,
    IonLabel,
    IonInput,
    IonText,
    IonButton,
    IonButtons,
    IonItem,
    IonSelect,
    CommonModule,
    IonTitle,
    IonListHeader,
    IonBackButton,
    IonToolbar,
    IonDatetime,
    ReactiveFormsModule,
    IonSelectOption,
    IonSelect,
    IonInfiniteScroll,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddMenuItemPage {
  @ViewChild('filePicker', { static: false }) filePickerRef!: ElementRef;

  isVeg$ = this.itemService.isVeg$;
  status$ = this.itemService.status$;
  cover: any;
  cover_file: any;
  isLoading: boolean = false;
  errorMessageSubject = new BehaviorSubject<string>('');
  errorMessageAction$ = this.errorMessageSubject.asObservable();
  menuItemSub!: Subscription;
  restaurants$ = this.restaurantService.restaurants$.pipe(
    catchError((error: string) => {
      this.errorMessageSubject.next(error);
      return EMPTY;
    })
  );

  categories$ = this.categoryService.itemCategories$.pipe(
    catchError((error: string) => {
      this.errorMessageSubject.next(error);
      return EMPTY;
    })
  );

  itemId!: number;
  image: any;
  imageFile: any;
  selectedRestaurantId!: number;
  categoriesSub!: Subscription;
  categories!: ItemCategory[];
  selectedRestaurantSubject = new BehaviorSubject<number>(0);
  selectedRestaurantAction$ = this.selectedRestaurantSubject.asObservable();

  menuItemForm: any = new FormGroup({
    name: new FormControl(''),
    restaurantId: new FormControl(''),
    categoryId: new FormControl(''),
    description: new FormControl(''),
    price: new FormControl(''),
    isVeg: new FormControl(''),
    status: new FormControl(''),
  });

  selectedItemId$ = this.route.paramMap.pipe(
    map((paramMap) => {
      let id = paramMap.get('id');
      if (id) this.itemId = +id;
      this.itemService.selectItem(this.itemId);
    })
  );

  item$ = this.itemService.items$.pipe(
    tap((item: any) => {
      if (item) this.itemId = item.id;
      item &&
        this.menuItemForm.setValue({
          name: item?.name,
          restaurantId: item?.restaurantId,
          categoryId: item?.categoryId,
          description: item?.description,
          price: item?.price,
          isVeg: item?.isVeg,
          status: item?.status,
        });
    }),
    catchError((error) => {
      this.notificationService.setErrorMessage(error);
      return EMPTY;
    })
  );

  notification$ = this.itemService.itemsCRUDCompleteAction$.pipe(
    startWith(false),
    tap((message) => {
      if (message) {
        this.router.navigateByUrl('/tabs/admin');
      }
    })
  );
  viewModel$ = combineLatest([
    this.selectedItemId$,
    this.item$,
    this.notification$,
  ]);

  constructor(
    private notificationService: NotificationService,
    private restaurantService: RestaurantService,
    private categoryService: ItemCategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private global: GlobalService,
    private itemService: ItemService
  ) {
    addIcons({
      timeOutline,
      person,
      mail,
      key,
      call,
      cashOutline,
      addOutline,
      cloudUploadOutline,
    });
    this.categoriesSub = this.categoryService
      .getItemCategories()
      .subscribe((result) => {
        this.categories = result;
        console.log(result);
      });
  }

  onRestaurantChange(event: Event) {
    let selectedRestaurantId = parseInt(
      (event.target as HTMLSelectElement).value
    );
    this.selectedRestaurantSubject.next(selectedRestaurantId);
  }

  filteredCategories$ = combineLatest([
    this.categories$,
    this.selectedRestaurantAction$,
  ]).pipe(
    tap((data) => {
      this.isLoading = false;
      this.global.hideLoader();
    }),
    map(([categories, selectedRestaurantId]) => {
      return categories.filter((category: any) =>
        selectedRestaurantId
          ? category.restaurantId === selectedRestaurantId
          : true
      );
    })
  );

  changeImage() {
    this.filePickerRef.nativeElement.click();
  }

  onFileChosen(event: any) {
    this.cover = event.target.files[0];
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log('result: ', reader.result);
      this.cover_file = reader.result;
    };
    reader.readAsDataURL(file);
  }

  onItemSubmit() {
    this.isLoading = true;
    this.global.showLoader();
    let formData: any = new FormData();
    if (!this.image || this.image === '') {
      this.global.errorToast('Please select a cover image');
    }

    formData.append('cover', this.cover);
    for (let key in this.menuItemForm.value) {
      formData.append(key, this.menuItemForm.value[key]);
    }

    this.menuItemSub = this.itemService.addItemToServer(formData).subscribe({
      next: (result) => {
        console.log(result);
        this.isLoading = false;
        this.global.successToast('Menu item was added successfully!');
        this.global.hideLoader();
        this.router.navigateByUrl('/admin');
      },
      error: (err) => {
        console.log(err);
        this.global.errorToast('Restaurant addition failed');
        this.isLoading = false;
        this.global.hideLoader();
      },
    });
  }

  getArrayAsString(array: any) {
    return array.join(', ');
  }

  // Getters
  get nameFormControl() {
    return this.menuItemForm.get('name');
  }

  get restaurantIdFormControl() {
    return this.menuItemForm.get('restaurantId');
  }

  get categoryIdFormControl() {
    return this.menuItemForm.get('categoryId');
  }

  get descriptionFormControl() {
    return this.menuItemForm.get('description');
  }

  get priceFormControl() {
    return this.menuItemForm.get('price');
  }

  get isVegFormControl() {
    return this.menuItemForm.get('isVeg');
  }

  get statusFormControl() {
    return this.menuItemForm.get('status');
  }
  get imageFormControl() {
    return this.menuItemForm.get('image');
  }
}
