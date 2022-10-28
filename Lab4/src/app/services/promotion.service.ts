import {Injectable} from '@angular/core';
import {Promotion} from "../shared/models/Promotion";
import {PROMOTIONS} from "../shared/hardcode/Promotion";

@Injectable({
  providedIn: 'root'
})
export class PromotionService {

  constructor() {
  }

  getPromotions(): Promotion[] {
    return PROMOTIONS;
  }

  getPromotion(id: string): Promotion {
    return PROMOTIONS.filter((promo) => (promo.id === id))[0];
  }

  getFeaturedPromotion(): Promotion {
    return PROMOTIONS.filter((promotion) => promotion.featured)[0];
  }
}
