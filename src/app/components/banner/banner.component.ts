import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  Input,
  AfterContentChecked,
  ElementRef,
  ViewChild,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonicSlides } from '@ionic/angular';
import { IonRow } from '@ionic/angular/standalone';
import { Strings } from 'src/app/enum/strings';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
  standalone: true,
  imports: [RouterLink, CommonModule, IonRow],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BannerComponent {
  serverUrl = environment.serverUrl;
  bannerUrl = Strings.BANNER_URL;
  swiperModules = [IonicSlides];
  @Input() bannerImages!: any[];

  constructor() {}
}
