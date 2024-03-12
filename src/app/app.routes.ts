import { Routes } from '@angular/router';
//import { AuthGuardService } from './services/auth.guard';
import { AuthGuard } from './guards/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'tabs',
    loadComponent: () =>
      import('./pages/tabs/tabs.page').then((m) => m.TabsPage),
    canLoad: [AuthGuard],
    data: {
      role: 'user',
    },

    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/tabs/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'search',
        loadComponent: () =>
          import('./pages/tabs/search/search.page').then((m) => m.SearchPage),
      },
      {
        path: 'cart',
        loadComponent: () =>
          import('./pages/tabs/cart/cart.page').then((m) => m.CartPage),
      },

      {
        path: 'account',
        loadComponent: () =>
          import('./pages/tabs/account/account.page').then(
            (m) => m.AccountPage
          ),
      },
      {
        path: 'address',
        loadComponent: () =>
          import('./pages/tabs/address/address.page').then(
            (m) => m.AddressPage
          ),
      },

      {
        path: 'address/edit-address',
        loadComponent: () =>
          import('./pages/tabs/address/edit-address/edit-address.page').then(
            (m) => m.EditAddressPage
          ),
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/tabs/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/tabs/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'add-banner',
    loadComponent: () =>
      import('./pages/admin/add-banner/add-banner.page').then(
        (m) => m.AddBannerPage
      ),
  },
  {
    path: 'add-restaurant',
    loadComponent: () =>
      import('./pages/admin/add-restaurant/add-restaurant.page').then(
        (m) => m.AddRestaurantPage
      ),
  },

  {
    path: 'restaurants/:id',
    loadComponent: () =>
      import('./pages/admin/add-restaurant/add-restaurant.page').then(
        (m) => m.AddRestaurantPage
      ),
  },

  {
    path: 'add-menu-item',
    loadComponent: () =>
      import('./pages/admin/add-menu-item/add-menu-item.page').then(
        (m) => m.AddMenuItemPage
      ),
  },
  {
    path: 'menu-items/:id',
    loadComponent: () =>
      import('./pages/admin/add-menu-item/add-menu-item.page').then(
        (m) => m.AddMenuItemPage
      ),
  },

  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin.page').then((m) => m.AdminPage),
    // canActivate: [AuthGuard],
    // canLoad: [AuthGuard],
    // data: {
    //   role: 'admin',
    // },
  },
  {
    path: 'tabs/restaurants/:restaurantId',
    loadComponent: () =>
      import('./pages/tabs/items/items.page').then((m) => m.ItemsPage),
  },
  {
    path: 'tabs/restaurants/:restaurantId/cart',
    loadComponent: () =>
      import('./pages/tabs/cart/cart.page').then((m) => m.CartPage),
  },
  {
    path: 'tabs/restaurants/:id/cart/address/edit-address',
    loadComponent: () =>
      import('./pages/tabs/address/edit-address/edit-address.page').then(
        (m) => m.EditAddressPage
      ),
  },
  {
    path: 'stats',
    loadComponent: () =>
      import('./pages/tabs/stats/stats.page').then((m) => m.StatsPage),
  },
  {
    path: 'add-city',
    loadComponent: () =>
      import('./pages/admin/add-city/add-city.page').then((m) => m.AddCityPage),
  },
  {
    path: 'add-item-category',
    loadComponent: () =>
      import('./pages/admin/add-item-category/add-item-category.page').then(
        (m) => m.AddItemCategoryPage
      ),
  },
  {
    path: 'restaurants',
    loadComponent: () =>
      import('./pages/admin/restaurants/restaurants.page').then(
        (m) => m.RestaurantsPage
      ),
  },
  {
    path: 'menu-items',
    loadComponent: () =>
      import('./pages/admin/menu-items/menu-items.page').then(
        (m) => m.MenuItemsPage
      ),
  },
  {
    path: 'pages/admin/menu-item-form/:id',
    loadComponent: () =>
      import('./pages/admin/menu-item-form/menu-item-form.page').then(
        (m) => m.MenuItemFormPage
      ),
  },
];
