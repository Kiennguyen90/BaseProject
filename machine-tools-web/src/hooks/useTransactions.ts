import { useQuery } from '@tanstack/react-query';
import { transactionApi } from '../api/transactionApi';
import type { TransactionFilter } from '../types/transaction.types';
import type { PagedRequest } from '../types/common.types';

export const useTransactions = (filter?: TransactionFilter) =>
  useQuery({
    queryKey: ['transactions', filter],
    queryFn: () => transactionApi.getList(filter),
  });

export const useDeviceTransactions = (deviceId: string, params?: PagedRequest) =>
  useQuery({
    queryKey: ['transactions', 'device', deviceId, params],
    queryFn: () => transactionApi.getByDevice(deviceId, params),
    enabled: !!deviceId,
  });

export const useMyTransactions = (params?: PagedRequest) =>
  useQuery({
    queryKey: ['transactions', 'my', params],
    queryFn: () => transactionApi.getMyList(params),
  });
