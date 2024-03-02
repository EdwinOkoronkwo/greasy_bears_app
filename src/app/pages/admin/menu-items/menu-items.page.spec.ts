import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuItemsPage } from './menu-items.page';

describe('MenuItemsPage', () => {
  let component: MenuItemsPage;
  let fixture: ComponentFixture<MenuItemsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(MenuItemsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
