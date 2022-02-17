import { Component, Input, OnInit } from '@angular/core';
import { HTMLObject } from 'src/app/typings/HTMLObject';

@Component({
  selector: 'app-formatted-html-objects',
  templateUrl: './formatted-html-objects.component.html',
  styleUrls: ['./formatted-html-objects.component.scss'],
})
export class FormattedHtmlObjectsComponent implements OnInit {

  @Input() htmlObjects: HTMLObject[];

  constructor() { }

  ngOnInit() {}

}
