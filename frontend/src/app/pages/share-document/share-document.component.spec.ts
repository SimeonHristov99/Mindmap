import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareDocumentComponent } from './share-document.component';

describe('ShareDocumentComponent', () => {
  let component: ShareDocumentComponent;
  let fixture: ComponentFixture<ShareDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShareDocumentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
