import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddMenuItemPage } from './add-menu-item.page';

describe('AddMenuItemPage', () => {
  let component: AddMenuItemPage;
  let fixture: ComponentFixture<AddMenuItemPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AddMenuItemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
