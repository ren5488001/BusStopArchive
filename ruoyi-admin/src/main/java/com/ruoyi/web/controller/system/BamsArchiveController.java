package com.ruoyi.web.controller.system;

import java.util.List;
import jakarta.servlet.http.HttpServletResponse;

import com.ruoyi.common.utils.poi.ExcelUtil;
import com.ruoyi.system.domain.BamsArchiveVersion;
import com.ruoyi.system.service.IBamsArchiveVersionService;
import com.ruoyi.system.service.IBamsProjectService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ruoyi.common.annotation.Log;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.enums.BusinessType;
import com.ruoyi.system.domain.BamsArchive;
import com.ruoyi.system.service.IBamsArchiveService;
import com.ruoyi.common.core.page.TableDataInfo;

/**
 * 档案管理Controller
 *
 * @author ruoyi
 * @date 2025-11-19
 */
@RestController
@RequestMapping("/system/archive")
public class BamsArchiveController extends BaseController
{
    @Autowired
    private IBamsArchiveService bamsArchiveService;

    @Autowired
    private IBamsArchiveVersionService bamsArchiveVersionService;

    @Autowired
    private IBamsProjectService bamsProjectService;

    /**
     * 查询档案列表
     */
    @PreAuthorize("@ss.hasPermi('system:archive:list')")
    @GetMapping("/list")
    public TableDataInfo list(BamsArchive bamsArchive)
    {
        startPage();
        List<BamsArchive> list = bamsArchiveService.selectBamsArchiveList(bamsArchive);
        return getDataTable(list);
    }

    /**
     * 导出档案列表
     */
    @PreAuthorize("@ss.hasPermi('system:archive:export')")
    @Log(title = "档案管理", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(HttpServletResponse response, BamsArchive bamsArchive)
    {
        List<BamsArchive> list = bamsArchiveService.selectBamsArchiveList(bamsArchive);
        ExcelUtil<BamsArchive> util = new ExcelUtil<BamsArchive>(BamsArchive.class);
        util.exportExcel(response, list, "档案数据");
    }

    /**
     * 获取档案详细信息
     */
    @PreAuthorize("@ss.hasPermi('system:archive:query')")
    @GetMapping(value = "/{archiveId}")
    public AjaxResult getInfo(@PathVariable("archiveId") Long archiveId)
    {
        return success(bamsArchiveService.selectBamsArchiveByArchiveId(archiveId));
    }

    /**
     * 根据档案ID查询版本列表
     */
    @PreAuthorize("@ss.hasPermi('system:archive:query')")
    @GetMapping(value = "/{archiveId}/versions")
    public AjaxResult getVersions(@PathVariable("archiveId") Long archiveId)
    {
        List<BamsArchiveVersion> versions = bamsArchiveVersionService.selectVersionsByArchiveId(archiveId);
        return success(versions);
    }

    /**
     * 新增档案
     */
    @PreAuthorize("@ss.hasPermi('system:archive:add')")
    @Log(title = "档案管理", businessType = BusinessType.INSERT)
    @PostMapping
    public AjaxResult add(@RequestBody BamsArchive bamsArchive)
    {
        int result = bamsArchiveService.insertBamsArchive(bamsArchive);
        if (result > 0)
        {
            // 更新项目统计数据
            if (bamsArchive.getProjectId() != null)
            {
                bamsProjectService.updateProjectStatistics(bamsArchive.getProjectId());
            }
            return success(bamsArchive.getArchiveId());
        }
        return error("新增档案失败");
    }

    /**
     * 修改档案
     */
    @PreAuthorize("@ss.hasPermi('system:archive:edit')")
    @Log(title = "档案管理", businessType = BusinessType.UPDATE)
    @PutMapping
    public AjaxResult edit(@RequestBody BamsArchive bamsArchive)
    {
        // 获取修改前的档案信息（用于处理项目变更的情况）
        BamsArchive oldArchive = bamsArchiveService.selectBamsArchiveByArchiveId(bamsArchive.getArchiveId());
        Long oldProjectId = oldArchive != null ? oldArchive.getProjectId() : null;

        int result = bamsArchiveService.updateBamsArchive(bamsArchive);
        if (result > 0)
        {
            // 更新新项目的统计数据
            if (bamsArchive.getProjectId() != null)
            {
                bamsProjectService.updateProjectStatistics(bamsArchive.getProjectId());
            }
            // 如果项目ID发生了变更，也要更新旧项目的统计数据
            if (oldProjectId != null && !oldProjectId.equals(bamsArchive.getProjectId()))
            {
                bamsProjectService.updateProjectStatistics(oldProjectId);
            }
        }
        return toAjax(result);
    }

    /**
     * 删除档案（逻辑删除，移至回收站）
     */
    @PreAuthorize("@ss.hasPermi('system:archive:remove')")
    @Log(title = "档案管理", businessType = BusinessType.DELETE)
    @DeleteMapping("/{archiveIds}")
    public AjaxResult remove(@PathVariable Long[] archiveIds)
    {
        // 获取需要更新统计的项目ID列表
        List<Long> projectIds = new java.util.ArrayList<>();
        for (Long archiveId : archiveIds)
        {
            BamsArchive archive = bamsArchiveService.selectBamsArchiveByArchiveId(archiveId);
            if (archive != null && archive.getProjectId() != null && !projectIds.contains(archive.getProjectId()))
            {
                projectIds.add(archive.getProjectId());
            }
        }

        int result = bamsArchiveService.recycleBamsArchiveByIds(archiveIds);
        if (result > 0)
        {
            // 更新所有相关项目的统计数据
            for (Long projectId : projectIds)
            {
                bamsProjectService.updateProjectStatistics(projectId);
            }
        }
        return toAjax(result);
    }

    /**
     * 恢复档案
     */
    @PreAuthorize("@ss.hasPermi('system:archive:edit')")
    @Log(title = "档案管理", businessType = BusinessType.UPDATE)
    @PutMapping("/restore/{archiveIds}")
    public AjaxResult restore(@PathVariable Long[] archiveIds)
    {
        // 获取需要更新统计的项目ID列表
        List<Long> projectIds = new java.util.ArrayList<>();
        for (Long archiveId : archiveIds)
        {
            BamsArchive archive = bamsArchiveService.selectBamsArchiveByArchiveId(archiveId);
            if (archive != null && archive.getProjectId() != null && !projectIds.contains(archive.getProjectId()))
            {
                projectIds.add(archive.getProjectId());
            }
        }

        int result = bamsArchiveService.restoreBamsArchiveByIds(archiveIds);
        if (result > 0)
        {
            // 更新所有相关项目的统计数据
            for (Long projectId : projectIds)
            {
                bamsProjectService.updateProjectStatistics(projectId);
            }
        }
        return toAjax(result);
    }

    /**
     * 永久删除档案
     */
    @PreAuthorize("@ss.hasPermi('system:archive:remove')")
    @Log(title = "档案管理", businessType = BusinessType.DELETE)
    @DeleteMapping("/permanent/{archiveIds}")
    public AjaxResult deletePermanently(@PathVariable Long[] archiveIds)
    {
        // 获取需要更新统计的项目ID列表（永久删除前）
        List<Long> projectIds = new java.util.ArrayList<>();
        for (Long archiveId : archiveIds)
        {
            BamsArchive archive = bamsArchiveService.selectBamsArchiveByArchiveId(archiveId);
            if (archive != null && archive.getProjectId() != null && !projectIds.contains(archive.getProjectId()))
            {
                projectIds.add(archive.getProjectId());
            }
        }

        int result = bamsArchiveService.deleteBamsArchiveByArchiveIds(archiveIds);
        if (result > 0)
        {
            // 更新所有相关项目的统计数据
            for (Long projectId : projectIds)
            {
                bamsProjectService.updateProjectStatistics(projectId);
            }
        }
        return toAjax(result);
    }

    /**
     * 生成档案编号
     */
    @PreAuthorize("@ss.hasPermi('system:archive:add')")
    @GetMapping("/generateNumber/{projectCode}")
    public AjaxResult generateNumber(@PathVariable String projectCode)
    {
        String archiveNumber = bamsArchiveService.generateArchiveNumber(projectCode);
        return success(archiveNumber);
    }

    /**
     * 校验档案编号唯一性
     */
    @GetMapping("/checkArchiveNumberUnique/{archiveNumber}")
    public AjaxResult checkArchiveNumberUnique(@PathVariable String archiveNumber)
    {
        boolean unique = bamsArchiveService.checkArchiveNumberUnique(archiveNumber);
        return success(unique);
    }
}
