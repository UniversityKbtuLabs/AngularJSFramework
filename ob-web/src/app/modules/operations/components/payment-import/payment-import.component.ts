/* eslint-disable max-len */
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  HostListener,
  ViewChild,
} from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AccountHistoryService } from '@app/core/services/account-history.service';
import { HelperService } from '@app/core/services/helper.service';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder } from '@angular/forms';
import { HttpHeaders } from '@angular/common/http';
import { DocumentService } from '@app/core/services/document.service';
import { ToastrService } from 'ngx-toastr';
import { errorMessage, getIn, successMessage } from '@app/core/helpers';
import { Subscription } from 'rxjs';
@Component({
  selector: 'ob-payment-import-modal',
  templateUrl: './payment-import.component.html',
  styleUrls: ['./payment-import.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentImportModalComponent implements OnInit, OnDestroy {
  public modalTitle: string;
  public docTypes: any;
  public docType: string = '1C';
  // myGroup: FormGroup
  public loading: boolean = false;
  public error: string = '';
  public file: File = null;
  public fileOver: boolean = false;
  public fileList: File[] = [];
  public fileNames: any[] = [];
  public successMsg: string = '';
  public draftMsg: string = '';
  public uploadSubscr: Subscription;
  @ViewChild('fileInput') inputFile: any;

  constructor(
    private fb: FormBuilder,
    public bsModalRef: BsModalRef,
    public dischargeHistoryService: AccountHistoryService,
    private changeDetector: ChangeDetectorRef,
    public helperService: HelperService,
    public activatedRoute: ActivatedRoute,
    private translate: TranslateService,
    private documentService: DocumentService,
    private toastr: ToastrService
  ) {
    this.uploadFile = this.uploadFile.bind(this);
  }

  ngOnInit(): void {
    //this.docTypes = [{ code: '1C', label: '1C' }, { code: 'MT940', label: 'MT940' }]
    this.docTypes = [{ code: '1C', label: '1C' }];
    this.translate.get(['default.payment_import']).subscribe(translations => {
      this.modalTitle = translations['default.payment_import'];
    });
    this.getTranslations();
  }

  ngOnDestroy(): void {
    if (this.uploadSubscr) {
      this.uploadSubscr.unsubscribe();
    }
  }

  getTranslations() {
    this.translate
      .get(['operations.imports.success', 'operations.imports.drafts'])
      .subscribe(translations => {
        this.successMsg = translations['operations.imports.success'];
        this.draftMsg = translations['operations.imports.drafts'];
      });
  }

  @HostListener('dragover', ['$event']) onDragOver(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.fileOver = true;
  }

  @HostListener('drop', ['$event']) onDrop(event: Event) {
    event.stopPropagation();
    this.fileOver = false;
  }

  closeModal() {
    this.bsModalRef.hide();
  }

  changeDocType(type: any) {
    this.docType = type;
    this.error = '';
    this.file = null;
    this.inputFile.nativeElement.value = '';
  }

  fileChange(event: any) {
    // this.file = null
    this.error = '';
    this.file = event.target.files[0];
    this.inputFile.nativeElement.value = '';
    // let currentFileType = this.getFileType(event.target.files[0])
    // if (currentFileType === this.docType) {
    //   this.error = "";
    //   this.file = event.target.files[0];
    //   this.inputFile.nativeElement.value = "";
    // } else {
    //   this.error = "Максимальный размер файла: 5 МБ. Допустимое расширение: ." + this.docType
    //   this.inputFile.nativeElement.value = "";
    // }
  }

  getFileType(file: File): string {
    let result = file.name.split('.');
    return result[result.length - 1];
  }

  uploadFile(): void {
    if (this.file !== null) {
      let formData: FormData = new FormData();
      //formData.append("file", this.fileList[i], this.fileList[i].name);
      formData.append('file', this.file, this.file.name);
      let headers = new HttpHeaders();
      headers.append('Content-Type', 'multipart/form-data');
      headers.append('Accept', 'application/json');
      this.loading = true;
      // TODO: (Review) Тут создается подписка на "uploadPayment" и потом не удаляется
      this.uploadSubscr = this.documentService
        .uploadPayment(formData, headers)
        .subscribe({
          next: (data: any) => {
            this.loading = false;
            if (getIn(data, 'sendDocumentCounter') > 0) {
              successMessage(this.successMsg, this.toastr);
            }
            if (data.errors && data.errors.length > 0) {
              let messages: string[] = [];
              data.errors.forEach((e: any) => {
                let title = '';
                if (e.title) {
                  title = `${e.title}: `;
                }
                const err = `${title}${e.text}`;
                //messages.push(err);
                errorMessage({ error: { messages: [err] } }, this.toastr);
              });
            }
            if (getIn(data, 'saveDocumentCounterWithError') > 0) {
              const msg = `${this.draftMsg}: ${getIn(
                data,
                'saveDocumentCounterWithError'
              )}`;
              errorMessage({ error: { messages: [msg] } }, this.toastr);
            }

            this.changeDetector.detectChanges();
          },
          error: err => {
            this.loading = false;
            this.changeDetector.detectChanges();
            errorMessage(this.successMsg, this.toastr);
          },
        });
      //  }
      // }
    }
  }

  deleteDoc() {
    //  this.fileList.splice(id, 1);
    //  this.fileNames.splice(id, 1);
    this.file = null;
  }
}
