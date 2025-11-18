package com.ruoyi.system.mapper;

import java.util.List;
import com.ruoyi.system.domain.BamsProject;

/**
 * 项目信息Mapper接口
 *
 * @author Rick
 */
public interface BamsProjectMapper
{
    /**
     * 查询项目列表
     *
     * @param project 项目信息
     * @return 项目集合
     */
    public List<BamsProject> selectProjectList(BamsProject project);

    /**
     * 根据项目ID查询项目信息
     *
     * @param projectId 项目ID
     * @return 项目信息
     */
    public BamsProject selectProjectById(Long projectId);

    /**
     * 根据项目编号查询项目信息
     *
     * @param projectCode 项目编号
     * @return 项目信息
     */
    public BamsProject selectProjectByCode(String projectCode);

    /**
     * 新增项目
     *
     * @param project 项目信息
     * @return 结果
     */
    public int insertProject(BamsProject project);

    /**
     * 修改项目
     *
     * @param project 项目信息
     * @return 结果
     */
    public int updateProject(BamsProject project);

    /**
     * 逻辑删除项目
     *
     * @param projectIds 需要删除的项目ID数组
     * @return 结果
     */
    public int deleteProjectByIds(Long[] projectIds);

    /**
     * 校验项目编号是否唯一
     *
     * @param projectCode 项目编号
     * @return 结果
     */
    public BamsProject checkProjectCodeUnique(String projectCode);

    /**
     * 查询最大项目编号
     *
     * @return 最大项目编号
     */
    public String selectMaxCode();
}
