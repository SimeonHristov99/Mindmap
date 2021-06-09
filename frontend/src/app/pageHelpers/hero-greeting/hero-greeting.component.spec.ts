import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroGreetingComponent } from './hero-greeting.component';

describe('HeroGreetingComponent', () => {
  let component: HeroGreetingComponent;
  let fixture: ComponentFixture<HeroGreetingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeroGreetingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeroGreetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
