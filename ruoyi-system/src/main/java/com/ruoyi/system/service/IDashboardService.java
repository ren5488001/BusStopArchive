package com.ruoyi.system.service;

import java.util.Map;

/**
 * 驾驶舱Service接口
 *
 * @author ruoyi
 * @date 2025-11-24
 */
public interface IDashboardService
{
    /**
     * 获取驾驶舱统计数据
     *
     * @return 统计数据
     */
    Map<String, Object> getDashboardOverview();
}
