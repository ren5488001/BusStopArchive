package com.ruoyi.system.service.impl;

import java.util.List;
import java.util.Set;
import java.util.HashSet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ruoyi.common.exception.ServiceException;
import com.ruoyi.common.utils.SecurityUtils;
import com.ruoyi.system.domain.BamsStageTemplate;
import com.ruoyi.system.domain.BamsStageTemplateDetail;
import com.ruoyi.system.mapper.BamsStageTemplateMapper;
import com.ruoyi.system.mapper.BamsStageTemplateDetailMapper;
import com.ruoyi.system.service.IBamsStageTemplateService;

/**
 * 项目阶段模板 服务层实现
 *
 * @author Rick
 */
@Service
public class BamsStageTemplateServiceImpl implements IBamsStageTemplateService
{
    @Autowired
    private BamsStageTemplateMapper templateMapper;

    @Autowired
    private BamsStageTemplateDetailMapper detailMapper;

    /**
     * 查询阶段模板信息
     *
     * @param templateId 模板ID
     * @return 阶段模板信息（含阶段明细）
     */
    @Override
    public BamsStageTemplate selectTemplateById(Long templateId)
    {
        return templateMapper.selectTemplateById(templateId);
    }

    /**
     * 查询阶段模板列表
     *
     * @param template 阶段模板信息
     * @return 阶段模板集合
     */
    @Override
    public List<BamsStageTemplate> selectTemplateList(BamsStageTemplate template)
    {
        return templateMapper.selectTemplateList(template);
    }

    /**
     * 新增阶段模板
     *
     * @param template 阶段模板信息（含阶段明细）
     * @return 结果
     */
    @Override
    @Transactional
    public int insertTemplate(BamsStageTemplate template)
    {
        // 验证阶段名称是否重复
        validateStageNames(template);

        // 设置创建人
        template.setCreateBy(SecurityUtils.getUsername());
        // 设置状态和删除标志
        template.setStatus("0");
        template.setDelFlag("0");
        // 设置阶段总数
        if (template.getStages() != null)
        {
            template.setStageCount(template.getStages().size());
        }

        // 插入模板主表
        int rows = templateMapper.insertTemplate(template);

        // 插入阶段明细
        insertStageDetails(template);

        return rows;
    }

    /**
     * 修改阶段模板
     *
     * @param template 阶段模板信息（含阶段明细）
     * @return 结果
     */
    @Override
    @Transactional
    public int updateTemplate(BamsStageTemplate template)
    {
        // 验证阶段名称是否重复
        validateStageNames(template);

        // 设置更新人
        template.setUpdateBy(SecurityUtils.getUsername());
        // 设置阶段总数
        if (template.getStages() != null)
        {
            template.setStageCount(template.getStages().size());
        }

        // 删除原有阶段明细
        detailMapper.deleteDetailByTemplateId(template.getTemplateId());

        // 插入新的阶段明细
        insertStageDetails(template);

        // 更新模板主表
        return templateMapper.updateTemplate(template);
    }

    /**
     * 批量删除阶段模板
     *
     * @param templateIds 需要删除的模板ID
     * @return 结果
     */
    @Override
    @Transactional
    public int deleteTemplateByIds(Long[] templateIds)
    {
        // 删除阶段明细
        detailMapper.deleteDetailByTemplateIds(templateIds);

        // 删除模板主表（逻辑删除）
        return templateMapper.deleteTemplateByIds(templateIds);
    }

    /**
     * 删除阶段模板信息
     *
     * @param templateId 模板ID
     * @return 结果
     */
    @Override
    @Transactional
    public int deleteTemplateById(Long templateId)
    {
        // 删除阶段明细
        detailMapper.deleteDetailByTemplateId(templateId);

        // 删除模板主表（逻辑删除）
        return templateMapper.deleteTemplateById(templateId);
    }

    /**
     * 复制阶段模板
     *
     * @param templateId 要复制的模板ID
     * @param newName 新模板名称（可选，为空则自动生成）
     * @return 新模板ID
     */
    @Override
    @Transactional
    public Long copyTemplate(Long templateId, String newName)
    {
        // 查询原模板及其明细
        BamsStageTemplate sourceTemplate = templateMapper.selectTemplateById(templateId);
        if (sourceTemplate == null)
        {
            throw new RuntimeException("原模板不存在");
        }

        // 创建新模板
        BamsStageTemplate newTemplate = new BamsStageTemplate();
        // 使用传入的新名称，如果为空则使用默认规则
        if (newName != null && !newName.trim().isEmpty())
        {
            newTemplate.setTemplateName(newName.trim());
        }
        else
        {
            newTemplate.setTemplateName(sourceTemplate.getTemplateName() + "（副本）");
        }
        newTemplate.setTemplateDesc(sourceTemplate.getTemplateDesc());
        newTemplate.setStageCount(sourceTemplate.getStageCount());
        newTemplate.setStatus("0");
        newTemplate.setDelFlag("0");
        newTemplate.setRemark(sourceTemplate.getRemark());
        newTemplate.setCreateBy(SecurityUtils.getUsername());
        newTemplate.setStages(sourceTemplate.getStages());

        // 插入新模板
        templateMapper.insertTemplate(newTemplate);

        // 插入阶段明细
        insertStageDetails(newTemplate);

        return newTemplate.getTemplateId();
    }

    /**
     * 插入阶段明细
     *
     * @param template 阶段模板信息
     */
    private void insertStageDetails(BamsStageTemplate template)
    {
        List<BamsStageTemplateDetail> stages = template.getStages();
        if (stages != null && !stages.isEmpty())
        {
            for (BamsStageTemplateDetail detail : stages)
            {
                detail.setTemplateId(template.getTemplateId());
            }
            detailMapper.batchInsertDetail(stages);
        }
    }

    /**
     * 验证阶段名称是否重复
     *
     * @param template 阶段模板信息
     */
    private void validateStageNames(BamsStageTemplate template)
    {
        List<BamsStageTemplateDetail> stages = template.getStages();
        if (stages == null || stages.isEmpty())
        {
            return;
        }

        Set<String> stageNames = new HashSet<>();
        for (BamsStageTemplateDetail detail : stages)
        {
            String stageName = detail.getStageName();
            if (stageName != null && !stageName.trim().isEmpty())
            {
                if (!stageNames.add(stageName))
                {
                    throw new ServiceException("阶段名称重复");
                }
            }
        }
    }
}
