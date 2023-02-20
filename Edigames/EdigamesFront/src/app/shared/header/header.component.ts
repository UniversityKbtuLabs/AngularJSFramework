import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {HelperService} from "../../core/services/helper.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public path: string[] = [];
  public pageButtons = [
    {name: "Главная", path: ""},
    {name: "Игры", path: "games"},
    {name: "Мои игры", path: "my_games"}
  ]

  constructor(private router: Router,
              private helperService: HelperService) {
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

  moveToPage(path: string) {
    this.helperService.backfromAuth$.next(this.path.join('/'))
    this.router.navigate([path])
  }
}
