import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class HttpCancelService {
  public pendingHTTPRequests$ = new Subject<void>();

  constructor() {}

  // Cancel Pending HTTP calls
  public cancelPendingRequests() {
    this.pendingHTTPRequests$.next();
  }

  public onCancelPendingRequests() {
    return this.pendingHTTPRequests$.asObservable();
  }
}
