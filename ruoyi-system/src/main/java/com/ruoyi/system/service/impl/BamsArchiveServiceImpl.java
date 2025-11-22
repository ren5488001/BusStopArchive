package com.ruoyi.system.service.impl;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.concurrent.TimeUnit;

import com.alibaba.fastjson2.JSON;
import com.ruoyi.common.utils.SecurityUtils;
import com.ruoyi.common.utils.ServletUtils;
import com.ruoyi.common.utils.ip.IpUtils;
import com.ruoyi.system.domain.BamsArchiveAuditLog;
import com.ruoyi.system.domain.BamsArchiveVersion;
import com.ruoyi.system.domain.BamsTagDictionary;
import com.ruoyi.system.mapper.BamsArchiveAuditLogMapper;
import com.ruoyi.system.mapper.BamsArchiveVersionMapper;
import com.ruoyi.system.mapper.BamsTagDictionaryMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import com.ruoyi.system.mapper.BamsArchiveMapper;
import com.ruoyi.system.domain.BamsArchive;
import com.ruoyi.system.service.IBamsArchiveService;
import org.springframework.transaction.annotation.Transactional;

/**
 * 档案管理Service业务层处理
 *
 * @author ruoyi
 * @date 2025-11-19
 */
@Service
public class BamsArchiveServiceImpl implements IBamsArchiveService
{
    private static final String ARCHIVE_NUMBER_LOCK_KEY = "bams:archive:number:lock:";
    private static final long LOCK_TIMEOUT = 10;

    @Autowired
    private BamsArchiveMapper bamsArchiveMapper;

    @Autowired
    private BamsArchiveVersionMapper versionMapper;

    @Autowired
    private BamsArchiveAuditLogMapper auditLogMapper;

    @Autowired
    private BamsTagDictionaryMapper tagDictionaryMapper;

    @Autowired
    private RedisTemplate<Object, Object> redisTemplate;

    /**
     * 查询档案
     *
     * @param archiveId 档案主键
     * @return 档案
     */
    @Override
    public BamsArchive selectBamsArchiveByArchiveId(Long archiveId)
    {
        BamsArchive archive = bamsArchiveMapper.selectBamsArchiveByArchiveId(archiveId);
        if (archive != null)
        {
            // 查询版本列表
            List<BamsArchiveVersion> versions = versionMapper.selectVersionsByArchiveId(archiveId);
            archive.setVersions(versions);

            // 解析标签JSON
            if (archive.getTags() != null && !archive.getTags().isEmpty())
            {
                archive.setTagList(JSON.parseArray(archive.getTags(), String.class));
            }
        }
        return archive;
    }

    /**
     * 查询档案列表
     *
     * @param bamsArchive 档案
     * @return 档案
     */
    @Override
    public List<BamsArchive> selectBamsArchiveList(BamsArchive bamsArchive)
    {
        List<BamsArchive> list = bamsArchiveMapper.selectBamsArchiveList(bamsArchive);
        // 解析标签
        for (BamsArchive archive : list)
        {
            if (archive.getTags() != null && !archive.getTags().isEmpty())
            {
                archive.setTagList(JSON.parseArray(archive.getTags(), String.class));
            }
        }
        return list;
    }

    /**
     * 新增档案
     *
     * @param bamsArchive 档案
     * @return 结果
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public int insertBamsArchive(BamsArchive bamsArchive)
    {
        // 生成档案编号
        if (bamsArchive.getArchiveNumber() == null || bamsArchive.getArchiveNumber().isEmpty())
        {
            String archiveNumber = generateArchiveNumber(bamsArchive.getProjectCode());
            bamsArchive.setArchiveNumber(archiveNumber);
        }

        // 处理标签
        handleTags(bamsArchive, null);

        // 设置创建信息
        bamsArchive.setCreateTime(new Date());
        bamsArchive.setDelFlag("0");
        bamsArchive.setStatus("0");

        // 插入档案记录
        int result = bamsArchiveMapper.insertBamsArchive(bamsArchive);

        // 记录审计日志
        createAuditLog(bamsArchive.getArchiveId(), null, "CREATE", "档案管理",
                "创建档案：" + bamsArchive.getTitle(), null, null, null);

        return result;
    }

    /**
     * 修改档案
     *
     * @param bamsArchive 档案
     * @return 结果
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public int updateBamsArchive(BamsArchive bamsArchive)
    {
        // 查询原档案信息
        BamsArchive oldArchive = bamsArchiveMapper.selectBamsArchiveByArchiveId(bamsArchive.getArchiveId());
        if (oldArchive == null)
        {
            throw new RuntimeException("档案不存在");
        }

        // 处理标签变更
        handleTags(bamsArchive, oldArchive.getTags());

        // 设置更新时间
        bamsArchive.setUpdateTime(new Date());

        // 更新档案
        int result = bamsArchiveMapper.updateBamsArchive(bamsArchive);

        // 记录元数据修改审计日志
        recordMetadataChanges(bamsArchive, oldArchive);

        return result;
    }

    /**
     * 批量删除档案
     *
     * @param archiveIds 需要删除的档案主键
     * @return 结果
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public int deleteBamsArchiveByArchiveIds(Long[] archiveIds)
    {
        int count = 0;
        for (Long archiveId : archiveIds)
        {
            count += deleteBamsArchiveByArchiveId(archiveId);
        }
        return count;
    }

    /**
     * 删除档案信息
     *
     * @param archiveId 档案主键
     * @return 结果
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public int deleteBamsArchiveByArchiveId(Long archiveId)
    {
        BamsArchive archive = bamsArchiveMapper.selectBamsArchiveByArchiveId(archiveId);
        if (archive == null)
        {
            return 0;
        }

        // 减少标签使用次数
        decrementTagUsage(archive.getTags());

        // 删除版本记录
        versionMapper.deleteByArchiveId(archiveId);

        // 删除审计日志
        auditLogMapper.deleteByArchiveId(archiveId);

        // 记录删除日志
        createAuditLog(archiveId, null, "DELETE", "档案管理",
                "删除档案：" + archive.getTitle(), null, null, null);

        // 删除档案
        return bamsArchiveMapper.deleteBamsArchiveByArchiveId(archiveId);
    }

    /**
     * 逻辑删除档案
     *
     * @param archiveId 档案主键
     * @return 结果
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public int recycleBamsArchive(Long archiveId)
    {
        BamsArchive archive = bamsArchiveMapper.selectBamsArchiveByArchiveId(archiveId);
        if (archive == null)
        {
            return 0;
        }

        // 记录审计日志
        createAuditLog(archiveId, null, "RECYCLE", "档案管理",
                "将档案移至回收站：" + archive.getTitle(), null, null, null);

        return bamsArchiveMapper.updateDelFlag(archiveId, "1");
    }

    /**
     * 批量逻辑删除档案
     *
     * @param archiveIds 档案主键集合
     * @return 结果
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public int recycleBamsArchiveByIds(Long[] archiveIds)
    {
        int count = 0;
        for (Long archiveId : archiveIds)
        {
            count += recycleBamsArchive(archiveId);
        }
        return count;
    }

    /**
     * 恢复已删除的档案
     *
     * @param archiveId 档案主键
     * @return 结果
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public int restoreBamsArchive(Long archiveId)
    {
        BamsArchive archive = bamsArchiveMapper.selectBamsArchiveByArchiveId(archiveId);
        if (archive == null)
        {
            return 0;
        }

        // 记录审计日志
        createAuditLog(archiveId, null, "RESTORE", "档案管理",
                "从回收站恢复档案：" + archive.getTitle(), null, null, null);

        return bamsArchiveMapper.updateDelFlag(archiveId, "0");
    }

    /**
     * 批量恢复档案
     *
     * @param archiveIds 档案主键集合
     * @return 结果
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public int restoreBamsArchiveByIds(Long[] archiveIds)
    {
        int count = 0;
        for (Long archiveId : archiveIds)
        {
            count += restoreBamsArchive(archiveId);
        }
        return count;
    }

    /**
     * 生成档案编号
     *
     * @param projectCode 项目编号
     * @return 档案编号
     */
    @Override
    public String generateArchiveNumber(String projectCode)
    {
        String lockKey = ARCHIVE_NUMBER_LOCK_KEY + projectCode;
        try
        {
            // 获取分布式锁
            Boolean locked = redisTemplate.opsForValue().setIfAbsent(lockKey, "1", LOCK_TIMEOUT, TimeUnit.SECONDS);
            if (Boolean.TRUE.equals(locked))
            {
                try
                {
                    // 查询当前项目最大流水号
                    int maxSeq = bamsArchiveMapper.getMaxSequenceByProject(projectCode);
                    int nextSeq = maxSeq + 1;

                    // 生成档案编号：项目编号-流水号（4位）
                    return String.format("%s-%04d", projectCode, nextSeq);
                }
                finally
                {
                    // 释放锁
                    redisTemplate.delete(lockKey);
                }
            }
            else
            {
                // 获取锁失败，等待重试
                Thread.sleep(100);
                return generateArchiveNumber(projectCode);
            }
        }
        catch (InterruptedException e)
        {
            Thread.currentThread().interrupt();
            throw new RuntimeException("生成档案编号失败：线程被中断", e);
        }
        catch (Exception e)
        {
            throw new RuntimeException("生成档案编号失败", e);
        }
    }

    /**
     * 校验档案编号是否唯一
     *
     * @param archiveNumber 档案编号
     * @return 结果
     */
    @Override
    public boolean checkArchiveNumberUnique(String archiveNumber)
    {
        BamsArchive archive = bamsArchiveMapper.selectBamsArchiveByArchiveNumber(archiveNumber);
        return archive == null;
    }

    /**
     * 处理标签
     */
    private void handleTags(BamsArchive archive, String oldTagsJson)
    {
        List<String> newTags = archive.getTagList();
        List<String> oldTags = new ArrayList<>();

        if (oldTagsJson != null && !oldTagsJson.isEmpty())
        {
            oldTags = JSON.parseArray(oldTagsJson, String.class);
        }

        // 转换为JSON字符串
        if (newTags != null && !newTags.isEmpty())
        {
            archive.setTags(JSON.toJSONString(newTags));

            // 增加新标签的使用次数
            for (String tagName : newTags)
            {
                if (!oldTags.contains(tagName))
                {
                    BamsTagDictionary tag = tagDictionaryMapper.selectBamsTagDictionaryByTagName(tagName);
                    if (tag != null)
                    {
                        tagDictionaryMapper.incrementUsageCount(tag.getTagId());
                    }
                }
            }
        }
        else
        {
            archive.setTags(null);
        }

        // 减少移除标签的使用次数
        for (String tagName : oldTags)
        {
            if (newTags == null || !newTags.contains(tagName))
            {
                BamsTagDictionary tag = tagDictionaryMapper.selectBamsTagDictionaryByTagName(tagName);
                if (tag != null)
                {
                    tagDictionaryMapper.decrementUsageCount(tag.getTagId());
                }
            }
        }
    }

    /**
     * 减少标签使用次数
     */
    private void decrementTagUsage(String tagsJson)
    {
        if (tagsJson != null && !tagsJson.isEmpty())
        {
            List<String> tags = JSON.parseArray(tagsJson, String.class);
            for (String tagName : tags)
            {
                BamsTagDictionary tag = tagDictionaryMapper.selectBamsTagDictionaryByTagName(tagName);
                if (tag != null)
                {
                    tagDictionaryMapper.decrementUsageCount(tag.getTagId());
                }
            }
        }
    }

    /**
     * 记录元数据修改审计日志
     */
    private void recordMetadataChanges(BamsArchive newArchive, BamsArchive oldArchive)
    {
        List<BamsArchiveAuditLog> logs = new ArrayList<>();

        // 标题
        if (!equals(oldArchive.getTitle(), newArchive.getTitle()))
        {
            logs.add(buildMetadataLog(newArchive.getArchiveId(), "title", "标题",
                    oldArchive.getTitle(), newArchive.getTitle()));
        }

        // 文件日期
        if (!equals(oldArchive.getFileDate(), newArchive.getFileDate()))
        {
            logs.add(buildMetadataLog(newArchive.getArchiveId(), "file_date", "文件日期",
                    String.valueOf(oldArchive.getFileDate()), String.valueOf(newArchive.getFileDate())));
        }

        // 描述
        if (!equals(oldArchive.getDescription(), newArchive.getDescription()))
        {
            logs.add(buildMetadataLog(newArchive.getArchiveId(), "description", "描述",
                    oldArchive.getDescription(), newArchive.getDescription()));
        }

        // 标签
        if (!equals(oldArchive.getTags(), newArchive.getTags()))
        {
            logs.add(buildMetadataLog(newArchive.getArchiveId(), "tags", "标签",
                    oldArchive.getTags(), newArchive.getTags()));
        }

        // 摘要
        if (!equals(oldArchive.getSummary(), newArchive.getSummary()))
        {
            logs.add(buildMetadataLog(newArchive.getArchiveId(), "summary", "摘要",
                    oldArchive.getSummary(), newArchive.getSummary()));
        }

        // 状态
        if (!equals(oldArchive.getStatus(), newArchive.getStatus()))
        {
            logs.add(buildMetadataLog(newArchive.getArchiveId(), "status", "状态",
                    oldArchive.getStatus(), newArchive.getStatus()));
        }

        // 备注
        if (!equals(oldArchive.getRemark(), newArchive.getRemark()))
        {
            logs.add(buildMetadataLog(newArchive.getArchiveId(), "remark", "备注",
                    oldArchive.getRemark(), newArchive.getRemark()));
        }

        // 批量插入审计日志
        if (!logs.isEmpty())
        {
            auditLogMapper.batchInsertAuditLog(logs);
        }
    }

    /**
     * 构建元数据修改日志
     */
    private BamsArchiveAuditLog buildMetadataLog(Long archiveId, String fieldName, String fieldLabel,
                                                   String oldValue, String newValue)
    {
        BamsArchiveAuditLog log = new BamsArchiveAuditLog();
        log.setArchiveId(archiveId);
        log.setOperationType("UPDATE");
        log.setOperationModule("元数据修改");
        log.setOperationDesc("修改" + fieldLabel);
        log.setFieldName(fieldName);
        log.setOldValue(oldValue);
        log.setNewValue(newValue);
        log.setOperator(SecurityUtils.getUsername());
        log.setOperationTime(new Date());
        log.setIpAddress(IpUtils.getIpAddr());
        return log;
    }

    /**
     * 创建审计日志
     */
    private void createAuditLog(Long archiveId, Long versionId, String operationType,
                                 String module, String desc, String fieldName,
                                 String oldValue, String newValue)
    {
        BamsArchiveAuditLog log = new BamsArchiveAuditLog();
        log.setArchiveId(archiveId);
        log.setVersionId(versionId);
        log.setOperationType(operationType);
        log.setOperationModule(module);
        log.setOperationDesc(desc);
        log.setFieldName(fieldName);
        log.setOldValue(oldValue);
        log.setNewValue(newValue);
        log.setOperator(SecurityUtils.getUsername());
        log.setOperationTime(new Date());
        log.setIpAddress(IpUtils.getIpAddr());
        auditLogMapper.insertBamsArchiveAuditLog(log);
    }

    /**
     * 比较两个对象是否相等
     */
    private boolean equals(Object obj1, Object obj2)
    {
        if (obj1 == null && obj2 == null)
        {
            return true;
        }
        if (obj1 == null || obj2 == null)
        {
            return false;
        }
        return obj1.equals(obj2);
    }
}
