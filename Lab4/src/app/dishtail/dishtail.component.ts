import {Component, Input, OnInit} from '@angular/core';
import {Dish} from "../shared/models/Dish";

@Component({
  selector: 'app-dishtail',
  templateUrl: './dishtail.component.html',
  styleUrls: ['./dishtail.component.scss']
})
export class DishtailComponent implements OnInit {
  @Input() dish: Dish | undefined;

  constructor() {
  }

  ngOnInit(): void {
  }

}
