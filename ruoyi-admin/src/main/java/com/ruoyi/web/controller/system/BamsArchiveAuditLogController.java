package com.ruoyi.web.controller.system;

import java.util.List;
import jakarta.servlet.http.HttpServletResponse;

import com.ruoyi.common.utils.poi.ExcelUtil;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ruoyi.common.annotation.Log;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.enums.BusinessType;
import com.ruoyi.system.domain.BamsArchiveAuditLog;
import com.ruoyi.system.service.IBamsArchiveAuditLogService;
import com.ruoyi.common.core.page.TableDataInfo;

/**
 * 档案审计日志Controller
 *
 * @author ruoyi
 * @date 2025-11-19
 */
@RestController
@RequestMapping("/system/archive/auditLog")
public class BamsArchiveAuditLogController extends BaseController
{
    @Autowired
    private IBamsArchiveAuditLogService bamsArchiveAuditLogService;

    /**
     * 查询档案审计日志列表
     */
    @PreAuthorize("@ss.hasPermi('system:archive:list')")
    @GetMapping("/list")
    public TableDataInfo list(BamsArchiveAuditLog bamsArchiveAuditLog)
    {
        startPage();
        List<BamsArchiveAuditLog> list = bamsArchiveAuditLogService.selectBamsArchiveAuditLogList(bamsArchiveAuditLog);
        return getDataTable(list);
    }

    /**
     * 根据档案ID查询审计日志
     */
    @PreAuthorize("@ss.hasPermi('system:archive:query')")
    @GetMapping("/archive/{archiveId}")
    public AjaxResult getByArchiveId(@PathVariable Long archiveId)
    {
        List<BamsArchiveAuditLog> list = bamsArchiveAuditLogService.selectLogsByArchiveId(archiveId);
        return success(list);
    }

    /**
     * 根据版本ID查询审计日志
     */
    @PreAuthorize("@ss.hasPermi('system:archive:query')")
    @GetMapping("/version/{versionId}")
    public AjaxResult getByVersionId(@PathVariable Long versionId)
    {
        List<BamsArchiveAuditLog> list = bamsArchiveAuditLogService.selectLogsByVersionId(versionId);
        return success(list);
    }

    /**
     * 导出档案审计日志列表
     */
    @PreAuthorize("@ss.hasPermi('system:archive:export')")
    @Log(title = "档案审计日志", businessType = BusinessType.EXPORT)
    @GetMapping("/export")
    public void export(HttpServletResponse response, BamsArchiveAuditLog bamsArchiveAuditLog)
    {
        List<BamsArchiveAuditLog> list = bamsArchiveAuditLogService.selectBamsArchiveAuditLogList(bamsArchiveAuditLog);
        ExcelUtil<BamsArchiveAuditLog> util = new ExcelUtil<BamsArchiveAuditLog>(BamsArchiveAuditLog.class);
        util.exportExcel(response, list, "档案审计日志");
    }

    /**
     * 获取档案审计日志详细信息
     */
    @PreAuthorize("@ss.hasPermi('system:archive:query')")
    @GetMapping(value = "/{logId}")
    public AjaxResult getInfo(@PathVariable("logId") Long logId)
    {
        return success(bamsArchiveAuditLogService.selectBamsArchiveAuditLogByLogId(logId));
    }

    /**
     * 删除档案审计日志
     */
    @PreAuthorize("@ss.hasPermi('system:archive:remove')")
    @Log(title = "档案审计日志", businessType = BusinessType.DELETE)
    @DeleteMapping("/{logIds}")
    public AjaxResult remove(@PathVariable Long[] logIds)
    {
        return toAjax(bamsArchiveAuditLogService.deleteBamsArchiveAuditLogByLogIds(logIds));
    }
}
