package com.ruoyi.system.service;

import java.util.List;
import com.ruoyi.system.domain.BamsProject;
import com.ruoyi.system.domain.BamsProjectStage;

/**
 * 项目信息Service接口
 *
 * @author Rick
 */
public interface IBamsProjectService
{
    /**
     * 查询项目列表
     */
    public List<BamsProject> selectProjectList(BamsProject project);

    /**
     * 根据项目ID查询项目信息
     */
    public BamsProject selectProjectById(Long projectId);

    /**
     * 根据项目编号查询项目信息
     */
    public BamsProject selectProjectByCode(String projectCode);

    /**
     * 新增项目（自动生成项目编号，自动应用阶段模板）
     */
    public int insertProject(BamsProject project);

    /**
     * 修改项目（模板变化时自动应用模板并刷新完整度）
     *
     * 业务逻辑：
     * 1. 检测 templateId 是否发生变化
     * 2. 如果模板变化：应用新模板 + 刷新档案完整度
     * 3. 如果模板未变化：仅更新基本信息
     */
    public int updateProject(BamsProject project);

    /**
     * 逻辑删除项目
     */
    public int deleteProjectByIds(Long[] projectIds);

    /**
     * 校验项目编号是否唯一
     */
    public boolean checkProjectCodeUnique(BamsProject project);

    /**
     * 查询项目的阶段列表
     */
    public List<BamsProjectStage> selectProjectStages(Long projectId);

    /**
     * 更新项目和阶段的统计数据
     * 包括：已归档文件数、完整度
     *
     * @param projectId 项目ID
     */
    public void updateProjectStatistics(Long projectId);

    /**
     * 获取项目的档案数量
     *
     * @param projectId 项目ID
     * @return 档案数量
     */
    public int getArchiveCountByProjectId(Long projectId);
}
