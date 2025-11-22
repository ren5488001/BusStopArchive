package com.ruoyi.system.service;

import java.util.List;
import com.ruoyi.system.domain.BamsArchiveAuditLog;

/**
 * 档案审计日志Service接口
 *
 * @author ruoyi
 * @date 2025-11-19
 */
public interface IBamsArchiveAuditLogService
{
    /**
     * 查询档案审计日志
     *
     * @param logId 审计日志主键
     * @return 审计日志
     */
    public BamsArchiveAuditLog selectBamsArchiveAuditLogByLogId(Long logId);

    /**
     * 查询档案审计日志列表
     *
     * @param bamsArchiveAuditLog 审计日志
     * @return 审计日志集合
     */
    public List<BamsArchiveAuditLog> selectBamsArchiveAuditLogList(BamsArchiveAuditLog bamsArchiveAuditLog);

    /**
     * 根据档案ID查询审计日志
     *
     * @param archiveId 档案ID
     * @return 审计日志列表
     */
    public List<BamsArchiveAuditLog> selectLogsByArchiveId(Long archiveId);

    /**
     * 根据版本ID查询审计日志
     *
     * @param versionId 版本ID
     * @return 审计日志列表
     */
    public List<BamsArchiveAuditLog> selectLogsByVersionId(Long versionId);

    /**
     * 删除档案审计日志
     *
     * @param logId 审计日志主键
     * @return 结果
     */
    public int deleteBamsArchiveAuditLogByLogId(Long logId);

    /**
     * 批量删除档案审计日志
     *
     * @param logIds 需要删除的数据主键集合
     * @return 结果
     */
    public int deleteBamsArchiveAuditLogByLogIds(Long[] logIds);
}
