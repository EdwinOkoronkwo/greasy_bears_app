import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {
  BehaviorSubject,
  EMPTY,
  Subscription,
  catchError,
  combineLatest,
  map,
  startWith,
  tap,
} from 'rxjs';
import { ItemCategory } from 'src/app/models/itemcategory.model';
import { RestaurantService } from 'src/app/services/restaurant/restaurant.service';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { ItemCategoryService } from 'src/app/services/itemcategory/itemCategory.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from 'src/app/services/global/global.service';
import { addIcons } from 'ionicons';
import { mail, person } from 'ionicons/icons';

@Component({
  selector: 'app-add-item-category',
  templateUrl: './add-item-category.page.html',
  styleUrls: ['./add-item-category.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule],
})
export class AddItemCategoryPage {
  status$ = this.categoryService.status$;
  isLoading: boolean = false;
  errorMessageSubject = new BehaviorSubject<string>('');
  errorMessageAction$ = this.errorMessageSubject.asObservable();
  itemCategorySub!: Subscription;
  restaurantId!: number;
  itemCategories$ =
    this.categoryService.itemCategoriesWithRestaurantsAndUsersAndCRUD$.pipe(
      catchError((error: string) => {
        this.errorMessageSubject.next(error);
        return EMPTY;
      })
    );

  restaurants$ = this.restaurantService.restaurants$.pipe(
    catchError((error: string) => {
      this.errorMessageSubject.next(error);
      return EMPTY;
    })
  );

  itemCategoryId!: number;
  selectedRestaurantId!: number;
  categories!: ItemCategory[];
  selectedRestaurantSubject = new BehaviorSubject<number>(0);
  selectedRestaurantAction$ = this.selectedRestaurantSubject.asObservable();

  itemCategoryForm: any = new FormGroup({
    name: new FormControl(''),
    restaurantId: new FormControl(''),
  });

  selectedItemCategoryId$ = this.route.paramMap.pipe(
    map((paramMap: any) => {
      let id = paramMap.get('id');
      if (id) this.itemCategoryId = +id;
      this.categoryService.selectItemCategory(this.itemCategoryId);
    })
  );

  itemCategory$ =
    this.categoryService.itemCategoriesWithRestaurantsAndUsersAndCRUD$.pipe(
      tap((itemCategory: any) => {
        if (itemCategory) this.itemCategoryId = itemCategory.id;
        itemCategory &&
          this.itemCategoryForm.setValue({
            name: itemCategory?.name,
            restaurantId: itemCategory?.restaurantId,
          });
      }),
      catchError((error) => {
        this.notificationService.setErrorMessage(error);
        return EMPTY;
      })
    );

  notification$ = this.categoryService.itemCategoryCRUDCompleteAction$.pipe(
    startWith(false),
    tap((message) => {
      if (message) {
        this.router.navigateByUrl('/tabs/admin');
      }
    })
  );
  viewModel$ = combineLatest([
    this.selectedItemCategoryId$,
    this.itemCategories$,
    this.notification$,
  ]);

  constructor(
    private notificationService: NotificationService,
    private restaurantService: RestaurantService,
    private categoryService: ItemCategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private global: GlobalService
  ) {
    addIcons({
      person,
      mail,
    });
    this.itemCategorySub = this.categoryService
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
    this.itemCategories$,
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

  onCategorySubmit() {
    this.isLoading = true;
    this.global.showLoader();
    let formData: any = new FormData();
    for (let key in this.itemCategoryForm.value) {
      formData.append(key, this.itemCategoryForm.value[key]);
    }

    this.itemCategorySub = this.categoryService
      .addItemCategoryToServer(formData)
      .subscribe({
        next: (result) => {
          console.log(result);
          this.isLoading = false;
          this.global.successToast('Item Category was added successfully!');
          this.global.hideLoader();
          this.router.navigateByUrl('/admin');
        },
        error: (err) => {
          console.log(err);
          this.global.errorToast('Item Category addition failed');
          this.isLoading = false;
          this.global.hideLoader();
        },
      });
  }

  // Getters
  get nameFormControl() {
    return this.itemCategoryForm.get('name');
  }

  get restaurantIdFormControl() {
    return this.itemCategoryForm.get('restaurantId');
  }
}
