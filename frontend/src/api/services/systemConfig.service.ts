import { axiosClient } from '../axiosClient';
import { mockHandlers } from '../../mocks/mockHandlers';
import { SystemConfig, Holiday, Voucher } from '../../types/systemConfig.types';
import { Role } from '../../types/rbac.types';

const isMock = import.meta.env.VITE_USE_MOCK !== 'false';

export const systemConfigService = {
  getConfig: async (): Promise<SystemConfig> => {
    if (isMock) return mockHandlers.getSystemConfig();
    const res = await axiosClient.get<SystemConfig>('/config');
    return res.data;
  },

  updateConfig: async (data: Partial<SystemConfig>, userRole: Role): Promise<SystemConfig> => {
    if (isMock) return mockHandlers.updateSystemConfig(data, userRole);
    const res = await axiosClient.put<SystemConfig>('/config', data);
    return res.data;
  },

  getHolidays: async (): Promise<Holiday[]> => {
    if (isMock) return mockHandlers.getHolidays();
    const res = await axiosClient.get<Holiday[]>('/config/holidays');
    return res.data;
  },

  getVouchers: async (): Promise<Voucher[]> => {
    if (isMock) return mockHandlers.getVouchers();
    const res = await axiosClient.get<Voucher[]>('/config/vouchers');
    return res.data;
  },
};
