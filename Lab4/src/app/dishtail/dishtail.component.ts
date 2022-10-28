import {Component, Input, OnInit} from '@angular/core';
import {Dish} from "../shared/models/Dish";
import {ActivatedRoute, Router} from "@angular/router";
import {DishService} from "../services/dish.service";

@Component({
  selector: 'app-dishtail',
  templateUrl: './dishtail.component.html',
  styleUrls: ['./dishtail.component.scss']
})
export class DishtailComponent implements OnInit {
  public dish: Dish | undefined

  constructor(private activatedRoute: ActivatedRoute, private dishService: DishService, private router: Router) {
  }

  ngOnInit(): void {
    this.dish = this.dishService.getDish(this.activatedRoute.snapshot.params['id'])
    console.log(this.dish)
  }

  goToMenu() {
    this.router.navigate(['menu'])
  }
}
