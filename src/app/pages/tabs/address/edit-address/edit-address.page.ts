import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonItemGroup,
  IonLabel,
  IonList,
  IonNote,
  IonRow,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { serialize } from 'object-to-formdata';
import { Subscription, map } from 'rxjs';
import { MapComponent } from 'src/app/components/map/map.component';
import { SearchLocationComponent } from 'src/app/components/search-location/search-location.component';
import { Address } from 'src/app/models/address.model';
import { AddressService } from 'src/app/services/address/address.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { GoogleMapsService } from 'src/app/services/google-maps/google-maps.service';

@Component({
  selector: 'app-edit-address',
  templateUrl: './edit-address.page.html',
  styleUrls: ['./edit-address.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonItemGroup,
    IonHeader,
    ReactiveFormsModule,
    IonToolbar,
    IonTitle,
    IonLabel,
    IonButton,
    IonBackButton,
    IonContent,
    IonSpinner,
    IonList,
    IonIcon,
    IonButtons,
    MapComponent,
    IonItem,
    IonRow,
    IonNote,
    IonInput,
  ],
})
export class EditAddressPage implements OnInit {
  form!: FormGroup;
  isSubmitted = false;
  location: any = {};
  isLocationFetched!: boolean;
  center: any;
  update!: boolean;
  id: any;
  isLoading: boolean = false;
  from!: string;
  check: boolean = false;
  addressSub!: Subscription;

  constructor(
    private navCtrl: NavController,
    private addressService: AddressService,
    private global: GlobalService,
    private maps: GoogleMapsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.checkForUpdate();
  }

  selectedTaskId$ = this.route.paramMap.pipe(
    map((paramMap) => {
      let id = paramMap.get('id');
      if (id) this.id = +id;
    })
  );

  checkForUpdate() {
    this.isLoading = true;
    this.location.title = 'Locating...';
    this.isLocationFetched = false;
    this.route.queryParams.subscribe(async (data: any) => {
      console.log('data: ', data);
      if (data?.data) {
        const address = JSON.parse(data.data);
        if (address?.lat) {
          this.center = {
            lat: address.lat,
            lng: address.lng,
          };
          this.update = true;
          this.location.lat = this.center.lat;
          this.location.lng = this.center.lng;
          this.location.address = address.address;
          this.location.title = address.title;
          if (!address?.from) this.id = address.id;
        }
        if (address.from) this.from = address.from;
        await this.initForm(address);
        this.toggleFetched();
      } else {
        this.update = false;
        this.initForm();
      }
    });
  }

  initForm(address?: Address) {
    let data: any = {
      title: null,
      house: null,
      landmark: null,
    };
    if (address) {
      data = {
        title: address.title,
        houseNumber: address.houseNumber,
        landmark: address.landmark,
      };
    }
    this.formData(data);
  }

  formData(data?: any) {
    this.form = new FormGroup({
      title: new FormControl(data.title, { validators: [Validators.required] }),
      houseNumber: new FormControl(data.houseNumber, {
        validators: [Validators.required],
      }),
      landmark: new FormControl(data.landmark, {
        validators: [Validators.required],
      }),
    });
    this.isLoading = false;
  }

  fetchLocation(event: any) {
    this.location = event;
    console.log('location: ', this.location);
    this.isLocationFetched = true;
  }

  toggleFetched() {
    this.isLocationFetched = !this.isLocationFetched;
  }

  toggleSubmit() {
    this.isSubmitted = !this.isSubmitted;
  }

  onSubmit() {
    this.toggleSubmit();
    console.log(this.form);
    if (!this.form.valid || !this.isLocationFetched) {
      this.toggleSubmit();
      return;
    }
    const data: any = {
      title: this.form.value.title,
      landmark: this.form.value.landmark,
      houseNumber: this.form.value.houseNumber,
      address: this.location.address,
      lat: parseFloat(this.location.lat),
      lng: parseFloat(this.location.lng),
    };
    console.log('address: ', data);
    //  const formData: any = serialize(data, { dotsForObjectNotation: true });
    let addressDetails = this.form.value;
    if (!this.id) this.addressService.addAddress(data);
    else {
      addressDetails = { ...addressDetails, id: this.id };
    }
    this.addressService.updateAddress(addressDetails);
    this.check = true;
    this.navCtrl.back();
    this.global.successToast('Address updated successfully!');
    this.toggleSubmit();
  }
  catch(e: any) {
    console.log(e);
    this.toggleSubmit();
    this.global.errorToast();
  }

  async searchLocation() {
    try {
      const options = {
        component: SearchLocationComponent,
        // cssClass: 'address-modal',
        cssClass: 'inline_modal',
        breakpoints: [0, 0.5, 0.7, 0.9],
        initialBreakpoint: 0.7,
        swipeToClose: true,
      };
      const location = await this.global.createModal(options);
      console.log('location: ', location);
      if (location) {
        this.location = location;
        const loc = {
          lat: location.lat,
          lng: location.lng,
        };
        // update marker
        this.update = true;
        this.maps.changeMarkerInMap(loc);
      }
    } catch (e) {
      console.log(e);
    }
  }

  ionViewDidLeave() {
    console.log('ionViewDidLeave EditAddressPage');
    if (this.from === 'home' && !this.check) {
      this.addressService.changeAddress({});
    }
  }
}
