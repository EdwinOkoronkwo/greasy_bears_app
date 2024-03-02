import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NavigationExtras, Router, RouterLink } from '@angular/router';
import { Item } from 'src/app/models/item.model';
import { environment } from 'src/environments/environment';
import { Strings } from 'src/app/enum/strings';
import { ItemService } from 'src/app/services/item/item.service';
import { GlobalService } from 'src/app/services/global/global.service';
import {
  checkmarkCircleOutline,
  chevronForwardOutline,
  createOutline,
  fastFoodOutline,
  homeOutline,
  trashOutline,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { EmptyScreenComponent } from 'src/app/components/empty-screen/empty-screen.component';

@Component({
  selector: 'app-menu-items',
  templateUrl: './menu-items.page.html',
  styleUrls: ['./menu-items.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterLink,
    EmptyScreenComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemsPage implements OnInit, OnDestroy {
  items!: Item[];
  itemsSub!: any;
  isLoading = false;
  model = {
    title: 'No Menu Items added yet',
    icon: 'fast-food-outline',
  };
  serverUrl = environment.serverUrl;
  menuItemUrl = Strings.ITEM_URL;
  items$ = this.itemService.items$;

  constructor(
    private itemService: ItemService,
    private global: GlobalService,
    private router: Router
  ) {
    addIcons({
      homeOutline,
      chevronForwardOutline,
      checkmarkCircleOutline,
      fastFoodOutline,
      createOutline,
      trashOutline,
    });
  }

  ngOnInit(): void {
    this.itemsSub = this.itemService.items$.subscribe((result) => {
      this.items = result;
      console.log(this.items);
      this.isLoading = false;
    });
  }

  getIcon(title: any) {
    return this.global.getIcon(title);
  }

  editMenuItem(item: Item) {
    console.log(item);
    const navData: NavigationExtras = {
      queryParams: {
        data: JSON.stringify(item),
      },
    };
    this.router.navigate([this.router.url, '/../add-menu-item'], navData);
  }

  deleteItemAlert(item: Item) {
    console.log('item: ', item);
    this.global.showAlert(
      'Are you sure you want to delete this menu item?',
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
            this.deleteItem(item);
          },
        },
      ]
    );
  }

  deleteItem(item: any) {
    try {
      this.global.showLoader();
      this.itemService.deleteItem(item);
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
    if (this.itemsSub) this.itemsSub.unsubscribe();
  }
}
