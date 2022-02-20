import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TweetSettingsPopoverComponent } from './tweet-settings-popover.component';

describe('TweetSettingsPopoverComponent', () => {
  let component: TweetSettingsPopoverComponent;
  let fixture: ComponentFixture<TweetSettingsPopoverComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TweetSettingsPopoverComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TweetSettingsPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
