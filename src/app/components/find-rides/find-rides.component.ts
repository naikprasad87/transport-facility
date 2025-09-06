import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RideService } from '../../services/ride.service';
import { Ride, VehicleType } from '../../models/ride.model';

@Component({
  selector: 'app-find-rides',
  templateUrl: './find-rides.component.html',
  styleUrls: ['./find-rides.component.css']
})
export class FindRidesComponent implements OnInit {
  form: FormGroup;
  rides: Ride[] = [];
  message = '';
  vehicleTypes: (VehicleType | 'All')[] = ['All', 'Bike', 'Car'];
  ridesCount: any;

  constructor(private fb: FormBuilder, private rideService: RideService) {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    this.form = this.fb.group({
      desiredTime: [`${hh}:${mm}`, [Validators.required, Validators.pattern('^(?:[01]\\d|2[0-3]):[0-5]\\d$')]],
      vehicleType: ['All'],
      bookingEmployeeId: ['', Validators.required]
    });
    // Convert Employee ID to uppercase
    this.form.get('bookingEmployeeId')?.valueChanges.subscribe(value => {
      this.form.get('bookingEmployeeId')?.setValue(value.toUpperCase(), { emitEvent: false });
    });
  }

  ngOnInit() {
    this.rideService.rides$.subscribe((rides) => {
    this.ridesCount = rides.length; // Get the count of rides
    console.log('Current rides count:', this.ridesCount); // Optional: Log the count
    if (this.form.valid) this.search();
  });
  }

  search() {
    this.message = '';
    if (this.form.get('desiredTime')?.invalid) {
      this.message = 'Enter time as HH:mm';
      return;
    }
    const vt = this.form.value.vehicleType === 'All' ? undefined : this.form.value.vehicleType;
    this.rides = this.rideService.findRidesNearTime(this.form.value.desiredTime, 60, vt);
    if (!this.rides.length) this.message = 'No matching rides.';
  }

  book(ride: Ride) {
    this.message = '';
    const emp = this.form.value.bookingEmployeeId?.trim();
    if (!emp) {
      this.message = 'Enter Employee ID to book.';
      return;
    }

    const res = this.rideService.bookRide(ride.id, emp);
    if (res.success) {
      alert('Ride booked successfully!'); // Use JavaScript alert
      this.search(); // Refresh the ride list
    } else {
      this.message = res.message || 'Booking failed.';
    }
  }


  clearAllRides(): void {
    this.rideService.clearAllRides();
    this.rides = [];
    alert('All rides have been cleared!'); // Optional: Show feedback
  }

  formatTimeTo12Hour(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

}
