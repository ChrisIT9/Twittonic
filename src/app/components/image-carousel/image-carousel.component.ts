import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-image-carousel',
  templateUrl: './image-carousel.component.html',
  styleUrls: ['./image-carousel.component.scss'],
})
export class ImageCarouselComponent implements OnInit {
  @Input() mediaUrls: { url: string, type: string }[];
  currentUrl: string;
  currentIndex: number;
  display: boolean;

  constructor() { }

  ngOnInit() {
    this.currentUrl = this.mediaUrls[0]?.url;
    this.currentIndex = 0;
    this.display = this.mediaUrls.every(url => url.type !== "video")
  }

  next() {
    if (this.currentIndex === this.mediaUrls.length - 1) this.currentIndex = 0;
    else this.currentIndex++;

    this.currentUrl = this.mediaUrls[this.currentIndex].url;
  }

  previous() {
    if (this.currentIndex === 0) this.currentIndex = this.mediaUrls.length - 1;
    else this.currentIndex--;

    this.currentUrl = this.mediaUrls[this.currentIndex].url;
  }

  isVideo(url: string) {
    return url?.endsWith("mp4");
  }

}
