import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

// Custom validator: end date must be after start date
function endAfterStart(control: AbstractControl): ValidationErrors | null {
  const parent = control.parent;
  if (!parent) return null;
  const start = parent.get('startDate')?.value;
  const end   = control.value;
  if (start && end && new Date(end) <= new Date(start)) {
    return { endBeforeStart: true };
  }
  return null;
}

const KENYA_COUNTIES = [
  'Baringo','Bomet','Bungoma','Busia','Elgeyo-Marakwet','Embu',
  'Garissa','Homa Bay','Isiolo','Kajiado','Kakamega','Kericho',
  'Kiambu','Kilifi','Kirinyaga','Kisii','Kisumu','Kitui','Kwale',
  'Laikipia','Lamu','Machakos','Makueni','Mandera','Marsabit',
  'Meru','Migori','Mombasa','Murang\'a','Nairobi','Nakuru','Nandi',
  'Narok','Nyamira','Nyandarua','Nyeri','Samburu','Siaya',
  'Taita-Taveta','Tana River','Tharaka-Nithi','Trans Nzoia',
  'Turkana','Uasin Gishu','Vihiga','Wajir','West Pokot',
];

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
  private fb     = inject(FormBuilder);
  private router = inject(Router);
  private http   = inject(HttpClient);

  isLoading   = signal(false);
  errorMsg    = signal<string | null>(null);
  successMsg  = signal<string | null>(null);
  currentStep = signal(1); // 2-step form: personal → placement

  readonly counties = KENYA_COUNTIES;

  form = this.fb.group({
    // Step 1 — Personal details
    name:              ['', [Validators.required, Validators.minLength(3)]],
    registrationNumber:['', [Validators.required, Validators.pattern]],
    email:             ['', [Validators.required, Validators.email]],
    phone:             ['', [Validators.required, Validators.pattern(/^(?:\+254|0)[17]\d{8}$/)]],

    // Step 2 — Placement details
    company:           ['', Validators.required],
    county:            ['', Validators.required],
    city:              ['', Validators.required],
    stationSupervisor: ['', Validators.required],
    startDate:         ['', Validators.required],
    endDate:           ['', [Validators.required, endAfterStart]],
  });

  // Step 1 controls
  get nameCtrl()  { return this.form.controls.name; }
  get regCtrl()   { return this.form.controls.registrationNumber; }
  get emailCtrl() { return this.form.controls.email; }
  get phoneCtrl() { return this.form.controls.phone; }

  // Step 2 controls
  get companyCtrl()    { return this.form.controls.company; }
  get countyCtrl()     { return this.form.controls.county; }
  get cityCtrl()       { return this.form.controls.city; }
  get supervisorCtrl() { return this.form.controls.stationSupervisor; }
  get startCtrl()      { return this.form.controls.startDate; }
  get endCtrl()        { return this.form.controls.endDate; }

  get isStep1(): boolean { return this.currentStep() === 1; }
  get isStep2(): boolean { return this.currentStep() === 2; }

  get step1Valid(): boolean {
    return (
      this.nameCtrl.valid &&
      this.regCtrl.valid &&
      this.emailCtrl.valid &&
      this.phoneCtrl.valid
    );
  }

  // Re-validate end date when start date changes
  onStartDateChange(): void {
    this.endCtrl.updateValueAndValidity();
  }

  nextStep(): void {
    this.nameCtrl.markAsTouched();
    this.regCtrl.markAsTouched();
    this.emailCtrl.markAsTouched();
    this.phoneCtrl.markAsTouched();

    if (!this.step1Valid) return;
    this.errorMsg.set(null);
    this.currentStep.set(2);
  }

  prevStep(): void {
    this.currentStep.set(1);
    this.errorMsg.set(null);
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.errorMsg.set(null);

    const payload = {
      name:               this.form.value.name,
      registrationNumber: this.form.value.registrationNumber,
      email:              this.form.value.email,
      phone:              this.form.value.phone,
      company:            this.form.value.company,
      location: {
        county: this.form.value.county,
        city:   this.form.value.city,
      },
      stationSupervisor:  this.form.value.stationSupervisor,
      startDate:          this.form.value.startDate,
      endDate:            this.form.value.endDate,
      role:               'student',
    };

   this.http.post(`${environment.apiUrl}/auth/register`, payload).subscribe({
  next: () => {
    this.isLoading.set(false);
    this.successMsg.set('Account created! Redirecting to login…');

    setTimeout(() => {
      this.router.navigateByUrl('/auth/login');
    }, 1500); // slightly shorter + more responsive
  },

  error: (err) => {
    this.isLoading.set(false);
    this.errorMsg.set(
      err.error?.detail ?? 'Registration failed. Please try again.'
    );
  },
});
}
}