import {Component, OnInit, ViewChild} from '@angular/core';
import {ContactType, Feedback} from "../shared/models/Feedback";
import {FormBuilder, FormGroup, Validators, ɵFormGroupValue, ɵTypedOrUntyped} from "@angular/forms";
import {expand, flyInOut} from "../animations/animation";

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  host: {'[@flyInOut]': 'true', 'style': 'display: block;'},
  animations: [flyInOut(), expand()]
})
export class ContactComponent implements OnInit {

  @ViewChild('fform') feedbackFormDirective: any;
  feedbackForm: FormGroup;
  feedback: Feedback;
  contactType = ContactType;
  formErrors = {'firstname': '', 'lastname': '', 'telnum': '', 'email': ''};
  validationMessages = {
    'firstname': {
      'required': 'First Name is required.',
      'minlength': 'First Name must be at least 2 characters long.',
      'maxlength': 'FirstName cannot be more than 25 characters long.'
    },
    'lastname': {
      'required': 'Last Name is required.',
      'minlength': 'Last Name must be at least 2 characters long.',
      'maxlength': 'Last Name cannot be more than 25 characters long.'
    },
    'telnum': {'required': 'Tel. number is required.', 'pattern': 'Tel. number must contain only numbers.'},
    'email': {'required': 'Email is required.', 'email': 'Email not in valid format.'},
  };
  validatePhoneNumberRegex = /^\+?[1-9][0-9]{7,14}$/;

  constructor(private fb: FormBuilder) {
    this.createForm();
  }

  ngOnInit() {
  }

  createForm() {
    this.feedbackForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      lastname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      telnum: ['', [Validators.required, Validators.pattern]],
      email: ['', [Validators.required, Validators.email]],
      agree: false,
      contacttype: 'None',
      message: ''
    });

    this.feedbackForm.valueChanges.subscribe(data => this.onValueChanged(data));
  }

  onSubmit() {
    this.feedback = this.feedbackForm.value;
    console.log(this.feedback);
    this.feedbackForm.reset({
      firstname: '',
      lastname: '',
      telnum: '',
      email: '',
      agree: false,
      contacttype: 'None',
      message: ''
    });
    this.feedbackFormDirective.resetForm();
  }

  private onValueChanged(data: ɵTypedOrUntyped<any, ɵFormGroupValue<any>, any>) {
    if (data && data.firstname) {
      if (data.firstname.length < 2 && data.firstname.length > 0) {
        this.formErrors.firstname = this.validationMessages.firstname.minlength
      } else if (data.firstname.length > 25) {
        this.formErrors.firstname = this.validationMessages.firstname.maxlength
      }
    } else {
      this.formErrors.firstname = ''
    }
    if (data && data.lastname) {
      if (data.firstname.length < 2 && data.lastname.length > 0) {
        this.formErrors.lastname = this.validationMessages.lastname.minlength
      } else if (data.firstname.length > 25) {
        this.formErrors.lastname = this.validationMessages.lastname.maxlength
      }
    } else {
      this.formErrors.lastname = ''
    }
    console.log(data)
  }
}
