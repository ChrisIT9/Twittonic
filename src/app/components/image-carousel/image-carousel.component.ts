import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-image-carousel',
  templateUrl: './image-carousel.component.html',
  styleUrls: ['./image-carousel.component.scss'],
})
export class ImageCarouselComponent implements OnInit {
  @Input() imageUrls: string[];
  currentUrl: string;
  currentIndex: number;
  constructor() { }

  ngOnInit() {
    this.currentUrl = this.imageUrls[0];
    this.currentIndex = 0;
  }

  next() {
    if (this.currentIndex === this.imageUrls.length - 1) this.currentIndex = 0;
    else this.currentIndex++;

    this.currentUrl = this.imageUrls[this.currentIndex];
  }

  previous() {
    if (this.currentIndex === 0) this.currentIndex = this.imageUrls.length - 1;
    else this.currentIndex--;

    this.currentUrl = this.imageUrls[this.currentIndex];
  }

}
