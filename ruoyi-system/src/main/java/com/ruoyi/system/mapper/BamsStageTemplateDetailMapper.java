package com.ruoyi.system.mapper;

import java.util.List;
import com.ruoyi.system.domain.BamsStageTemplateDetail;

/**
 * 项目阶段模板明细 数据层
 *
 * @author Rick
 */
public interface BamsStageTemplateDetailMapper
{
    /**
     * 根据模板ID查询阶段明细列表
     *
     * @param templateId 模板ID
     * @return 阶段明细集合
     */
    public List<BamsStageTemplateDetail> selectDetailListByTemplateId(Long templateId);

    /**
     * 批量新增阶段明细
     *
     * @param detailList 阶段明细列表
     * @return 结果
     */
    public int batchInsertDetail(List<BamsStageTemplateDetail> detailList);

    /**
     * 根据模板ID删除阶段明细
     *
     * @param templateId 模板ID
     * @return 结果
     */
    public int deleteDetailByTemplateId(Long templateId);

    /**
     * 根据模板ID数组删除阶段明细
     *
     * @param templateIds 模板ID数组
     * @return 结果
     */
    public int deleteDetailByTemplateIds(Long[] templateIds);
}
