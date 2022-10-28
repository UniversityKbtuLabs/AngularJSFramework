import {Component, OnDestroy, OnInit} from '@angular/core';
import {CalendarServiceService} from "../../services/calendar-service.service";
import {SubscriptionAccumulator} from "../../helpers/SubscriptionAccumulator";
import {Appointment} from "../../models/Appointment";

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent extends SubscriptionAccumulator implements OnInit, OnDestroy {
  date: Date = new Date()
  weekDays: string[] = [
    'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
  ];

  appointments: Appointment[] = []

  weeksCount: number = 0

  weeks: any[] = [];

  constructor(private calendarService: CalendarServiceService) {
    super();
  }

  ngOnInit(): void {
    this.addSubscriber(
      this.calendarService.appointments$.subscribe(value => {
        this.appointments = value
        this.weeksCount = this.getWeeksCount();
        this.initializeWeeks()
      })
    )
  }

  getDaysCount() {
    let first = new Date(this.date.getFullYear(), this.date.getMonth(), 1);
    let last = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0);

    let daysCount = first.getDay() + last.getDate();
    return daysCount
  }

  getWeeksCount() {
    let weeksCount = Math.ceil(this.getDaysCount() / 7);
    return weeksCount;
  }

  initializeWeeks() {
    for (let i = 0; i < this.weeksCount; ++i) {
      let week: number[] = []
      for (let j = 0; j < 7; j++) {
        week.push((7 * i) + j)
      }
      this.weeks.push(week);
    }
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }

}
