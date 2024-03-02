import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddItemCategoryPage } from './add-item-category.page';

describe('AddItemCategoryPage', () => {
  let component: AddItemCategoryPage;
  let fixture: ComponentFixture<AddItemCategoryPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AddItemCategoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
