import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddBannerPage } from './add-banner.page';

describe('AddBannerPage', () => {
  let component: AddBannerPage;
  let fixture: ComponentFixture<AddBannerPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AddBannerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
