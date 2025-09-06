export type VehicleType = 'Bike' | 'Car';

export interface Ride {
  id: string;
  ownerEmployeeId: string; // who created the ride
  vehicleType: VehicleType;
  vehicleNo: string;
  vacantSeats: number;
  time: string; // "HH:mm"
  pickupPoint: string;
  destination: string;
  bookedEmployeeIds: string[]; // employees who booked
  date: string; // YYYY-MM-DD
}
