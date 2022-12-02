import {Component, OnInit} from '@angular/core';
import {Dish} from "../shared/models/Dish";
import {DishService} from "../services/dish.service";
import {Router} from "@angular/router";
import {baseURL} from "../shared/baseurl";
import {expand, flyInOut} from "../animations/animation";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  host: {'[@flyInOut]': 'true', 'style': 'display: block;'},
  animations: [flyInOut(), expand()]
})
export class MenuComponent implements OnInit {

  public dishes: Dish[] = [];
  public selectedDish: Dish | undefined;
  public baseUrl = baseURL
  errMess: string;

  constructor(private dishService: DishService, private router: Router) {
  }

  ngOnInit(): void {
    this.dishService.getDishes().subscribe((value: Dish[]) => {
      this.dishes = value;
      this.selectedDish = this.dishes[0];
    }, error => {
      this.errMess = <any>error
    })
  }

  goToDishPage(dish: Dish) {
    this.selectedDish = dish;
    this.router.navigate([`dishdetail/${dish.id}`])
  }
}

