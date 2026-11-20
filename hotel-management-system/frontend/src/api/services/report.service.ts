import { axiosClient } from '../axiosClient';
import { mockHandlers } from '../../mocks/mockHandlers';

const isMock = import.meta.env.VITE_USE_MOCK !== 'false';

export const reportService = {
  getRevenueReport: async () => {
    if (isMock) return mockHandlers.getRevenueReport();
    const res = await axiosClient.get('/reports/revenue');
    return res.data;
  },
};
