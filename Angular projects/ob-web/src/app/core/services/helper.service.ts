import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  public currencyControlDescription$ = new BehaviorSubject(true);

  public months: string[] = [
    'date.january',
    'date.february',
    'date.march',
    'date.april',
    'date.may',
    'date.june',
    'date.july',
    'date.august',
    'date.september',
    'date.october',
    'date.november',
    'date.december',
  ];

  getMonth(month: string): string {
    switch (month) {
      case '01':
        return 'date.januarys';
      case '02':
        return 'date.februarys';
      case '03':
        return 'date.marchs';
      case '04':
        return 'date.aprils';
      case '05':
        return 'date.mays';
      case '06':
        return 'date.junes';
      case '07':
        return 'date.julys';
      case '08':
        return 'date.augusts';
      case '09':
        return 'date.septembers';
      case '10':
        return 'date.octobers';
      case '11':
        return 'date.novembers';
      case '12':
        return 'date.decembers';
      default:
        return '';
    }
  }

  constructor(private datePipe: DatePipe) {}

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('ru-RU').format(amount);
  }

  formatIban(iban: string, type: string = 'accounts'): string {
    if (type === 'cards') {
      return '••' + iban.slice(-4);
    } else {
      return iban.slice(0, 4) + '•••' + iban.slice(-4);
    }
  }

  formattedDate(period: any) {
    if (period !== null) {
      return period.split('-').reverse().join('.');
    }
  }
  getAccountIcon(
    currency: string,
    type: string = 'default',
    accountType: string = 'accounts',
    absState: string = ''
  ): string {
    if ((type === 'default' || type === 'Y') && accountType === 'accounts') {
      if (
        absState === 'Без движений' ||
        absState === 'Арестован' ||
        absState === 'Заблокирован' ||
        absState === 'Частично заблокирован'
      ) {
        return `./assets/icons/${currency.toLowerCase()}_disabled.svg`;
      } else {
        return `./assets/icons/${currency.toLowerCase()}_symbol.svg`;
      }
    } else if (
      (type === 'N' || type === 'I' || type === 'D') &&
      (accountType === 'accounts' || accountType === 'cards')
    ) {
      return `./assets/icons/${currency.toLowerCase()}_disabled.svg`;
    } else if (accountType === 'deposits') {
      return `./assets/icons/main_deposit.svg`;
    } else if (accountType === 'credits') {
      return `./assets/icons/credit.svg`;
    } else {
      return `./assets/icons/${currency.toLowerCase()}_symbol.svg`;
    }
  }

  imgError(event: any) {
    event.target.src = 'assets/icons/tenge_symbol.svg';
  }

  getCardIcon(card: string, isBlocked: boolean) {
    if (card[0] === '4') {
      if (isBlocked) {
        return './assets/icons/visa-blocked.svg';
      } else {
        return './assets/icons/ic_visa.svg';
      }
    } else {
      if (isBlocked) {
        return './assets/icons/mastercard-blocked.svg';
      } else {
        return './assets/icons/ic_master_card.svg';
      }
    }
  }

  getDetailAccountIcon(title: string): string {
    switch (title) {
      case 'арестован':
        return './assets/icons/ic_arrested.svg';
      case 'заблокирован':
        return './assets/icons/blocked.svg';
      case 'без движений':
        return './assets/icons/ic_no-movement.svg';
      case 'закрыт':
        return './assets/icons/ic_closed.svg';
      default:
        return '';
    }
  }

  getDetailAccountStatus(title: string): string {
    switch (title) {
      case 'арестован':
        return 'status.arrested';
      case 'заблокирован':
        return 'status.blocked';
      case 'без движений':
        return 'status.no-movement';
      case 'закрыт':
        return 'status.closed';
      default:
        return '';
    }
  }

  formatCurrency(cur: string): string {
    switch (cur) {
      case 'KZT':
        return '₸';
      case 'RUB':
        return '₽';
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      case 'CHF':
        return '₣';
      case 'UZS':
        return 'soʻm';
      case 'AED':
        return 'DH';
      case 'TJS':
        return 'SM';
      case 'SEK':
        return 'kr';
      case 'XAU':
        return 'XAU';
      case 'TRY':
        return '₺';
      case 'CAD':
        return 'C$';
      case 'AUD':
        return 'A$';
      case 'KGS':
        return 'som';
      case 'CNY':
        return '¥';
      case null:
      case 'null':
      case undefined:
      case 'undefined':
      case '':
        return '₸';
      default:
        return cur;
    }
  }

  formatDate(date: string, format: string = null): string {
    const newFormat = format || 'dd.MM.yyyy';

    return this.datePipe.transform(date, newFormat, '', 'en-US');
  }

  ibanSeparator(ibanString: string) {
    if (ibanString) {
      return ibanString.replace(/(\w{4})/g, '$1 ').replace(/(^\s+|\s+$)/, '');
    } else {
      return '';
    }
  }

  capitalizeFirstLetter(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  getCardType(card: string) {
    if (card[0] === '4') {
      return './assets/icons/VISA.svg';
    } else {
      return './assets/icons/MasterCard.svg';
    }
  }

  formatDateMonthYear(date: string): string {
    const newDate = new Date(date);
    let month: string = moment(newDate).locale('ru').format('MMMM YYYY');
    return month[0].toUpperCase() + month.slice(1);
  }

  formattedPeriod(period: string) {
    let result = period.substr(2, 4) + '-' + period.substr(0, 2);
    return result;
  }

  isLeapYear(year: number) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  getDaysInMonth(year: number, month: number) {
    return [
      31,
      this.isLeapYear(year) ? 29 : 28,
      31,
      30,
      31,
      30,
      31,
      31,
      30,
      31,
      30,
      31,
    ][month];
  }
}
