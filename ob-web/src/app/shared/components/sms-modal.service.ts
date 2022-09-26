import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '@env/environment';
import { GET_SMS, SEND_BY_SMS_CODE } from '@app/core/constants/apiUrls';
import { IP2PSecuredRequest } from '@app/data/models/p2p-types';

@Injectable({
  providedIn: 'root',
})
export class SmsModalService {
  constructor(private http: HttpClient) {}

  getSms(phone: string) {
    return this.http.get(`${environment.baseUrl}${GET_SMS}${phone}`);
  }

  sendBySmsCode(dto: IP2PSecuredRequest) {
    return this.http.post(
      `${environment.baseUrlForP2P}${SEND_BY_SMS_CODE}`,
      dto
    );
  }
}
