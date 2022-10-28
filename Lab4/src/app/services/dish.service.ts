import {Injectable} from '@angular/core';
import {Dish} from "../shared/models/Dish";

@Injectable({
  providedIn: 'root'
})
export class DishService {
  public dishes: Dish[] = [
    {
      id: '0',
      name: 'Uthappizza',
      image: '/assets/images/uthappizza.png',
      category: 'mains',
      featured: true,
      label: 'Hot',
      price: '4.99',
      description: 'A unique combination of Indian Uthappam (pancake) and Italian pizza, topped with Cerignola olives, ripe vine cherry tomatoes, Vidalia onion, Guntur chillies and Buffalo Paneer.',
      comments: [
        {
          rating: 5,
          text: 'Imagine all the eatables, living in conFusion!',
          author: 'John Lemon',
          date: '2012-10-16T17:57:28.556094Z'
        }, {
          rating: 4,
          text: 'Sends anyone to heaven, I wish I could get my mother-in-law to eat it!',
          author: 'Paul McVites',
          date: '2014-09-05T17:57:28.556094Z'
        }
      ]
    }, {
      id: '1',
      name: 'Zucchipakoda',
      image: '/assets/images/zucchipakoda.png',
      category: 'appetizer',
      featured: false,
      label: '',
      price: '1.99',
      description: 'Deep fried Zucchini coated with mildly spiced Chickpea flour batter accompanied with a sweet-tangy tamarind sauce',
      comments: [
        {
          rating: 3,
          text: 'Eat it, just eat it!',
          author: 'Michael Jaikishan',
          date: '2015-02-13T17:57:28.556094Z'
        }, {
          rating: 4,
          text: 'Ultimate, Reaching for the stars!',
          author: 'Ringo Starry',
          date: '2013-12-02T17:57:28.556094Z'
        }
      ]
    }, {
      id: '2',
      name: 'Vadonut',
      image: '/assets/images/vadonut.png',
      category: 'appetizer',
      featured: false,
      label: 'New',
      price: '1.99',
      description: 'A quintessential ConFusion experience, is it a vada or is it a donut?',
      comments: [
        {
          rating: 2,
          text: 'It\'s your birthday, we\'re gonna party!',
          author: '25 Cent',
          date: '2011-12-02T17:57:28.556094Z'
        }
      ]
    }
  ]

  constructor() {
  }

  getDish(id: string): Dish {
    return this.dishes.filter((dish) => (dish.id === id))[0];
  }

  getFeaturedDish(): Dish {
    return this.dishes.filter((dish) => dish.featured)[0];
  }
}
