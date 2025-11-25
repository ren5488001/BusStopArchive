package com.ruoyi.system.service.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ruoyi.system.mapper.BamsProjectMapper;
import com.ruoyi.system.mapper.BamsArchiveMapper;
import com.ruoyi.system.service.IDashboardService;

/**
 * 驾驶舱Service业务层处理
 *
 * @author ruoyi
 * @date 2025-11-24
 */
@Service
public class DashboardServiceImpl implements IDashboardService
{
    @Autowired
    private BamsProjectMapper projectMapper;

    @Autowired
    private BamsArchiveMapper archiveMapper;

    /**
     * 获取驾驶舱统计数据
     *
     * @return 统计数据
     */
    @Override
    public Map<String, Object> getDashboardOverview()
    {
        Map<String, Object> result = new HashMap<>();

        // KPI 统计数据
        result.put("kpi", getKpiData());

        // 项目列表（本期返回空数组）
        result.put("projects", new ArrayList<>());

        // 档案类型分布
        result.put("archiveTypeDistribution", getArchiveTypeDistribution());

        // 按阶段归档数量
        result.put("archiveByStage", getArchiveByStage());

        // 近半年新增趋势
        result.put("monthlyTrend", getMonthlyTrend());

        // 项目完成度分布
        result.put("completenessDistribution", getCompletenessDistribution());

        return result;
    }

    /**
     * 获取 KPI 数据
     */
    private Map<String, Object> getKpiData()
    {
        Map<String, Object> kpi = new HashMap<>();

        // 项目总数（排除已删除）
        Integer totalProjects = projectMapper.countTotalProjects();
        kpi.put("totalProjects", totalProjects != null ? totalProjects : 0);

        // 档案总量（排除已删除）
        Integer totalArchives = archiveMapper.countTotalArchives();
        kpi.put("totalArchives", totalArchives != null ? totalArchives : 0);

        // 在建中项目（completeness_rate < 100 且 status = '0'）
        Integer ongoingProjects = projectMapper.countOngoingProjects();
        kpi.put("ongoingProjects", ongoingProjects != null ? ongoingProjects : 0);

        // 平均完整度
        Integer avgCompleteness = projectMapper.getAvgCompleteness();
        kpi.put("avgCompleteness", avgCompleteness != null ? avgCompleteness : 0);

        return kpi;
    }

    /**
     * 获取档案类型分布
     */
    private List<Map<String, Object>> getArchiveTypeDistribution()
    {
        return archiveMapper.getArchiveTypeDistribution();
    }

    /**
     * 获取按阶段归档数量
     */
    private List<Map<String, Object>> getArchiveByStage()
    {
        return archiveMapper.getArchiveByStage();
    }

    /**
     * 获取近半年新增趋势
     */
    private List<Map<String, Object>> getMonthlyTrend()
    {
        return archiveMapper.getMonthlyTrend();
    }

    /**
     * 获取项目完成度分布
     */
    private List<Map<String, Object>> getCompletenessDistribution()
    {
        return projectMapper.getCompletenessDistribution();
    }
}
