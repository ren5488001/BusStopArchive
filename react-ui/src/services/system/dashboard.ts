import { request } from '@umijs/max';

/**
 * 获取驾驶舱统计数据
 */
export async function getDashboardOverview() {
  return request('/api/system/dashboard/overview', {
    method: 'GET',
  });
}
