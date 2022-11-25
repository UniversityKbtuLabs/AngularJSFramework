import {Component, OnInit} from '@angular/core';
import {Dish} from "../shared/models/Dish";
import {Promotion} from "../shared/models/Promotion";
import {DishService} from "../services/dish.service";
import {PromotionService} from "../services/promotion.service";
import {baseURL} from "../shared/baseurl";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public dish: Dish | undefined;
  public promotion: Promotion | undefined;
  public baseUrl = baseURL

  constructor(private dishService: DishService, private promotionService: PromotionService) {
  }

  ngOnInit(): void {
    this.dishService.getFeaturedDish().subscribe((dish: Dish) => {
      this.dish = dish
    }, error => {
      console.log(error)
    });
    this.promotion = this.promotionService.getFeaturedPromotion();
  }

}
