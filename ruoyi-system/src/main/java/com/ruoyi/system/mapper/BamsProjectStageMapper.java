package com.ruoyi.system.mapper;

import java.util.List;
import com.ruoyi.system.domain.BamsProjectStage;

/**
 * 项目阶段实例Mapper接口
 *
 * @author Rick
 */
public interface BamsProjectStageMapper
{
    /**
     * 查询项目的阶段列表
     *
     * @param projectId 项目ID
     * @return 阶段列表
     */
    public List<BamsProjectStage> selectByProjectId(Long projectId);

    /**
     * 根据阶段ID查询阶段信息
     *
     * @param stageId 阶段ID
     * @return 阶段信息
     */
    public BamsProjectStage selectByStageId(Long stageId);

    /**
     * 批量插入阶段数据
     *
     * @param stages 阶段列表
     * @return 结果
     */
    public int batchInsert(List<BamsProjectStage> stages);

    /**
     * 更新阶段信息
     *
     * @param stage 阶段信息
     * @return 结果
     */
    public int updateById(BamsProjectStage stage);

    /**
     * 根据项目ID删除阶段数据
     *
     * @param projectId 项目ID
     * @return 结果
     */
    public int deleteByProjectId(Long projectId);
}
