import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  public path: string[] = [];

  constructor(private router: Router) {
  }

  ngOnInit(): void {
    this.routerEventsSubscribe()
  }

  routerEventsSubscribe() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.path = event.url.split('/')
      }
    });
  }
}
