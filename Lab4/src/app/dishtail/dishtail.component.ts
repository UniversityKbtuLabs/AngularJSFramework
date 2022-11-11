import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {Dish} from "../shared/models/Dish";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {DishService} from "../services/dish.service";
import {switchMap} from "rxjs";

@Component({
  selector: 'app-dishtail',
  templateUrl: './dishtail.component.html',
  styleUrls: ['./dishtail.component.scss']
})
export class DishtailComponent implements OnInit {
  public dish: Dish | undefined
  dishIds: string[];
  prev: string;
  next: string;

  constructor(private activatedRoute: ActivatedRoute, private dishService: DishService, private router: Router, private changeDetector: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.dishService.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.activatedRoute.params.subscribe((params: Params) => {
        this.dish = null
        this.dishService.getDish(params['id']).subscribe(dish => {
          this.dish = dish;
          this.setPrevNext(dish.id);
        });
      }
    )
  }

  goToMenu() {
    this.router.navigate(['menu'])
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }
}
