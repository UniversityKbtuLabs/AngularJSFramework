import {Component, OnInit} from '@angular/core';
import {Dish} from "../shared/models/Dish";
import {DishService} from "../services/dish.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  public dishes: Dish[] = [];
  public selectedDish: Dish | undefined;

  constructor(private dishService: DishService, private router: Router) {
  }

  ngOnInit(): void {
    this.dishService.getDishes().then((value: Dish[]) => {
      this.dishes = this.dishService.dishes;
      this.selectedDish = this.dishes[0];
    })
  }

  goToDishPage(dish: Dish) {
    this.selectedDish = dish;
    this.router.navigate([`dishdetail/${dish.id}`])
  }
}

