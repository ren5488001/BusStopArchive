package com.ruoyi.system.domain;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 项目阶段实例对象 bams_project_stage
 *
 * @author Rick
 */
public class BamsProjectStage extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 阶段实例ID */
    private Long stageId;

    /** 项目ID */
    private Long projectId;

    /** 阶段名称 */
    private String stageName;

    /** 阶段顺序 */
    private Integer stageOrder;

    /** 标准文件配置（逗号分隔的dict_value） */
    private String requiredFiles;

    /** 应归档文件数量 */
    private Integer requiredFileCount;

    /** 已归档文件数量 */
    private Integer archivedFileCount;

    /** 完整度（0-100） */
    private Integer completenessRate;

    public Long getStageId()
    {
        return stageId;
    }

    public void setStageId(Long stageId)
    {
        this.stageId = stageId;
    }

    public Long getProjectId()
    {
        return projectId;
    }

    public void setProjectId(Long projectId)
    {
        this.projectId = projectId;
    }

    public String getStageName()
    {
        return stageName;
    }

    public void setStageName(String stageName)
    {
        this.stageName = stageName;
    }

    public Integer getStageOrder()
    {
        return stageOrder;
    }

    public void setStageOrder(Integer stageOrder)
    {
        this.stageOrder = stageOrder;
    }

    public String getRequiredFiles()
    {
        return requiredFiles;
    }

    public void setRequiredFiles(String requiredFiles)
    {
        this.requiredFiles = requiredFiles;
    }

    public Integer getRequiredFileCount()
    {
        return requiredFileCount;
    }

    public void setRequiredFileCount(Integer requiredFileCount)
    {
        this.requiredFileCount = requiredFileCount;
    }

    public Integer getArchivedFileCount()
    {
        return archivedFileCount;
    }

    public void setArchivedFileCount(Integer archivedFileCount)
    {
        this.archivedFileCount = archivedFileCount;
    }

    public Integer getCompletenessRate()
    {
        return completenessRate;
    }

    public void setCompletenessRate(Integer completenessRate)
    {
        this.completenessRate = completenessRate;
    }

    @Override
    public String toString()
    {
        return new ToStringBuilder(this, ToStringStyle.MULTI_LINE_STYLE)
            .append("stageId", getStageId())
            .append("projectId", getProjectId())
            .append("stageName", getStageName())
            .append("stageOrder", getStageOrder())
            .append("requiredFiles", getRequiredFiles())
            .append("requiredFileCount", getRequiredFileCount())
            .append("archivedFileCount", getArchivedFileCount())
            .append("completenessRate", getCompletenessRate())
            .append("createTime", getCreateTime())
            .append("updateTime", getUpdateTime())
            .toString();
    }
}
