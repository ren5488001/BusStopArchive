package com.ruoyi.system.mapper;

import java.util.List;
import com.ruoyi.system.domain.BamsArchive;
import org.apache.ibatis.annotations.Param;

/**
 * 档案管理Mapper接口
 *
 * @author ruoyi
 * @date 2025-11-19
 */
public interface BamsArchiveMapper
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
     * 删除档案
     *
     * @param archiveId 档案主键
     * @return 结果
     */
    public int deleteBamsArchiveByArchiveId(Long archiveId);

    /**
     * 批量删除档案
     *
     * @param archiveIds 需要删除的数据主键集合
     * @return 结果
     */
    public int deleteBamsArchiveByArchiveIds(Long[] archiveIds);

    /**
     * 根据档号查询档案
     *
     * @param archiveNumber 档号
     * @return 档案
     */
    public BamsArchive selectBamsArchiveByArchiveNumber(String archiveNumber);

    /**
     * 获取指定项目下的最大流水号
     *
     * @param projectCode 项目编号
     * @return 最大流水号
     */
    public int getMaxSequenceByProject(@Param("projectCode") String projectCode);

    /**
     * 逻辑删除档案
     *
     * @param archiveId 档案主键
     * @return 结果
     */
    public int updateDelFlag(@Param("archiveId") Long archiveId, @Param("delFlag") String delFlag);

    /**
     * 更新档案版本信息
     *
     * @param archiveId 档案主键
     * @param currentVersion 当前版本号
     * @param versionCount 版本数
     * @param fileSize 文件大小
     * @return 结果
     */
    public int updateVersionInfo(@Param("archiveId") Long archiveId,
                                  @Param("currentVersion") String currentVersion,
                                  @Param("versionCount") Integer versionCount,
                                  @Param("fileSize") Long fileSize);

    /**
     * 统计档案总数（排除已删除）
     *
     * @return 档案总数
     */
    Integer countTotalArchives();

    /**
     * 获取档案类型分布
     *
     * @return 档案类型分布列表
     */
    List<java.util.Map<String, Object>> getArchiveTypeDistribution();

    /**
     * 获取按阶段归档数量
     *
     * @return 按阶段归档数量列表
     */
    List<java.util.Map<String, Object>> getArchiveByStage();

    /**
     * 获取近半年新增趋势
     *
     * @return 近半年新增趋势列表
     */
    List<java.util.Map<String, Object>> getMonthlyTrend();

    /**
     * 统计指定项目的档案数量（排除已删除）
     *
     * @param projectId 项目ID
     * @return 档案数量
     */
    int countArchivesByProjectId(@Param("projectId") Long projectId);

    /**
     * 逻辑删除指定项目的所有档案
     *
     * @param projectId 项目ID
     * @return 结果
     */
    int deleteArchivesByProjectId(@Param("projectId") Long projectId);
}
