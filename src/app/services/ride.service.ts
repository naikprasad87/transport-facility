import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Ride, VehicleType } from '../models/ride.model';

@Injectable({ providedIn: 'root' })
export class RideService {
  private ridesSubject = new BehaviorSubject<Ride[]>([]);
  rides$ = this.ridesSubject.asObservable();
  private STORAGE_KEY = 'carpool_rides';

  constructor() {
    // Load rides from localStorage when the service initializes
    const savedRides = localStorage.getItem(this.STORAGE_KEY);
    if (savedRides) {
      this.ridesSubject.next(JSON.parse(savedRides));
    }
  }

  private getTodayDateString(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }

  private timeToMinutes(t: string): number {
    const [h, mm] = t.split(':').map(Number);
    return h * 60 + mm;
  }

  private saveRides(rides: Ride[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(rides));
  }

  getAllRides(): Ride[] {
    return this.ridesSubject.getValue();
  }

  // Adds a new ride to the system after validating all required fields and constraints.
  addRide(data: Omit<Ride, 'id' | 'bookedEmployeeIds' | 'date'>): { success: boolean; message?: string } {
    const today = this.getTodayDateString();
    const rides = this.getAllRides();

    // Validations
    if (!data.ownerEmployeeId) return { success: false, message: 'Employee ID is required.' };
    if (!data.vehicleNo) return { success: false, message: 'Vehicle No is required.' };
    if (!data.pickupPoint || !data.destination) return { success: false, message: 'Pickup and Destination are required.' };
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(data.time)) return { success: false, message: 'Time must be HH:mm.' };
    if (!Number.isInteger(data.vacantSeats) || data.vacantSeats < 1) return { success: false, message: 'Vacant seats must be >= 1.' };

    // Owner uniqueness per day
    const already = rides.find(r => r.ownerEmployeeId === data.ownerEmployeeId && r.date === today);
    if (already) return { success: false, message: 'This employee already added a ride for today.' };

    // Vehicle conflict check
    if (this.hasVehicleConflict(data.vehicleNo, data.time)) {
      return { success: false, message: 'A ride with this vehicle number already exists at this time (±60 minutes).' };
    }

    const newRide: Ride = {
      id: uuidv4(),
      ...data,
      bookedEmployeeIds: [],
      date: today
    };

    const updatedRides = [...rides, newRide];
    this.ridesSubject.next(updatedRides);
    this.saveRides(updatedRides); // Save to localStorage
    return { success: true };
  }

  // Finds rides near a desired time, optionally filtered by vehicle type.
  findRidesNearTime(desiredTime: string, bufferMinutes = 60, vehicleType?: VehicleType): Ride[] {
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(desiredTime)) return [];
    const desired = this.timeToMinutes(desiredTime);
    const today = this.getTodayDateString();

    return this.getAllRides()
      .filter(r => r.date === today)
      .filter(r => vehicleType ? r.vehicleType === vehicleType : true)
      .filter(r => Math.abs(this.timeToMinutes(r.time) - desired) <= bufferMinutes && r.vacantSeats > 0);
  }

  // Books a ride for an employee, with validation for conflicts and availability. 
  bookRide(rideId: string, employeeId: string): { success: boolean; message?: string } {
    const rides = this.getAllRides();
    const idx = rides.findIndex(r => r.id === rideId);
    if (idx === -1) return { success: false, message: 'Ride not found.' };

    const ride = { ...rides[idx] };
    const today = this.getTodayDateString();

    if (ride.date !== today) return { success: false, message: 'Ride is not for today.' };
    if (ride.ownerEmployeeId === employeeId) return { success: false, message: 'Owner cannot book their own ride.' };
    if (ride.bookedEmployeeIds.includes(employeeId)) return { success: false, message: 'You have already booked this ride.' };
    if (ride.vacantSeats <= 0) return { success: false, message: 'No vacant seats available.' };

    // Check if the employee has already booked any ride for today
    const employeeBookedRidesToday = rides.filter(r =>
      r.bookedEmployeeIds.includes(employeeId) && r.date === today
    );

    if (employeeBookedRidesToday.length > 0) {
      return { success: false, message: 'You have already booked a ride for today.' };
    }

    ride.vacantSeats -= 1;
    ride.bookedEmployeeIds = [...ride.bookedEmployeeIds, employeeId];
    const updated = [...rides];
    updated[idx] = ride;
    this.ridesSubject.next(updated);
    this.saveRides(updated);
    return { success: true };
  }

  // Checks if a vehicle has a conflicting ride within ±60 minutes of the specified time.
  hasVehicleConflict(vehicleNo: string, time: string): boolean {
    const newTime = this.timeToMinutes(time);
    const bufferMinutes = 60;
    const startTime = newTime - bufferMinutes;
    const endTime = newTime + bufferMinutes;

    return this.getAllRides().some(existingRide => {
      const existingTime = this.timeToMinutes(existingRide.time);
      return (
        existingRide.vehicleNo === vehicleNo &&
        existingTime >= startTime &&
        existingTime <= endTime
      );
    });
  }

  clearAllRides(): void {
  this.ridesSubject.next([]); // Clear the BehaviorSubject
  localStorage.removeItem(this.STORAGE_KEY); // Clear localStorage
}

}
