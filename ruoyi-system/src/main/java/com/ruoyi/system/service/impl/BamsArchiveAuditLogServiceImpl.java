package com.ruoyi.system.service.impl;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ruoyi.system.mapper.BamsArchiveAuditLogMapper;
import com.ruoyi.system.domain.BamsArchiveAuditLog;
import com.ruoyi.system.service.IBamsArchiveAuditLogService;

/**
 * 档案审计日志Service业务层处理
 *
 * @author ruoyi
 * @date 2025-11-19
 */
@Service
public class BamsArchiveAuditLogServiceImpl implements IBamsArchiveAuditLogService
{
    @Autowired
    private BamsArchiveAuditLogMapper bamsArchiveAuditLogMapper;

    /**
     * 查询档案审计日志
     *
     * @param logId 审计日志主键
     * @return 审计日志
     */
    @Override
    public BamsArchiveAuditLog selectBamsArchiveAuditLogByLogId(Long logId)
    {
        return bamsArchiveAuditLogMapper.selectBamsArchiveAuditLogByLogId(logId);
    }

    /**
     * 查询档案审计日志列表
     *
     * @param bamsArchiveAuditLog 审计日志
     * @return 审计日志
     */
    @Override
    public List<BamsArchiveAuditLog> selectBamsArchiveAuditLogList(BamsArchiveAuditLog bamsArchiveAuditLog)
    {
        return bamsArchiveAuditLogMapper.selectBamsArchiveAuditLogList(bamsArchiveAuditLog);
    }

    /**
     * 根据档案ID查询审计日志
     *
     * @param archiveId 档案ID
     * @return 审计日志列表
     */
    @Override
    public List<BamsArchiveAuditLog> selectLogsByArchiveId(Long archiveId)
    {
        return bamsArchiveAuditLogMapper.selectLogsByArchiveId(archiveId);
    }

    /**
     * 根据版本ID查询审计日志
     *
     * @param versionId 版本ID
     * @return 审计日志列表
     */
    @Override
    public List<BamsArchiveAuditLog> selectLogsByVersionId(Long versionId)
    {
        return bamsArchiveAuditLogMapper.selectLogsByVersionId(versionId);
    }

    /**
     * 删除档案审计日志
     *
     * @param logId 审计日志主键
     * @return 结果
     */
    @Override
    public int deleteBamsArchiveAuditLogByLogId(Long logId)
    {
        return bamsArchiveAuditLogMapper.deleteBamsArchiveAuditLogByLogId(logId);
    }

    /**
     * 批量删除档案审计日志
     *
     * @param logIds 需要删除的数据主键集合
     * @return 结果
     */
    @Override
    public int deleteBamsArchiveAuditLogByLogIds(Long[] logIds)
    {
        return bamsArchiveAuditLogMapper.deleteBamsArchiveAuditLogByLogIds(logIds);
    }
}
