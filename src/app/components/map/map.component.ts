import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { GoogleMapsService } from 'src/app/services/google-maps/google-maps.service';
import { LocationService } from 'src/app/services/location/location.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  standalone: true,
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('map', { static: true }) mapElementRef!: ElementRef;
  googleMaps: any;
  map: any;
  marker: any;
  @Input() update = false;
  @Input() center = { lat: 53.43076897692667, lng: -113.60732594483997 };
  @Output() location: EventEmitter<any> = new EventEmitter();
  mapListener: any;
  markerChangeSub!: Subscription;

  constructor(
    private maps: GoogleMapsService,
    private renderer: Renderer2,
    private locationService: LocationService
  ) {}

  ngOnInit() {
    console.log('ngOnInit MapComponent:');
  }

  async ngAfterViewInit() {
    await this.initMap();
    this.markerChangeSub = this.maps.markerChange.subscribe(async (loc) => {
      if (loc?.lat) {
        const googleMaps = this.googleMaps;
        const location = new googleMaps.LatLng(loc.lat, loc.lng);
        this.map.panTo(location);
        this.marker.setMap(null);
        await this.addMarker(location);
      }
    });
  }

  async initMap() {
    try {
      if (!this.update) {
        const position: any = await this.locationService.getCurrentLocation();
        this.center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        await this.loadMap();
        this.getAddress(this.center.lat, this.center.lng);
      } else {
        await this.loadMap();
      }
    } catch (e) {
      console.log(e);
      this.center = { lat: 53.43076897692667, lng: -113.60732594483997 };
      this.loadMap();
      this.getAddress(this.center.lat, this.center.lng);
    }
  }

  async loadMap() {
    try {
      let googleMaps: any = await this.maps.loadGoogleMaps();
      this.googleMaps = googleMaps;
      const style = [
        {
          featureType: 'all',
          elementType: 'all',
          stylers: [{ saturation: -100 }],
        },
      ];
      const mapEl = this.mapElementRef.nativeElement;
      const location = new googleMaps.LatLng(this.center.lat, this.center.lng);
      this.map = new googleMaps.Map(mapEl, {
        center: location,
        zoom: 15,
        scaleControl: false,
        streetViewControl: false,
        zoomControl: false,
        overviewMapControl: false,
        mapTypeControl: false,
        mapTypeControlOptions: {
          mapTypeIds: [googleMaps.MapTypeId.ROADMAP, 'SwiggyClone'],
        },
      });
      var mapType = new googleMaps.StyledMapType(style, { name: 'Grayscale' });
      this.map.mapTypes.set('SwiggyClone', mapType);
      this.map.setMapTypeId('SwiggyClone');
      this.renderer.addClass(mapEl, 'visible');
      this.addMarker(location);
    } catch (e) {
      console.log(e);
    }
  }

  addMarker(location: any) {
    let googleMaps: any = this.googleMaps;
    const icon = {
      url: '/assets\\icon\\location-pin.png',
      scaledSize: new googleMaps.Size(50, 50),
    };
    this.marker = new googleMaps.Marker({
      position: location,
      map: this.map,
      icon: icon,
      draggable: true,
      animation: googleMaps.Animation.DROP,
    });
    this.mapListener = this.googleMaps.event.addListener(
      this.marker,
      'dragend',
      () => {
        this.getAddress(this.marker.position.lat(), this.marker.position.lng());
      }
    );
  }

  async getAddress(lat: any, lng: any) {
    try {
      const result: any = await this.maps.getAddress(lat, lng);
      console.log(result);
      const loc: any = {
        title: result.address_components[0].short_name,
        address: result.formatted_address,
        lat,
        lng,
      };
      console.log(loc);
      this.location.emit(loc);
    } catch (e) {
      console.log(e);
    }
  }

  ngOnDestroy() {
    if (this.mapListener)
      this.googleMaps.event.removeListener(this.mapListener);
    if (this.markerChangeSub) this.markerChangeSub.unsubscribe();
  }
}
