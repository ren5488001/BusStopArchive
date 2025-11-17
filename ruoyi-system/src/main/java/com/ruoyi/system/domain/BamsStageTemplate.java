package com.ruoyi.system.domain;

import java.util.List;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 项目阶段模板主表 bams_stage_template
 *
 * @author Rick
 */
public class BamsStageTemplate extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 模板ID */
    private Long templateId;

    /** 模板名称 */
    private String templateName;

    /** 模板描述 */
    private String templateDesc;

    /** 阶段总数 */
    private Integer stageCount;

    /** 状态（0正常 1停用） */
    private String status;

    /** 删除标志（0代表存在 2代表删除） */
    private String delFlag;

    /** 阶段明细列表 */
    private List<BamsStageTemplateDetail> stages;

    public Long getTemplateId()
    {
        return templateId;
    }

    public void setTemplateId(Long templateId)
    {
        this.templateId = templateId;
    }

    @NotBlank(message = "模板名称不能为空")
    @Size(min = 0, max = 100, message = "模板名称不能超过100个字符")
    public String getTemplateName()
    {
        return templateName;
    }

    public void setTemplateName(String templateName)
    {
        this.templateName = templateName;
    }

    @Size(min = 0, max = 500, message = "模板描述不能超过500个字符")
    public String getTemplateDesc()
    {
        return templateDesc;
    }

    public void setTemplateDesc(String templateDesc)
    {
        this.templateDesc = templateDesc;
    }

    public Integer getStageCount()
    {
        return stageCount;
    }

    public void setStageCount(Integer stageCount)
    {
        this.stageCount = stageCount;
    }

    public String getStatus()
    {
        return status;
    }

    public void setStatus(String status)
    {
        this.status = status;
    }

    public String getDelFlag()
    {
        return delFlag;
    }

    public void setDelFlag(String delFlag)
    {
        this.delFlag = delFlag;
    }

    public List<BamsStageTemplateDetail> getStages()
    {
        return stages;
    }

    public void setStages(List<BamsStageTemplateDetail> stages)
    {
        this.stages = stages;
    }

    @Override
    public String toString()
    {
        return new ToStringBuilder(this, ToStringStyle.MULTI_LINE_STYLE)
            .append("templateId", getTemplateId())
            .append("templateName", getTemplateName())
            .append("templateDesc", getTemplateDesc())
            .append("stageCount", getStageCount())
            .append("status", getStatus())
            .append("delFlag", getDelFlag())
            .append("createBy", getCreateBy())
            .append("createTime", getCreateTime())
            .append("updateBy", getUpdateBy())
            .append("updateTime", getUpdateTime())
            .append("remark", getRemark())
            .append("stages", getStages())
            .toString();
    }
}
