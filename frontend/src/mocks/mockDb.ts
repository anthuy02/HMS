import { SEED_USERS, SEED_ROOMS, SEED_SERVICES, SEED_RESERVATIONS, SEED_INVOICES } from './seedData';
import { User } from '../types/rbac.types';
import { Room } from '../types/room.types';
import { Reservation } from '../types/reservation.types';
import { Invoice } from '../types/billing.types';

const STORAGE_KEYS = {
  USERS: 'hms_mock_users',
  ROOMS: 'hms_mock_rooms',
  SERVICES: 'hms_mock_services',
  RESERVATIONS: 'hms_mock_reservations',
  INVOICES: 'hms_mock_invoices',
  CURRENT_USER: 'hms_mock_current_user',
  TOKEN: 'token',
};

class MockDatabase {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ROOMS)) {
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(SEED_ROOMS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SERVICES)) {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(SEED_SERVICES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RESERVATIONS)) {
      localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(SEED_RESERVATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.INVOICES)) {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(SEED_INVOICES));
    }
  }

  // Users
  getUsers(): (User & { password?: string })[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  }
  saveUsers(users: (User & { password?: string })[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  // Rooms
  getRooms(): Room[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ROOMS) || '[]');
  }
  saveRooms(rooms: Room[]) {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
  }

  // Services
  getServices(): any[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVICES) || '[]');
  }

  // Reservations
  getReservations(): Reservation[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.RESERVATIONS) || '[]');
  }
  saveReservations(reservations: Reservation[]) {
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
  }

  // Invoices
  getInvoices(): Invoice[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.INVOICES) || '[]');
  }
  saveInvoices(invoices: Invoice[]) {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }

  // Reset to initial state
  reset() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(SEED_ROOMS));
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(SEED_SERVICES));
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(SEED_RESERVATIONS));
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(SEED_INVOICES));
  }
}

export const mockDb = new MockDatabase();
