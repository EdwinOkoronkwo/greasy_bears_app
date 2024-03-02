import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuItemFormPage } from './menu-item-form.page';

describe('MenuItemFormPage', () => {
  let component: MenuItemFormPage;
  let fixture: ComponentFixture<MenuItemFormPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(MenuItemFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
