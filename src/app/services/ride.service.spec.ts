import { TestBed } from '@angular/core/testing';
import { RideService } from './ride.service';

describe('RideService', () => {
  let service: RideService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RideService);
  });

  it('should add a ride and allow booking by another employee', () => {
    const add = service.addRide({
      ownerEmployeeId: 'EMP_A',
      vehicleType: 'Car',
      vehicleNo: 'KA01AA0001',
      vacantSeats: 2,
      time: '09:30',
      pickupPoint: 'Gate 1',
      destination: 'Office'
    });
    expect(add.success).toBeTrue();

    const found = service.findRidesNearTime('09:30');
    expect(found.length).toBeGreaterThan(0);

    const ride = found[0];
    const book = service.bookRide(ride.id, 'EMP_B');
    expect(book.success).toBeTrue();

    const bookAgain = service.bookRide(ride.id, 'EMP_B');
    expect(bookAgain.success).toBeFalse();
  });

  it('should not allow owner to add two rides same day', () => {
    const r1 = service.addRide({
      ownerEmployeeId: 'OWNER_X',
      vehicleType: 'Bike',
      vehicleNo: 'B01',
      vacantSeats: 1,
      time: '10:00',
      pickupPoint: 'P1',
      destination: 'D1'
    });
    expect(r1.success).toBeTrue();
    const r2 = service.addRide({
      ownerEmployeeId: 'OWNER_X',
      vehicleType: 'Bike',
      vehicleNo: 'B02',
      vacantSeats: 1,
      time: '11:00',
      pickupPoint: 'P2',
      destination: 'D2'
    });
    expect(r2.success).toBeFalse();
  });
});
