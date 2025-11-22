package com.ruoyi.system.service;

import java.util.List;
import com.ruoyi.system.domain.BamsArchive;

/**
 * 档案管理Service接口
 *
 * @author ruoyi
 * @date 2025-11-19
 */
public interface IBamsArchiveService
{
    /**
     * 查询档案
     *
     * @param archiveId 档案主键
     * @return 档案
     */
    public BamsArchive selectBamsArchiveByArchiveId(Long archiveId);

    /**
     * 查询档案列表
     *
     * @param bamsArchive 档案
     * @return 档案集合
     */
    public List<BamsArchive> selectBamsArchiveList(BamsArchive bamsArchive);

    /**
     * 新增档案
     *
     * @param bamsArchive 档案
     * @return 结果
     */
    public int insertBamsArchive(BamsArchive bamsArchive);

    /**
     * 修改档案
     *
     * @param bamsArchive 档案
     * @return 结果
     */
    public int updateBamsArchive(BamsArchive bamsArchive);

    /**
     * 批量删除档案
     *
     * @param archiveIds 需要删除的档案主键集合
     * @return 结果
     */
    public int deleteBamsArchiveByArchiveIds(Long[] archiveIds);

    /**
     * 删除档案信息
     *
     * @param archiveId 档案主键
     * @return 结果
     */
    public int deleteBamsArchiveByArchiveId(Long archiveId);

    /**
     * 逻辑删除档案（移至回收站）
     *
     * @param archiveId 档案主键
     * @return 结果
     */
    public int recycleBamsArchive(Long archiveId);

    /**
     * 批量逻辑删除档案
     *
     * @param archiveIds 档案主键集合
     * @return 结果
     */
    public int recycleBamsArchiveByIds(Long[] archiveIds);

    /**
     * 恢复已删除的档案
     *
     * @param archiveId 档案主键
     * @return 结果
     */
    public int restoreBamsArchive(Long archiveId);

    /**
     * 批量恢复档案
     *
     * @param archiveIds 档案主键集合
     * @return 结果
     */
    public int restoreBamsArchiveByIds(Long[] archiveIds);

    /**
     * 生成档案编号
     *
     * @param projectCode 项目编号
     * @return 档案编号
     */
    public String generateArchiveNumber(String projectCode);

    /**
     * 校验档案编号是否唯一
     *
     * @param archiveNumber 档案编号
     * @return 结果
     */
    public boolean checkArchiveNumberUnique(String archiveNumber);
}
