import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RideService } from '../../services/ride.service';
import { VehicleType } from '../../models/ride.model';

@Component({
  selector: 'app-add-ride',
  templateUrl: './add-ride.component.html',
  styleUrls: ['./add-ride.component.css']
})
export class AddRideComponent {
  form: FormGroup;
  vehicleTypes: VehicleType[] = ['Bike', 'Car'];
  message = '';

  constructor(private fb: FormBuilder, private rideService: RideService) {
    this.form = this.fb.group({
      ownerEmployeeId: ['', Validators.required],
      vehicleType: ['Bike', Validators.required],
      vehicleNo: ['', Validators.required],
      vacantSeats: [1, [Validators.required, Validators.min(1)]],
      time: ['', Validators.required], // Removed pattern validator (handled by <input type="time">)
      pickupPoint: ['', Validators.required],
      destination: ['', Validators.required]
    });
    // Convert Employee ID to uppercase
    this.form.get('ownerEmployeeId')?.valueChanges.subscribe(value => {
      this.form.get('ownerEmployeeId')?.setValue(value.toUpperCase(), { emitEvent: false });
    });
  }


  submit() {
    this.message = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.message = 'Please correct the form errors.';
      return;
    }

    // Check for conflicting rides
    const newRide = this.form.value;
    const conflict = this.rideService.hasVehicleConflict(newRide.vehicleNo, newRide.time);
    if (conflict) {
      this.message = 'A ride with this vehicle number already exists at this time (±60 minutes).';
      return;
    }

    // Add the ride
    const res = this.rideService.addRide(newRide);
    if (res.success) {
      this.message = 'Ride added successfully.';
      this.form.reset({ vehicleType: 'Bike', vacantSeats: 1 });
    } else {
      this.message = res.message || 'Failed to add ride.';
    }
  }

  resetForm(): void {
    this.form.reset();
  }

}
