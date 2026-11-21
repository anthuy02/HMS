import {
  SEED_USERS,
  SEED_ROOMS,
  SEED_CATALOG_ITEMS,
  SEED_VOUCHERS,
  SEED_CONFIG,
  SEED_HOLIDAYS,
  SEED_RESERVATIONS,
  SEED_CLEANING_TASKS,
  SEED_INVOICES,
} from './seedData';
import { User } from '../types/rbac.types';
import { Room, CleaningTask } from '../types/room.types';
import { Reservation } from '../types/reservation.types';
import { Invoice } from '../types/billing.types';
import { SystemConfig, Holiday, ServiceCatalogItem, Voucher } from '../types/systemConfig.types';

const STORAGE_KEYS = {
  USERS: 'hms_mock_v12_users',
  ROOMS: 'hms_mock_v12_rooms',
  CATALOG: 'hms_mock_v12_catalog',
  VOUCHERS: 'hms_mock_v12_vouchers',
  CONFIG: 'hms_mock_v12_config',
  HOLIDAYS: 'hms_mock_v12_holidays',
  RESERVATIONS: 'hms_mock_v12_reservations',
  CLEANING_TASKS: 'hms_mock_v12_cleaning_tasks',
  INVOICES: 'hms_mock_v12_invoices',
};

class MockDatabase {
  constructor() {
    this.init();
  }

  init() {
    // If not exists or legacy, seed initial data
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.reset();
    }
  }

  getUsers(): (User & { password?: string })[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  }
  saveUsers(users: (User & { password?: string })[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  getRooms(): Room[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ROOMS) || '[]');
  }
  saveRooms(rooms: Room[]) {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
  }

  getCatalog(): ServiceCatalogItem[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CATALOG) || '[]');
  }
  saveCatalog(items: ServiceCatalogItem[]) {
    localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(items));
  }

  getVouchers(): Voucher[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.VOUCHERS) || '[]');
  }
  saveVouchers(vouchers: Voucher[]) {
    localStorage.setItem(STORAGE_KEYS.VOUCHERS, JSON.stringify(vouchers));
  }

  getConfig(): SystemConfig {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONFIG) || JSON.stringify(SEED_CONFIG));
  }
  saveConfig(config: SystemConfig) {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }

  getHolidays(): Holiday[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.HOLIDAYS) || '[]');
  }
  saveHolidays(holidays: Holiday[]) {
    localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(holidays));
  }

  getReservations(): Reservation[] {
    const raw = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
    const data: Reservation[] = raw ? JSON.parse(raw) : [];
    if (!data || data.length < 5) {
      this.saveReservations(SEED_RESERVATIONS);
      return SEED_RESERVATIONS;
    }
    return data;
  }
  saveReservations(reservations: Reservation[]) {
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
  }

  getCleaningTasks(): CleaningTask[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CLEANING_TASKS) || '[]');
  }
  saveCleaningTasks(tasks: CleaningTask[]) {
    localStorage.setItem(STORAGE_KEYS.CLEANING_TASKS, JSON.stringify(tasks));
  }

  getInvoices(): Invoice[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.INVOICES) || '[]');
  }
  saveInvoices(invoices: Invoice[]) {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }

  reset() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(SEED_ROOMS));
    localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(SEED_CATALOG_ITEMS));
    localStorage.setItem(STORAGE_KEYS.VOUCHERS, JSON.stringify(SEED_VOUCHERS));
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(SEED_CONFIG));
    localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(SEED_HOLIDAYS));
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(SEED_RESERVATIONS));
    localStorage.setItem(STORAGE_KEYS.CLEANING_TASKS, JSON.stringify(SEED_CLEANING_TASKS));
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(SEED_INVOICES));
  }
}

export const mockDb = new MockDatabase();
