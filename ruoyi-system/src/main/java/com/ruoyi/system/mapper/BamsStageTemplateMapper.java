package com.ruoyi.system.mapper;

import java.util.List;
import com.ruoyi.system.domain.BamsStageTemplate;

/**
 * 项目阶段模板 数据层
 *
 * @author Rick
 */
public interface BamsStageTemplateMapper
{
    /**
     * 查询阶段模板信息
     *
     * @param templateId 模板ID
     * @return 阶段模板信息
     */
    public BamsStageTemplate selectTemplateById(Long templateId);

    /**
     * 查询阶段模板列表
     *
     * @param template 阶段模板信息
     * @return 阶段模板集合
     */
    public List<BamsStageTemplate> selectTemplateList(BamsStageTemplate template);

    /**
     * 新增阶段模板
     *
     * @param template 阶段模板信息
     * @return 结果
     */
    public int insertTemplate(BamsStageTemplate template);

    /**
     * 修改阶段模板
     *
     * @param template 阶段模板信息
     * @return 结果
     */
    public int updateTemplate(BamsStageTemplate template);

    /**
     * 删除阶段模板
     *
     * @param templateId 模板ID
     * @return 结果
     */
    public int deleteTemplateById(Long templateId);

    /**
     * 批量删除阶段模板
     *
     * @param templateIds 需要删除的模板ID
     * @return 结果
     */
    public int deleteTemplateByIds(Long[] templateIds);
}
