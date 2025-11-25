package com.ruoyi.system.mapper;

import java.util.List;
import com.ruoyi.system.domain.BamsArchiveVersion;
import org.apache.ibatis.annotations.Param;

/**
 * 档案版本Mapper接口
 *
 * @author ruoyi
 * @date 2025-11-19
 */
public interface BamsArchiveVersionMapper {
    /**
     * 查询档案版本
     *
     * @param versionId 档案版本主键
     * @return 档案版本
     */
    public BamsArchiveVersion selectBamsArchiveVersionByVersionId(Long versionId);

    /**
     * 查询档案版本列表
     *
     * @param bamsArchiveVersion 档案版本
     * @return 档案版本集合
     */
    public List<BamsArchiveVersion> selectBamsArchiveVersionList(BamsArchiveVersion bamsArchiveVersion);

    /**
     * 根据档案ID查询版本列表
     *
     * @param archiveId 档案ID
     * @return 版本列表
     */
    public List<BamsArchiveVersion> selectVersionsByArchiveId(Long archiveId);

    /**
     * 新增档案版本
     *
     * @param bamsArchiveVersion 档案版本
     * @return 结果
     */
    public int insertBamsArchiveVersion(BamsArchiveVersion bamsArchiveVersion);

    /**
     * 修改档案版本
     *
     * @param bamsArchiveVersion 档案版本
     * @return 结果
     */
    public int updateBamsArchiveVersion(BamsArchiveVersion bamsArchiveVersion);

    /**
     * 删除档案版本
     *
     * @param versionId 档案版本主键
     * @return 结果
     */
    public int deleteBamsArchiveVersionByVersionId(Long versionId);

    /**
     * 批量删除档案版本
     *
     * @param versionIds 需要删除的数据主键集合
     * @return 结果
     */
    public int deleteBamsArchiveVersionByVersionIds(Long[] versionIds);

    /**
     * 根据档案ID删除版本记录
     *
     * @param archiveId 档案ID
     * @return 结果
     */
    public int deleteByArchiveId(Long archiveId);

    /**
     * 取消当前版本标识
     *
     * @param archiveId 档案ID
     * @return 结果
     */
    public int cancelCurrentVersion(@Param("archiveId") Long archiveId);

    /**
     * 获取当前版本
     *
     * @param archiveId 档案ID
     * @return 当前版本
     */
    public BamsArchiveVersion selectCurrentVersion(@Param("archiveId") Long archiveId);
}
