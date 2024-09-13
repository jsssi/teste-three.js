import { ComponentFixture, TestBed } from '@angular/core/testing';

import {ModelViewerComponent as App3DComponentComponent} from './app-3-d-component.component';

describe('App3DComponentComponent', () => {
  let component: App3DComponentComponent;
  let fixture: ComponentFixture<App3DComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App3DComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(App3DComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
