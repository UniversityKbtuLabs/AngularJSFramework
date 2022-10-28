import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { OperationsService } from '@core/services/operations.service';
import { HelperService } from '@app/core/services/helper.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ob-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistogramComponent implements OnInit {
  @Input() periodType: string = '';
  @Input() startDate: Date = null;
  @Input() endDate: Date = null;
  @Input() currencySell: any = null;
  @Input() currencyBuy: any = null;
  actualCurrencyRateBuy: any = null;
  actualCurrencyRateSell: any = null;
  historyRates: any[] = [];

  verticalMarkSet: any[] = [];
  horizontalMarkSet: any[] = [];

  verticalData: number[] = [];
  dataPositionX: number[] = [];
  dataPositionY: number[] = [];

  minValue: number = 0; // минимальная сумма на шкале
  maxValue: number = 0; // максимальная сумма на шкале

  @ViewChild('tooltipElement') tooltipElement: ElementRef;
  showTooltip: boolean = false;
  tooltipTop: number = 0;
  tooltipleft: number = 0;
  tooltipRate: number = 0;
  tooltipDate: Date = null;

  constructor(
    private operationsService: OperationsService,
    private changeDetector: ChangeDetectorRef,
    public helperService: HelperService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.getHistoryRates();

    // this.verticalData = [2, 0.5, 3.6, 1.4, 4.9, 0.5, 2, 4.8, 1]
    // this.verticalData = this.getValuesForCurvilinear(this.verticalData)
    // this.drawCurvilinearHistogramm()
    // this.drawСurves()
  }

  drawLinearHistogramm() {
    let canvas: any = document.getElementsByClassName(
      'histogram_graph_main'
    )[0];
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 1270, 200);
    let canvas1: any = document.getElementsByClassName(
      'histogram_graph_main'
    )[1];
    let ctx1 = canvas1.getContext('2d');
    ctx1.clearRect(0, 0, 1270, 200);
    this.showTooltip = false;

    ctx.beginPath();
    let beginX: number = 0;
    let beginY: number = this.verticalData[0];
    let relativepositionX1 = 0;
    let relativepositionX2 = 0;
    for (let i = 0; i < this.verticalData.length; i++) {
      moveTo(this.getPositionXScale(beginX), this.getPositionYScale(beginY));
      relativepositionX1 = (i / this.verticalData.length) * 8;
      relativepositionX2 = ((i + 1) / this.verticalData.length) * 8;
      this.dataPositionX.push(this.getPositionXScale(relativepositionX1));
      this.dataPositionY.push(this.getPositionYScale(this.verticalData[i]));
      ctx.quadraticCurveTo(
        this.getPositionXScale(relativepositionX1),
        this.getPositionYScale(this.verticalData[i]),
        this.getPositionXScale(relativepositionX2),
        this.getPositionYScale(this.verticalData[i + 1])
      );
      beginX = relativepositionX1;
      beginY = this.verticalData[i];
    }
    ctx.quadraticCurveTo(
      this.getPositionXScale(beginX),
      this.getPositionYScale(beginY),
      this.getPositionXScale(this.horizontalMarkSet.length),
      this.getPositionYScale(0)
    );
    ctx.quadraticCurveTo(
      this.getPositionXScale(this.horizontalMarkSet.length - 1),
      this.getPositionYScale(0),
      this.getPositionXScale(0),
      this.getPositionYScale(0)
    );
    ctx.quadraticCurveTo(
      this.getPositionXScale(0),
      this.getPositionYScale(0),
      this.getPositionXScale(0),
      this.getPositionYScale(0)
    );
    var grd = ctx.createLinearGradient(0, 0, 0, 300);
    grd.addColorStop(0, 'rgba(17, 187, 145, 0.2)');
    grd.addColorStop(1, 'rgba(17, 187, 145, 0)');
    ctx.fillStyle = grd;
    ctx.fill();
  }

  drawLine() {
    let canvas: any = document.getElementsByClassName(
      'histogram_graph_main'
    )[0];
    let ctx = canvas.getContext('2d');

    ctx.beginPath();
    let beginX: number = 0;
    let beginY: number = this.verticalData[0];
    let relativepositionX1 = 0;
    let relativepositionX2 = 0;
    for (let i = 0; i < this.verticalData.length; i++) {
      moveTo(this.getPositionXScale(beginX), this.getPositionYScale(beginY));
      relativepositionX1 = (i / this.verticalData.length) * 8;
      relativepositionX2 = ((i + 1) / this.verticalData.length) * 8;
      ctx.quadraticCurveTo(
        this.getPositionXScale(relativepositionX1),
        this.getPositionYScale(this.verticalData[i]),
        this.getPositionXScale(relativepositionX2),
        this.getPositionYScale(this.verticalData[i + 1])
      );
      beginX = relativepositionX1;
      beginY = this.verticalData[i];
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#11BB91';
    ctx.stroke();
  }

  drawCurvilinearHistogramm() {
    let canvas: any = document.getElementsByClassName(
      'histogram_graph_main'
    )[0];
    let ctx = canvas.getContext('2d');

    ctx.beginPath();
    let beginX: number = 0;
    let beginY: number = this.verticalData[0];
    for (let i = 0; i < this.verticalData.length; i++) {
      moveTo(this.getPositionXScale(beginX), this.getPositionYScale(beginY));
      ctx.quadraticCurveTo(
        this.getPositionXScale(i),
        this.getAnglContextPositionY(
          this.verticalData[i],
          this.verticalData[i + 1]
        ),
        this.getAnglPositionX(i, i + 1),
        this.getAnglPositionY(this.verticalData[i], this.verticalData[i + 1])
      );
      beginX = i;
      beginY = this.verticalData[i];
    }
    ctx.quadraticCurveTo(
      this.getPositionXScale(beginX),
      this.getPositionYScale(beginY),
      this.getPositionXScale(this.horizontalMarkSet.length),
      this.getPositionYScale(0)
    );
    ctx.quadraticCurveTo(
      this.getPositionXScale(this.horizontalMarkSet.length - 1),
      this.getPositionYScale(0),
      this.getPositionXScale(0),
      this.getPositionYScale(0)
    );
    ctx.quadraticCurveTo(
      this.getPositionXScale(0),
      this.getPositionYScale(0),
      this.getPositionXScale(0),
      this.getPositionYScale(0)
    );
    var grd = ctx.createLinearGradient(0, 0, 0, 300);
    grd.addColorStop(0, 'rgba(17, 187, 145, 0.2)');
    grd.addColorStop(1, 'rgba(227,255,246,0)');
    ctx.fillStyle = grd;
    ctx.fill();
  }

  drawСurves() {
    let canvas: any = document.getElementsByClassName(
      'histogram_graph_main'
    )[0];
    let ctx = canvas.getContext('2d');

    ctx.beginPath();
    let beginX: number = 0;
    let beginY: number = this.verticalData[0];
    for (let i = 0; i < this.verticalData.length; i++) {
      moveTo(this.getPositionXScale(beginX), this.getPositionYScale(beginY));
      ctx.quadraticCurveTo(
        this.getPositionXScale(i),
        this.getAnglContextPositionY(
          this.verticalData[i],
          this.verticalData[i + 1]
        ),
        this.getAnglPositionX(i, i + 1),
        this.getAnglPositionY(this.verticalData[i], this.verticalData[i + 1])
      );
      beginX = i;
      beginY = this.verticalData[i];
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#11BB91';
    ctx.stroke();
  }

  getPositionXScale(positionX: number) {
    let canvas: any = document.getElementsByClassName(
      'histogram_graph_main'
    )[0];
    return positionX * (canvas.width / this.horizontalMarkSet.length);
  }

  getPositionYScale(positionY: number) {
    let canvas: any = document.getElementsByClassName(
      'histogram_graph_main'
    )[0];
    return (
      canvas.height +
      25 -
      positionY * (canvas.height / this.verticalMarkSet.length)
    );
  }

  getAnglPositionX(firstVal: number, secondVal: number) {
    let canvas: any = document.getElementsByClassName(
      'histogram_graph_main'
    )[0];
    return (
      ((firstVal + secondVal) / 2) *
      (canvas.width / this.horizontalMarkSet.length)
    );
  }

  getAnglPositionY(firstVal: number, secondVal: number) {
    let canvas: any = document.getElementsByClassName(
      'histogram_graph_main'
    )[0];
    if (firstVal > secondVal) {
      return (
        canvas.height +
        25 -
        ((secondVal + firstVal) / 2) *
          (canvas.height / this.verticalMarkSet.length)
      );
    } else {
      return (
        canvas.height +
        25 -
        ((secondVal + firstVal) / 2) *
          (canvas.height / this.verticalMarkSet.length)
      );
    }
  }

  getAnglContextPositionY(firstVal: number, secondVal: number) {
    let canvas: any = document.getElementsByClassName(
      'histogram_graph_main'
    )[0];
    let actualValue: number = 0;
    if (firstVal > secondVal) {
      return (
        canvas.height +
        25 -
        firstVal * (canvas.height / this.verticalMarkSet.length)
      );
    } else {
      return (
        canvas.height +
        25 -
        firstVal * (canvas.height / this.verticalMarkSet.length)
      );
    }
  }

  getValuesForCurvilinear(data: number[]): number[] {
    let dataForCurvilinear: number[] = [];
    for (let i: number = 0; i < data.length; i++) {
      if (i !== 0 && i !== data.length - 1) {
        if (data[i - 1] > data[i] && data[i] < data[i + 1]) {
          // let value1: number = 0
          // let value2: number = 0
          // value1 = (data[i - 1] + data[i]) / 2
          // value2 = (data[i + 1] + data[i]) / 2
          // value1 = (value1 - data[i])
          // value2 = (value2 - data[i])
          // if (value2 < value1) {
          //     dataForCurvilinear.push(data[i] - (value1 - value2))
          // } else if (value1 < value2) {
          //     dataForCurvilinear.push(data[i] - (value2 - value1))
          // }
          dataForCurvilinear.push(data[i] - 0.5);
        } else if (data[i - 1] < data[i] && data[i] > data[i + 1]) {
          // let value1: number = 0
          // let value2: number = 0
          // value1 = (data[i - 1] + data[i]) / 2
          // value2 = (data[i + 1] + data[i]) / 2
          // value1 = (data[i] - value1)
          // value2 = (data[i] - value2)
          // if (value2 < value1) {
          //     dataForCurvilinear.push(data[i] + value2)
          // } else if (value1 < value2) {
          //     dataForCurvilinear.push(data[i] + value1)
          // }
          dataForCurvilinear.push(data[i] + 0.5);
        } else {
          dataForCurvilinear.push(data[i]);
        }
      } else {
        dataForCurvilinear.push(data[i]);
      }
    }
    return dataForCurvilinear;
  }

  //основной метод для получения данных
  getHistoryRates() {
    this.operationsService.fxHistoryRates.subscribe(value => {
      this.historyRates = value;
      this.getActualCurrencyRate();
      this.calculateVerticalMarkSet();
      this.calculateHorizontalMarkSet();
      this.calculateDataForHistogram();
      this.drawLinearHistogramm();
      this.drawLine();
      this.changeDetector.detectChanges();
    });
  }

  // вычисляем вертикальную шкалу сумм
  private calculateVerticalMarkSet() {
    this.maxValue = this.getVerticalMarksetMaxvalue();
    this.minValue = this.getVerticalMarksetMinValue();
    let interval = (this.maxValue - this.minValue) / 3;
    this.verticalMarkSet = [];
    this.verticalMarkSet.push(this.maxValue.toFixed(2));
    this.verticalMarkSet.push((this.minValue + 2 * interval).toFixed(2));
    this.verticalMarkSet.push((this.minValue + interval).toFixed(2));
    this.verticalMarkSet.push(this.minValue.toFixed(2));
  }

  // вычисляем горизонтальную шкалу периодов
  private calculateHorizontalMarkSet() {
    let minDate = new Date(this.historyRates[0]?.date);
    let maxDate = new Date(
      this.historyRates[this.historyRates.length - 1]?.date
    );
    if (this.periodType === 'eightHours') {
    } else if (this.periodType === 'day') {
    } else if (this.periodType === 'week') {
    } else if (this.periodType === 'month') {
    } else if (this.periodType === 'year') {
    }
    this.getHorizontalmarkSetForMonth(minDate, maxDate);
  }

  // вычисляем данные которые нужны для гистограммы
  calculateDataForHistogram() {
    this.verticalData = [];
    this.dataPositionX = [];
    this.dataPositionY = [];
    if (this.maxValue === this.minValue) {
      for (let i: number = 0; i < this.historyRates.length; i++) {
        this.verticalData.push(2);
      }
    } else {
      let maxMinDif = this.maxValue - this.minValue;
      let minValDif = 0;
      let relativeValue = 0;
      if (!this.actualCurrencyRateBuy && this.actualCurrencyRateSell) {
        for (let i: number = 0; i < this.historyRates.length; i++) {
          minValDif = this.historyRates[i].sellPrice - this.minValue;
          relativeValue = (minValDif * 4) / maxMinDif;
          relativeValue =
            relativeValue >= 1 ? relativeValue : relativeValue + 1;
          this.verticalData.push(relativeValue);
        }
      } else {
        for (let i: number = 0; i < this.historyRates.length; i++) {
          minValDif = this.historyRates[i].buyPrice - this.minValue;
          relativeValue = (minValDif * 4) / maxMinDif;
          relativeValue =
            relativeValue >= 1 ? relativeValue : relativeValue + 1;
          this.verticalData.push(relativeValue);
        }
      }
    }
  }

  getActualCurrencyRate() {
    if (this.currencySell && this.currencyBuy) {
      if (
        this.historyRates[0]?.mainCurrency === this.currencySell.code &&
        this.historyRates[0]?.counterCurrency === this.currencyBuy.code
      ) {
        this.actualCurrencyRateBuy = this.historyRates[0];
        this.actualCurrencyRateSell = null;
      } else if (
        this.historyRates[0]?.mainCurrency === this.currencyBuy.code &&
        this.historyRates[0]?.counterCurrency === this.currencySell.code
      ) {
        this.actualCurrencyRateSell = this.historyRates[0];
        this.actualCurrencyRateBuy = null;
      }
    }
  }

  private getVerticalMarksetMaxvalue() {
    let value = -1000000;
    if (!this.actualCurrencyRateBuy && this.actualCurrencyRateSell) {
      for (let i: number = 0; i < this.historyRates.length; i++) {
        if (this.historyRates[i].sellPrice > value) {
          value = this.historyRates[i].sellPrice;
        }
      }
    } else {
      for (let i: number = 0; i < this.historyRates.length; i++) {
        if (this.historyRates[i].buyPrice > value) {
          value = this.historyRates[i].buyPrice;
        }
      }
    }
    return value;
  }

  private getVerticalMarksetMinValue() {
    let value = 1000000;
    if (!this.actualCurrencyRateBuy && this.actualCurrencyRateSell) {
      for (let i: number = 0; i < this.historyRates.length; i++) {
        if (this.historyRates[i].sellPrice < value) {
          value = this.historyRates[i].sellPrice;
        }
      }
    } else {
      for (let i: number = 0; i < this.historyRates.length; i++) {
        if (this.historyRates[i].buyPrice < value) {
          value = this.historyRates[i].buyPrice;
        }
      }
    }
    return value;
  }

  getCurrency() {
    return this.helperService.formatCurrency(
      this.actualCurrencyRateBuy?.counterCurrency ||
        this.actualCurrencyRateSell?.counterCurrency
    );
  }

  getHorizontalmarkSetForMonth(minDate: Date, maxDate: Date) {
    this.horizontalMarkSet = [];
    let millisecondsDifference: number = maxDate.getTime() - minDate.getTime(); //разница милисекунд
    let timeInterval = millisecondsDifference / 8; //Интервал на шкале времени
    this.horizontalMarkSet.push(minDate);
    for (let i = 1; i <= 6; i++) {
      let date = new Date(minDate.getTime() + i * timeInterval);
      this.horizontalMarkSet.push(date);
    }
    // this.horizontalMarkSet.push(maxDate);
  }

  getMonth(monthNumber: number) {
    if (monthNumber) {
      const indexedMonth = monthNumber + 1;
      let month = `0${indexedMonth}`;
      if (indexedMonth >= 10) {
        month = `${indexedMonth}`;
      }
      return this.translate.instant(this.helperService.getMonth(month));
    } else {
      return '';
    }
  }

  onMouseMove($event: any) {
    let canvas1: any = document.getElementsByClassName(
      'histogram_graph_main'
    )[1];

    let verticalMarks = document
      .getElementsByClassName('histogram_main_vertical_mark')[0]
      .getBoundingClientRect();

    let ctx1 = canvas1.getContext('2d');
    const rect = canvas1.getBoundingClientRect();
    for (let i = 0; i < this.dataPositionX.length; i++) {
      let mouseX =
        (($event.clientX - rect.left) / (rect.right - rect.left)) *
        canvas1.width;
      if (
        this.dataPositionX[i] - 5 <= mouseX &&
        mouseX <= this.dataPositionX[i] + 5
      ) {
        this.showTooltip = true;
        ctx1.clearRect(0, 0, 1270, 200);
        this.tooltipleft =
          this.dataPositionX[i] * (ctx1.canvas.clientWidth / 1270) +
          verticalMarks.width -
          4 -
          this.tooltipElement?.nativeElement.offsetWidth / 2;
        this.tooltipTop = this.dataPositionY[i] - 90;
        this.drawCircle(
          this.dataPositionX[i],
          this.dataPositionY[i],
          5,
          5,
          '#11BB91',
          ctx1
        );
        if (!this.actualCurrencyRateBuy && this.actualCurrencyRateSell) {
          this.tooltipRate = this.historyRates[i].sellPrice;
        } else {
          this.tooltipRate = this.historyRates[i].buyPrice;
        }
        this.tooltipDate = new Date(this.historyRates[i].date);
        break;
      }
    }
  }

  getTooltipHoursAndMinutes(): string {
    let hours: number = this.tooltipDate.getHours();
    let minutes: number = this.tooltipDate.getMinutes();
    let stringHours: string =
      hours === 0 || hours < 10 ? '0' + hours : String(hours);
    let stringMinutes: string =
      minutes === 0 || minutes < 10 ? '0' + minutes : String(minutes);
    return stringHours + ':' + stringMinutes;
  }

  getTooltipRate() {
    if (this.tooltipRate) {
      return this.tooltipRate.toFixed(2);
    } else {
      return 0;
    }
  }

  drawCircle(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    color: string,
    ctx: any
  ) {
    ctx.beginPath();
    ctx.ellipse(x, y, radiusX, radiusY, Math.PI, 0, Math.PI * 2, true);
    ctx.fillStyle = color;
    ctx.fill();
  }

  drawRectwithRadius(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    color: string,
    ctx: any
  ) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
}
