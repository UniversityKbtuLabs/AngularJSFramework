import {Component, OnInit} from '@angular/core';
import {Dish} from "../shared/models/Dish";
import {DishService} from "../services/dish.service";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  public dishes: Dish[] = [];
  public selectedDish: Dish | undefined;

  constructor(private dishService: DishService) {
  }

  ngOnInit(): void {
    this.dishes = this.dishService.dishes;
    this.selectedDish = this.dishes[0];
  }

  selectDish(dish: Dish) {
    this.selectedDish = dish;
  }
}

