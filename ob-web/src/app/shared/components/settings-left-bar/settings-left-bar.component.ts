import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { Router } from '@angular/router';
import { ICurrentContract, IUser } from '@data/models/auth-types';
import { useAnimation } from '@angular/animations';
import { daLocale } from 'ngx-bootstrap/chronos';

@Component({
  selector: 'ob-settings-left-bar',
  templateUrl: './settings-left-bar.component.html',
  styleUrls: ['./settings-left-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsLeftBarComponent {
  @Input() btnList: any[] = [];
  @Input() user: IUser;
  @Input() currentContract: ICurrentContract;

  constructor(private router: Router) {}

  // ngOnInit(): void {
  // }

  toPage(path: string) {
    this.router.navigate(['settings/' + path]);
  }

  toNormalName(name: string): string {
    let words: string[] = name.split(' ');
    // Проходимся по имени фамилии отчеству
    for (let i: number = 0; i < words.length; i++) {
      words[i] =
        words[i].charAt(0).toUpperCase() + words[i].toLowerCase().slice(1);
    }
    return words.join(' ');
  }
}
