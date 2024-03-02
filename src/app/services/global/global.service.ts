import { Injectable } from '@angular/core';
import {
  AlertController,
  LoadingController,
  ModalController,
  ToastController,
} from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  isLoading: boolean = false;
  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController
  ) {}

  toggleLoader() {
    this.isLoading = !this.isLoading;
  }

  async showAlert(
    message: string,
    header?: any,
    buttonArray?: any,
    inputs?: any
  ) {
    const alert = await this.alertCtrl.create({
      header: header ? header : 'Authentication failed',
      inputs: inputs ? inputs : [],
      message,
      buttons: buttonArray ? buttonArray : ['Okay'],
    });
    // .then((alertEL) => alertEL.present());
    alert.present();
  }

  async showToast(message: any, duration = 3000, color: any, position: any) {
    const toast = await this.toastCtrl.create({
      message,
      duration,
      color,
      position,
    });
    // .then((toast) => toast.present());
    toast.present();
  }

  async toastDismiss(data?: any) {
    await this.toastCtrl.dismiss();
  }

  async showButtonToast(message: any, color = 'danger', position?: any) {
    const toast = await this.toastCtrl.create({
      // header: 'Alert',
      message,
      color,
      position: position || 'bottom',
      buttons: [
        {
          side: 'end',
          text: 'VERIFY',
          handler: () => {
            this.toastDismiss(true);
          },
        },
        {
          side: 'start',
          icon: 'close-circle',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          },
        },
      ],
    });
    // .then((toast) => toast.present());
    await toast.present();
    const { data } = await toast.onDidDismiss();
    console.log('onDisdDimiss resolved with role', data);
    if (data) return data;
  }

  errorToast(message?: any, duration = 4000) {
    this.showToast(
      message ? message : 'No internet connection',
      duration,
      'danger',
      'bottom'
    );
  }

  successToast(message?: any) {
    this.showToast(message, 3000, 'success', 'bottom');
  }

  async showLoader(message?: any, spinner?: any) {
    //this.isLoading = true;
    !this.isLoading ? this.toggleLoader() : null;
    try {
      const res = await this.loadingCtrl.create({
        message,
        spinner: spinner ? spinner : 'bubbles',
      });
      res.present().then(() => {
        if (!this.isLoading) {
          res.dismiss().then(() => {
            console.log('abort presenting');
          });
        }
      });
    } catch (e) {
      console.log('Show loading error: ', e);
    }
  }

  async hideLoader() {
    //this.isLoading = false;
    this.isLoading ? this.toggleLoader() : null;
    return await this.loadingCtrl
      .dismiss()
      .then(() => console.log('dismissed'))
      .catch((e) => console.log('error hide loader: ', e));
  }

  async createModal(options: any) {
    const modal = await this.modalCtrl.create(options);
    await modal.present();
    const { data } = await modal.onWillDismiss();
    console.log(data);
    if (data) return data;
  }

  modalDismiss(val?: any) {
    let data: any = val ? val : null;
    console.log('data', data);
    this.modalCtrl.dismiss(data);
  }

  getIcon(title: any) {
    const name = title.toLowerCase();
    switch (name) {
      case 'home':
        return 'home-outline';
      case 'work':
        return 'briefcase-outline';
      default:
        return 'location-outline';
    }
  }
}
