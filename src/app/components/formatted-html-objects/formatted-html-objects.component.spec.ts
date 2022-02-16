import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FormattedHtmlObjectsComponent } from './formatted-html-objects.component';

describe('FormattedHtmlObjectsComponent', () => {
  let component: FormattedHtmlObjectsComponent;
  let fixture: ComponentFixture<FormattedHtmlObjectsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FormattedHtmlObjectsComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FormattedHtmlObjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
