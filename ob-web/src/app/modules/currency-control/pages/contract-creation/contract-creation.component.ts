import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  HostListener,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CustomvalidationService } from '@app/core/services/customvalidation.service';
import { HelperService } from '@app/core/services/helper.service';
import moment from 'moment';
import {
  dateFormat,
  FILE_SIZE_20MB,
  requestDateFormat,
} from '@app/core/constants';
import { OperationsService } from '@app/core/services/operations.service';
import { DictionaryService } from '@app/core/services/dictionary.service';
import { HttpHeaders } from '@angular/common/http';
import {
  errorMessage,
  formatBytes,
  getIn,
  successMessage,
} from '@app/core/helpers';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { DocumentService } from '@app/core/services/document.service';
import { SmsModalComponent } from '@app/shared';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ActivatedRoute, Router } from '@angular/router';
import { CONFIRM } from '@app/core/constants/pathnames';
import { TranslateService } from '@ngx-translate/core';
import { ItemsList } from '@ng-select/ng-select/lib/items-list';

/* 
  Форма создания контракта
  Дефолтные поля:
   - Валюта
   - Филиал регистрации контракта
   - Номер контракта
   - Дата контракта
   - Контракт
  Состав полей (Сумма до $50.000):
   - Дефолтные поля

  Состав полей (Сумма от $50.000):
   - Дефолтные поля
   - Сумма контракта
   - Тип контракта
   - Предмет контракта
   - Срок репатриации

*/
@Component({
  selector: 'ob-contract-creation',
  templateUrl: './contract-creation.component.html',
  styleUrls: ['./contract-creation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractCreationComponent implements OnInit {
  form: FormGroup;
  isEditDocNum: boolean = false;
  toLabel: string = 'До 50 000 $';
  fromLabel: string = 'От 50 000 $';
  contractType: string = 'to';
  contractTypeList = [
    { code: 'to', label: this.toLabel },
    { code: 'from', label: this.fromLabel },
  ];
  public allowedFileTypes = [
    'pdf',
    'tiff',
    'jpg',
    'png',
    'pcx',
    'doc',
    'docx',
    'txt',
  ];
  currencyContractTypeList: any = [];
  contractSubjectList: any = [];
  //isContractNumber: boolean = true;
  currentDate: string = '';
  contractExpiryInfo: boolean = false;
  contractRegDate: boolean = false;
  currencyContractPrefill: any;
  currencyList: any = [];
  foreignCountryList: any = [];
  thirdPartyTypeList: any = [];
  loading: boolean = false;
  error: boolean = false;
  file: File = null;
  nFile: any = '';
  fileName: string = 'file';
  fileOver: boolean = false;
  fileList: File[] = [];
  fileNames: any[] = [];
  successMsg: string = '';
  draftMsg: string = '';
  uploadSubscr: Subscription;
  @ViewChild('fileInput') inputFile: any;
  countFileSize: number = 0;
  modalRef?: BsModalRef;
  public chiefSigner: string;
  public chiefAccountant: string;
  branchList: any = [];
  maxDate: Date = new Date();
  isCurrencyListLoading: boolean = true;
  isBranchListLoading: boolean = true;
  isCurrencyContractTypeLoading: boolean = true;
  isContractSubjectLoading: boolean = true;
  isforeignCountryLoading: boolean = true;
  isThirdPartyTypeLoading: boolean = true;
  isSendingForm: boolean = false;
  public rightsToSign: boolean = false;
  isCheckingSignRights: boolean = false;
  public emptyFieldsError: string;
  public editTemplate: any = null;
  public fileFormatError: boolean = false;
  public fileMaxSizeError: boolean = false;

  public fullForm: any = {
    creationDate: [''],
    currency: [null, Validators.required],
    contractNumber: [
      null,
      [
        Validators.required,
        this.permittedSymbolValidatorOther,
        this.customValidator.allZeroValidator,
      ],
    ],
    contractDate: [null, Validators.required],
    contractNumberNotExists: [false],
    contractSum: [
      null,
      [Validators.required, this.customValidator.sumZeroValidator],
    ],
    contractType: [null, Validators.required],
    contractSubjectName: [null, Validators.required],
    foreignRepatriationPeriod: [
      null,
      [Validators.required, this.customValidator.repatriationPeriodValidator],
    ],
    foreignName: [
      null,
      [
        Validators.required,
        Validators.maxLength(100),
        this.permittedSymbolValidatorOther,
      ],
    ],
    foreignCountryName: [null, Validators.required],
    isThirdParty: [false],
    thirdPartyName: [
      null,
      [Validators.required, this.permittedSymbolValidatorOther],
    ],
    thirdPartyCntry: [null, Validators.required],
    thirdPartyType: [null, Validators.required],
    clientEmail: [null, [Validators.required, Validators.email]],
    clientAddress: [null, Validators.required],
    clientContacts: [null, Validators.required],
    existCurrencyObligation: [false, Validators.required],
    branch: [null, Validators.required],
    fileDropArea: [null],
  };

  public shortForm: any = {
    creationDate: [''],
    currency: [null, Validators.required],
    branch: [null, Validators.required],
    contractNumber: [
      null,
      [
        Validators.required,
        this.permittedSymbolValidatorOther,
        this.customValidator.allZeroValidator,
      ],
    ],
    contractDate: [null, Validators.required],
    contractNumberNotExists: [false],
    fileDropArea: [null],
  };

  constructor(
    public helperService: HelperService,
    private fb: FormBuilder,
    private customValidator: CustomvalidationService,
    private operationsService: OperationsService,
    public changeDetector: ChangeDetectorRef,
    public dictionaryService: DictionaryService,
    private toastr: ToastrService,
    private documentService: DocumentService,
    private modalService: BsModalService,
    private router: Router,
    private translate: TranslateService,
    private route: ActivatedRoute
  ) {
    this.contractType = 'to';
    this.form = this.fb.group(this.shortForm);
    this.currentDate = moment(new Date()).format(dateFormat);
    this.documentService.currentTemplate$.subscribe(data => {
      if (this.route.snapshot.queryParamMap.get('template')) {
        if (data) {
          this.editTemplate = data;
        }
      }
    });
  }

  ngOnInit(): void {
    this.getTranslations();
    this.getPrefill();
    this.getCurrencies();
    this.getContractTypes();
    this.getContractSubjectList();
    this.getForeignCountryList();
    this.getThirdPartyTypeList();
    this.getChief();
    if (this.editTemplate) {
      this.edit();
    }
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

  @HostListener('dragleave', ['$event']) onDragLeave(event: Event) {
    event.stopPropagation();
    this.fileOver = false;
  }

  getPrefill() {
    this.operationsService.getCurrencyContractPrefill().subscribe(
      (data: any) => {
        this.currencyContractPrefill = data;
        const branchList = data.branch || data.branchList || '';
        this.getBranchList(branchList);
        this.setPrefillData(data);
      },
      (error: any) => {
        ///
      }
    );
    this.changeDetector.detectChanges();
  }

  getCurrencies() {
    this.dictionaryService.getCurrencies().subscribe(
      (data: any) => {
        this.isCurrencyListLoading = false;
        this.currencyList = data.filter(
          (currency: any) => currency.isActiveToShow === 'Y'
        );
        this.changeDetector.detectChanges();
      },
      error => {
        errorMessage(error, this.toastr);
        this.isCurrencyListLoading = false;
      }
    );
  }

  getTranslations() {
    this.translate
      .get([
        'error.empty_fields_present',
        'currencyControl.contract.toLabel',
        'currencyControl.contract.fromLabel',
      ])
      .subscribe(translations => {
        this.emptyFieldsError = translations['error.empty_fields_present'];
        this.toLabel = translations['currencyControl.contract.toLabel'];
        this.fromLabel = translations['currencyControl.contract.fromLabel'];
      });
  }

  getContractTypes() {
    this.dictionaryService.getContractTypes().subscribe(
      (data: any) => {
        this.currencyContractTypeList = data;
        this.isCurrencyContractTypeLoading = false;
        this.changeDetector.detectChanges();
      },
      error => {
        errorMessage(error, this.toastr);
        this.isCurrencyContractTypeLoading = false;
      }
    );
  }

  getContractSubjectList() {
    this.dictionaryService.getSubjectList().subscribe(
      (data: any) => {
        this.contractSubjectList = data;
        this.isContractSubjectLoading = false;
        this.changeDetector.detectChanges();
      },
      error => {
        errorMessage(error, this.toastr);
        this.isContractSubjectLoading = false;
      }
    );
  }

  getForeignCountryList() {
    this.dictionaryService.getForeignCountryList().subscribe(
      (data: any) => {
        this.foreignCountryList = data.content;
        this.isforeignCountryLoading = false;
        this.changeDetector.detectChanges();
      },
      error => {
        errorMessage(error, this.toastr);
        this.isforeignCountryLoading = false;
      }
    );
  }

  getThirdPartyTypeList() {
    this.dictionaryService.getThirdPartyTypeList().subscribe(
      (data: any) => {
        this.thirdPartyTypeList = data;
        this.isThirdPartyTypeLoading = false;
        this.changeDetector.detectChanges();
      },
      error => {
        errorMessage(error, this.toastr);
        this.isThirdPartyTypeLoading = false;
      }
    );
  }

  getChief() {
    this.documentService.firstChiefSigner$.subscribe({
      next: firstChiefSigner => {
        this.chiefSigner = firstChiefSigner.name;
        this.changeDetector.detectChanges();
      },
    });

    this.documentService.accountantSigner$.subscribe({
      next: chiefAccountant => {
        this.chiefAccountant = chiefAccountant.name;
        this.changeDetector.detectChanges();
      },
    });
  }

  getBranchList(list: any) {
    this.dictionaryService.getBranchList().subscribe(
      (data: any) => {
        this.branchList = data.filter((value: any) =>
          list.includes(value.eqCode)
        );
        this.isBranchListLoading = false;
        this.changeDetector.detectChanges();
      },
      error => {
        errorMessage(error, this.toastr);
        this.isBranchListLoading = false;
      }
    );
  }

  setPrefillData(data: any) {
    if (data.creationDate !== null) {
      this.form.patchValue({ creationDate: data.creationDate });
    } else {
      this.form.patchValue({ creationDate: this.currentDate });
    }
    if (!this.editTemplate) {
      this.form.patchValue({
        clientEmail: data.clientEmail !== null ? data.clientEmail : '',
        clientAddress: data.clientAddress !== null ? data.clientAddress : '',
        clientContacts: data.clientContacts !== null ? data.clientContacts : '',
      });
    }
    this.changeDetector.detectChanges();
  }

  changeContractType(type: any) {
    if (this.contractType === type) {
      return;
    }
    this.contractType = type;
    let shortFormData = {
      currency: this.contractFormControl?.currency?.value || null,
      branch: this.contractFormControl?.branch?.value || null,
      contractNumber: this.contractFormControl?.contractNumber?.value || null,
      contractDate: this.contractFormControl?.contractDate?.value || null,
      contractNumberNotExists:
        this.contractFormControl?.contractNumberNotExists?.value || false,
    };

    if (type === 'to') {
      // TODO naming
      this.form = this.fb.group(this.shortForm);
      this.form.patchValue({
        creationDate: this.currentDate,
        currency: shortFormData.currency,
        branch: shortFormData.branch,
        contractNumber: shortFormData.contractNumber,
        contractDate: shortFormData.contractDate,
        contractNumberNotExists: shortFormData.contractNumberNotExists,
      });
    } else {
      this.form = this.fb.group(this.fullForm);
      this.form.patchValue({
        creationDate: this.currentDate,
        currency: shortFormData.currency,
        branch: shortFormData.branch,
        contractNumber: shortFormData.contractNumber,
        contractDate: shortFormData.contractDate,
        contractNumberNotExists: shortFormData.contractNumberNotExists,
      });
      if (!this.editTemplate) {
        this.form.patchValue({
          clientEmail: this.currencyContractPrefill.clientEmail || null,
          clientAddress: this.currencyContractPrefill.clientAddress || null,
          clientContacts: this.currencyContractPrefill.clientContacts || null,
        });
      }
    }
    this.checkSymbolValidation(this.contractFormControl.currency.value);
  }

  get contractFormControl() {
    return this.form.controls;
  }

  displayFieldClass(field: string) {
    // css класс
    return { 'is-invalid': this.isFieldInvalid(field) };
  }

  isFieldInvalid(field: string) {
    // Валидация полей
    const formField = this.form.get(field);
    try {
      return (
        (!formField.valid && formField.touched && !formField.pristine) ||
        (!formField.valid && formField.dirty && !formField.pristine)
      );
    } catch (error) {
      return null;
    }
  }

  getFileType(file: File): string {
    return file.name.split('.').pop();
  }

  getFileFormat(fileName: string): string {
    let result = fileName.split('.');
    return result[result.length - 1];
  }

  validFileType(file: any) {
    return this.allowedFileTypes.includes(file.type);
  }

  // updateImageDisplay(preview: any) {
  //   const input = document.querySelector('input');
  //   while (preview.firstChild) {
  //     preview.removeChild(preview.firstChild);
  //   }

  //   const curFiles: FileList = input.files;

  //   if (curFiles.length === 0) {
  //     const para = document.createElement('p');
  //     para.textContent = 'No files currently selected for upload';
  //     preview.appendChild(para);
  //   } else {
  //     const list = document.createElement('ol');
  //     preview.appendChild(list);

  //     for (const file of [curFiles]) {
  //       const listItem = document.createElement('li');
  //       const para = document.createElement('p');
  //       if (this.validFileType(file)) {
  //         para.textContent = `File name ${file.item.name}`;
  //         const image = document.createElement('img');
  //         image.src = URL.createObjectURL(file);

  //         listItem.appendChild(image);
  //         listItem.appendChild(para);
  //       } else {
  //         para.textContent = `File name ${file.name}: Not a valid file type. Update your selection.`;
  //         listItem.appendChild(para);
  //       }

  //       list.appendChild(listItem);
  //     }
  //   }
  // }

  fileChange(event: any) {
    for (let i = 0; i <= event.target.files.length - 1; i++) {
      let currentFile = event.target.files[i];
      if (
        this.checkFileFormat(currentFile.name) &&
        this.checkFileSize(currentFile.size) &&
        !this.fileNames.includes(currentFile.name)
      ) {
        this.fileList.push(currentFile);
        this.fileNames.push(currentFile.name);
        this.countFileSize += currentFile.size;
        this.fileMaxSizeError = false;
        this.fileFormatError = false;
      }
    }
  }

  checkFileSize(size: number) {
    if (this.countFileSize + size > FILE_SIZE_20MB) {
      this.fileMaxSizeError = true;
      return false;
    } else {
      this.fileMaxSizeError = false;
      return true;
    }
  }

  checkFileFormat(name: string) {
    let format = name.split('.').pop();
    if (this.allowedFileTypes.includes(format)) {
      this.fileFormatError = false;
      return true;
    } else {
      this.fileFormatError = true;
      return false;
    }
  }

  deleteDoc(id: number) {
    if (this.countFileSize >= 0) {
      this.countFileSize -= this.fileList[id]?.size;
    }
    this.fileMaxSizeError = false;
    this.fileFormatError = false;
    this.checkFileSize(this.fileList[id]?.size);
    this.fileList.splice(id, 1);
    this.fileNames.splice(id, 1);
  }

  getKb(size: number) {
    return formatBytes(size);
  }

  sendToConfirm() {
    const isFullForm = Object.keys(this.form.controls).includes('contractSum');
    const requestBody = this.getCurrencyContractTemplate(isFullForm);
    const queryParams = {
      template: requestBody,
      operationType: 'contract-creation',
    };
    this.router.navigate([
      '/currency-control/payment/contract-creation/sign-confirm',
    ]);
    this.documentService.dataTemplate$.next(queryParams);
    this.documentService.documentFiles$.next(this.fileList);
    localStorage.setItem('template', JSON.stringify(queryParams));
  }

  toSave() {}
  getCurrencyContractTemplate(isFullForm: boolean) {
    if (isFullForm) {
      let foreignRepatriationPeriod =
        this.contractFormControl.foreignRepatriationPeriod.value || undefined;
      if (
        foreignRepatriationPeriod &&
        `${foreignRepatriationPeriod}`.length > 3
      ) {
        foreignRepatriationPeriod = `${foreignRepatriationPeriod}`;
        foreignRepatriationPeriod = `${foreignRepatriationPeriod.substring(
          0,
          3
        )}.${foreignRepatriationPeriod.substr(3)}`;
      }
      return {
        approximatePrice:
          this.contractFormControl.contractSum.value || undefined,
        bankName: this.currencyContractPrefill.bankName || undefined,
        branch: this.contractFormControl.branch.value || undefined,
        branchName: this.contractFormControl.branch.value
          ? this.branchList.find(
              (item: any) =>
                item.eqCode === this.contractFormControl.branch.value
            ).eqName
          : null,
        chief: this.chiefSigner || undefined,
        chiefAccountant: this.chiefAccountant || undefined,
        clientAddress:
          this.contractFormControl.clientAddress.value || undefined,
        clientBIN: this.currencyContractPrefill.clientBIN || undefined,
        clientBic: this.currencyContractPrefill.clientBic || undefined,
        clientEmail: this.contractFormControl.clientEmail.value || undefined,
        clientName: this.currencyContractPrefill.clientName || undefined,
        clientContacts:
          this.contractFormControl.clientContacts.value || undefined,
        contractDate:
          moment(
            this.contractFormControl.contractDate.value,
            dateFormat
          ).format(requestDateFormat) || undefined,
        contractNumber: !this.contractFormControl.contractNumberNotExists.value
          ? this.contractFormControl.contractNumber.value || undefined
          : undefined,
        contractNumberExists:
          !this.contractFormControl.contractNumberNotExists.value,
        contractSubjectCode: this.contractFormControl.contractSubjectName.value
          ? this.contractSubjectList.find(
              (item: any) =>
                item.valueRu ===
                this.contractFormControl.contractSubjectName.value
            ).code
          : '', // TODO FIX
        contractSubjectName:
          this.contractFormControl.contractSubjectName.value || undefined,
        contractType: this.contractFormControl.contractType.value || undefined,
        contractTypeName: this.contractFormControl.contractType.value
          ? this.currencyContractTypeList.find(
              (item: any) =>
                item.code === this.contractFormControl.contractType.value
            ).valueRu
          : null,
        currency: this.contractFormControl.currency.value || undefined,
        existCurrencyObligation:
          this.contractFormControl.existCurrencyObligation.value || undefined,
        foreignCountry:
          this.contractFormControl.foreignCountryName.value || undefined,
        foreignCountryName: this.contractFormControl.foreignCountryName.value
          ? this.foreignCountryList.find(
              (item: any) =>
                item.code === this.contractFormControl.foreignCountryName.value
            ).cyrilicName
          : null,
        foreignName: this.contractFormControl.foreignName.value || undefined,
        foreignRepatriationPeriod:
          this.contractFormControl.foreignRepatriationPeriod.value || undefined,
        isFullAnketa: false,
        source: 'NEW_WEB',
        thirdPartyCntry: this.contractFormControl.isThirdParty.value
          ? this.contractFormControl.thirdPartyCntry.value || undefined
          : undefined,
        thirdPartyCountryName: this.contractFormControl.isThirdParty.value
          ? this.contractFormControl.thirdPartyCntry.value
            ? this.thirdPartyTypeList.find(
                (item: any) =>
                  item.code === this.contractFormControl.thirdPartyType.value
              ).cyrilicName
            : undefined
          : undefined,
        thirdPartyName: this.contractFormControl.isThirdParty.value
          ? this.contractFormControl.thirdPartyName.value || undefined
          : undefined,
        thirdPartyType: this.contractFormControl.isThirdParty.value
          ? this.contractFormControl.thirdPartyType.value || undefined
          : undefined,
        thirdPartyTypeName: this.contractFormControl.isThirdParty.value
          ? this.contractFormControl.thirdPartyType.value
            ? this.thirdPartyTypeList.find(
                (item: any) =>
                  item.code === this.contractFormControl.thirdPartyType.value
              ).valueRu
            : undefined
          : undefined,
        fileNames: this.fileNames || [],
      };
    } else {
      return {
        currency: this.contractFormControl.currency.value || undefined,
        branch: this.contractFormControl.branch.value || undefined,
        branchName: this.contractFormControl.branch.value
          ? this.branchList.find(
              (item: any) =>
                item.eqCode === this.contractFormControl.branch.value
            ).eqName
          : null,
        contractNumber: !this.contractFormControl.contractNumberNotExists.value
          ? this.contractFormControl.contractNumber.value || undefined
          : undefined,
        contractDate:
          moment(
            this.contractFormControl.contractDate.value,
            dateFormat
          ).format(requestDateFormat) || undefined,
        contractNumberExists:
          !this.contractFormControl.contractNumberNotExists.value,
        chiefAccountant: this.chiefAccountant || undefined,
        branchList: this.currencyContractPrefill.branchList || undefined,
        chief: this.chiefSigner || undefined,
        clientBIN: this.currencyContractPrefill.clientBIN || undefined,
        clientBic: this.currencyContractPrefill.clientBic || undefined,
        clientName: this.currencyContractPrefill.clientName || undefined,
        source: 'NEW_WEB',
        fileNames: this.fileNames || [],
      };
    }
  }

  FieldsValidation() {
    let allFields = Object.keys(this.form.controls);
    if (
      this.contractFormControl.contractNumberNotExists.value &&
      allFields.includes('contractNumber')
    ) {
      allFields.splice(allFields.indexOf('contractNumber'), 1);
    }
    if (
      !this.contractFormControl?.isThirdParty?.value &&
      allFields.includes('thirdPartyType')
    ) {
      allFields.splice(allFields.indexOf('thirdPartyType'), 1);
      allFields.splice(allFields.indexOf('thirdPartyName'), 1);
      allFields.splice(allFields.indexOf('thirdPartyCntry'), 1);
    }
    let valid = true;
    if (
      allFields.find(
        field => this.contractFormControl[field].status === 'INVALID'
      )
    ) {
      valid = false;
    }
    if (this.fileList.length === 0) {
      valid = false;
    }
    if (valid) {
      //форма невалидна
      this.sendToConfirm();
    } else {
      let emptyField: string;
      allFields.forEach(f => {
        if (this.form.get(f).status === 'INVALID') {
          if (!this.form.get(f).value && !emptyField) {
            emptyField = f;
          }
          this.form.get(f).markAsTouched();
          this.form.get(f).markAsDirty();
        }
        if (f === 'fileDropArea' && this.fileList.length === 0) {
          emptyField = f;
          this.form.get(f).markAsTouched();
          this.form.get(f).markAsDirty();
        }
      });
      if (emptyField) {
        document.getElementById(emptyField).focus();
        errorMessage({ message: this.emptyFieldsError }, this.toastr);
      }
    }
  }

  edit() {
    this.documentService.documentFiles$.subscribe((files: any) => {
      if (files?.length > 0) {
        this.fileList = files;
        this.fileNames = this.editTemplate?.fileNames;
      }
    });
    if (this.editTemplate?.approximatePrice) {
      // full form
      this.changeContractType('from');
    }
    this.form.patchValue({
      currency: this.editTemplate?.currency,
      contractNumberNotExists: !this.editTemplate?.contractNumberExists,
      contractDate:
        moment(this.editTemplate?.contractDate, requestDateFormat).format(
          dateFormat
        ) || null,
      contractNumber: this.editTemplate?.contractNumberExists
        ? this.editTemplate?.contractNumber
        : null,
      branch: this.editTemplate?.branch,
    });
    if (this.editTemplate?.approximatePrice) {
      // full form
      let thirdParty = this.editTemplate?.thirdPartyName ? true : false;
      this.form.patchValue({
        contractSum: this.editTemplate?.approximatePrice,
        clientAddress: this.editTemplate?.clientAddress,
        clientEmail: this.editTemplate?.clientEmail,
        clientContacts: this.editTemplate?.clientContacts,
        contractSubjectName: this.editTemplate?.contractSubjectName,
        contractType: this.editTemplate?.contractType,
        existCurrencyObligation:
          this.editTemplate?.existCurrencyObligation || false,
        foreignCountryName: this.editTemplate?.foreignCountry,
        foreignName: this.editTemplate?.foreignName,
        foreignRepatriationPeriod: this.editTemplate?.foreignRepatriationPeriod,
        isThirdParty: thirdParty,
        thirdPartyCntry: thirdParty ? this.editTemplate?.thirdPartyCntry : null,
        thirdPartyName: thirdParty ? this.editTemplate?.thirdPartyName : null,
        thirdPartyType: thirdParty ? this.editTemplate?.thirdPartyType : null,
      });
    }
  }

  permittedSymbolValidatorOther(control: AbstractControl): {
    [key: string]: boolean;
  } {
    if (!control.value) {
      return null;
    }
    let symbolRegxp: RegExp = /^[-()/?',.a-zA-Z0-9 ]+$/;
    const valid = symbolRegxp.test(control.value);
    return !valid ? { invalidSymbolLatin: true } : null;
  }

  permittedSymbolValidatorRusKgs(control: AbstractControl): {
    [key: string]: boolean;
  } {
    if (!control.value) {
      return null;
    }
    let symbolRegxp: RegExp = /^[-()/?',.а-яА-ЯёЁa-zA-Z0-9 ]+$/;
    const valid = symbolRegxp.test(control.value);
    return !valid ? { invalidSymbolCyryillic: true } : null;
  }

  onCurrencyChange(currency: any): void {
    this.checkSymbolValidation(currency);
  }

  checkSymbolValidation(currency: any) {
    if (currency === 'RUB' || currency === 'KZT' || currency === 'KGS') {
      this.changeFieldSymbolValidator('contractNumber', true);
      if (this.contractType === 'from') {
        this.changeFieldSymbolValidator('foreignName', true);
        this.changeFieldSymbolValidator('thirdPartyName', true);
      }
    } else {
      this.changeFieldSymbolValidator('contractNumber', false);
      if (this.contractType === 'from') {
        this.changeFieldSymbolValidator('foreignName', false);
        this.changeFieldSymbolValidator('thirdPartyName', false);
      }
    }
    this.changeDetector.detectChanges();
  }

  changeFieldSymbolValidator(fieldName: string, isCyrillic: boolean): void {
    if (isCyrillic) {
      if (
        this.form
          .get(fieldName)
          .hasValidator(this.permittedSymbolValidatorOther)
      ) {
        this.form
          .get(fieldName)
          .removeValidators(this.permittedSymbolValidatorOther);
      }
      if (
        !this.form
          .get(fieldName)
          .hasValidator(this.permittedSymbolValidatorRusKgs)
      ) {
        this.form
          .get(fieldName)
          .addValidators(this.permittedSymbolValidatorRusKgs);
      }
      this.form.get(fieldName).updateValueAndValidity();
    } else {
      if (
        this.form
          .get(fieldName)
          .hasValidator(this.permittedSymbolValidatorRusKgs)
      ) {
        this.form
          .get(fieldName)
          .removeValidators(this.permittedSymbolValidatorRusKgs);
      }
      if (
        !this.form
          .get(fieldName)
          .hasValidator(this.permittedSymbolValidatorOther)
      ) {
        this.form
          .get(fieldName)
          .addValidators(this.permittedSymbolValidatorOther);
      }
      this.form.get(fieldName).updateValueAndValidity();
    }
  }
}
