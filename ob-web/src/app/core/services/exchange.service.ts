import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { IExchange } from '@app/data/models/exchange-types';
import { BehaviorSubject, Observable } from 'rxjs';
import { GET_EXCHANGE } from '@core/constants/apiUrls';

@Injectable({
  providedIn: 'root',
})
export class ExchangeService {
  public exchangeLoading = new BehaviorSubject<boolean>(false);
  exchangeLoadingStatus: Observable<boolean> =
    this.exchangeLoading.asObservable();

  constructor(private http: HttpClient) {}

  setExchangeLoading(value: boolean): void {
    this.exchangeLoading.next(value);
  }

  getExchanges(): Observable<IExchange[]> {
    this.setExchangeLoading(true);
    return this.http.get<IExchange[]>(`${environment.baseUrl}${GET_EXCHANGE}`);
  }
}
