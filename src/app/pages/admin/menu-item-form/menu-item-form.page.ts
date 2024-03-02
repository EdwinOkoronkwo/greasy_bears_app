import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ItemCategory } from 'src/app/models/itemcategory.model';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { RestaurantService } from 'src/app/services/restaurant/restaurant.service';
import { ItemCategoryService } from 'src/app/services/itemcategory/itemCategory.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from 'src/app/services/global/global.service';
import { ItemService } from 'src/app/services/item/item.service';
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
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { serialize } from 'object-to-formdata';

@Component({
  selector: 'app-menu-item-form',
  templateUrl: './menu-item-form.page.html',
  styleUrls: ['./menu-item-form.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule],
})
export class MenuItemFormPage {
  @ViewChild('filePicker', { static: false }) filePickerRef!: ElementRef;
  menuItemForm: FormGroup;
  isEditMode: boolean = false;
  isVeg$ = this.itemService.isVeg$;
  status$ = this.itemService.status$;
  cover: any;
  cover_file: any;
  isLoading: boolean = false;
  // errorMessageSubject = new BehaviorSubject<string>('');
  // errorMessageAction$ = this.errorMessageSubject.asObservable();
  menuItemSub!: Subscription;
  // restaurants$ = this.restaurantService.restaurants$.pipe(
  //   catchError((error: string) => {
  //     this.errorMessageSubject.next(error);
  //     return EMPTY;
  //   })
  // );

  // categories$ = this.categoryService.itemCategories$.pipe(
  //   catchError((error: string) => {
  //     this.errorMessageSubject.next(error);
  //     return EMPTY;
  //   })
  // );

  itemId!: number;
  image: any;
  imageFile: any;
  // selectedRestaurantId!: number;
  categoriesSub!: Subscription;
  categories!: ItemCategory[];
  restaurantSub!: Subscription;
  restaurants!: Restaurant[];
  // selectedRestaurantSubject = new BehaviorSubject<number>(0);
  // selectedRestaurantAction$ = this.selectedRestaurantSubject.asObservable();

  constructor(
    private notificationService: NotificationService,
    private restaurantService: RestaurantService,
    private categoryService: ItemCategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private global: GlobalService,
    private itemService: ItemService,
    private formBuilder: FormBuilder
  ) {
    this.menuItemForm = formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      restaurantId: ['', [Validators.required]],
      categoryId: ['', [Validators.required]],
      description: ['', [Validators.required]],
      price: ['', [Validators.required]],
      isVeg: ['', [Validators.required]],
      status: ['', [Validators.required]],
    });
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
    this.restaurantSub = this.restaurantService
      .getRestaurants()
      .subscribe((result) => {
        this.restaurants = result;
        console.log(result);
      });
    const itemId = this.route.snapshot.paramMap.get('id');
    if (itemId) {
      this.isEditMode = true;
      this.itemId = parseInt(itemId);

      this.itemService.getItem(this.itemId).subscribe((result) => {
        console.log(result);
        this.menuItemForm.patchValue(result);
        console.log(this.menuItemForm.value);
      });
    }
  }

  onItemSubmit() {
    this.isEditMode ? this.updateItem() : this.createItem();
  }

  createItem() {
    this.isLoading = true;
    let menuItemDetails = this.menuItemForm.value;
    this.global.showLoader();
    let formData: any = new FormData();
    if (!this.image || this.image === '') {
      this.global.errorToast('Please select a cover image');
    }

    formData.append('cover', this.cover);
    for (let key in menuItemDetails.value) {
      formData.append(key, menuItemDetails.value[key]);
    }

    this.menuItemSub = this.itemService.updateItemToServer(formData).subscribe({
      next: (result) => {
        console.log(result);
        this.isLoading = false;
        this.menuItemForm.reset();
        this.global.successToast('Menu item was added successfully!');
        this.global.hideLoader();
        this.router.navigateByUrl('/admin');
      },
      error: (err) => {
        console.log(err);
        this.global.errorToast('Menu Item addition failed');
        this.isLoading = false;
        this.global.hideLoader();
      },
    });
  }

  updateItem() {
    this.isLoading = true;
    let menuItemDetails = this.menuItemForm.value;
    console.log('menuItemDetails: ', menuItemDetails);
    if (this.itemId) {
      console.log(this.itemId);
      menuItemDetails = { ...menuItemDetails, id: this.itemId };
      console.log('menuItemDetails: ', menuItemDetails);
      this.global.showLoader();
      // let formData: any = new FormData();
      const formData: any = serialize(menuItemDetails, {
        dotsForObjectNotation: true,
      });
      if (!this.image || this.image === '') {
        this.global.errorToast('Please select a cover image');
      }

      //  formData.append('cover', this.cover);
      for (let key in menuItemDetails.value) {
        formData.append(key, menuItemDetails.value[key]);
      }
      console.log('formData: ', formData);

      this.menuItemSub = this.itemService
        .updateItemToServer(formData)
        .subscribe({
          next: (result) => {
            console.log(result);
            this.isLoading = false;
            this.menuItemForm.reset();
            this.global.successToast('Menu item was added successfully!');
            this.global.hideLoader();
            this.router.navigateByUrl('/admin');
          },
          error: (err) => {
            console.log(err);
            this.global.errorToast('Menu Item addition failed');
            this.isLoading = false;
            this.global.hideLoader();
          },
        });
    }
  }

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
