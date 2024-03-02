import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {}

  setStorage(key: any, value: any) {
    Preferences.set({ key, value });
  }

  getStorage(key: any) {
    return Preferences.get({ key });
  }

  removeStorage(key: any) {
    Preferences.remove({ key });
  }

  clearStorage(key: any) {
    Preferences.clear();
  }
}
