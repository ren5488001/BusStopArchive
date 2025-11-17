package com.ruoyi.system.domain;

import java.util.Date;
import java.util.List;
import java.util.Arrays;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * 项目阶段模板明细表 bams_stage_template_detail
 *
 * @author Rick
 */
public class BamsStageTemplateDetail
{
    private static final long serialVersionUID = 1L;

    /** 明细ID */
    private Long detailId;

    /** 模板ID */
    private Long templateId;

    /** 阶段名称 */
    private String stageName;

    /** 阶段顺序 */
    private Integer stageOrder;

    /** 标准文件配置（逗号分隔的dict_value） */
    private String requiredFiles;

    /** 创建时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date createTime;

    /** 更新时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date updateTime;

    /** 标准文件配置列表（前端传递，不存数据库） */
    private List<String> requiredFileList;

    public Long getDetailId()
    {
        return detailId;
    }

    public void setDetailId(Long detailId)
    {
        this.detailId = detailId;
    }

    public Long getTemplateId()
    {
        return templateId;
    }

    public void setTemplateId(Long templateId)
    {
        this.templateId = templateId;
    }

    @NotBlank(message = "阶段名称不能为空")
    @Size(min = 0, max = 100, message = "阶段名称不能超过100个字符")
    public String getStageName()
    {
        return stageName;
    }

    public void setStageName(String stageName)
    {
        this.stageName = stageName;
    }

    @NotNull(message = "阶段顺序不能为空")
    public Integer getStageOrder()
    {
        return stageOrder;
    }

    public void setStageOrder(Integer stageOrder)
    {
        this.stageOrder = stageOrder;
    }

    @JsonIgnore
    public String getRequiredFiles()
    {
        return requiredFiles;
    }

    public void setRequiredFiles(String requiredFiles)
    {
        this.requiredFiles = requiredFiles;
    }

    public Date getCreateTime()
    {
        return createTime;
    }

    public void setCreateTime(Date createTime)
    {
        this.createTime = createTime;
    }

    public Date getUpdateTime()
    {
        return updateTime;
    }

    public void setUpdateTime(Date updateTime)
    {
        this.updateTime = updateTime;
    }

    public List<String> getRequiredFileList()
    {
        // 从数据库字符串转为列表
        if (requiredFileList == null && requiredFiles != null && !requiredFiles.isEmpty())
        {
            requiredFileList = Arrays.asList(requiredFiles.split(","));
        }
        return requiredFileList;
    }

    public void setRequiredFileList(List<String> requiredFileList)
    {
        this.requiredFileList = requiredFileList;
        // 从列表转为数据库字符串
        if (requiredFileList != null && !requiredFileList.isEmpty())
        {
            this.requiredFiles = String.join(",", requiredFileList);
        }
    }

    @Override
    public String toString()
    {
        return new ToStringBuilder(this, ToStringStyle.MULTI_LINE_STYLE)
            .append("detailId", getDetailId())
            .append("templateId", getTemplateId())
            .append("stageName", getStageName())
            .append("stageOrder", getStageOrder())
            .append("requiredFiles", getRequiredFiles())
            .append("requiredFileList", getRequiredFileList())
            .append("createTime", getCreateTime())
            .append("updateTime", getUpdateTime())
            .toString();
    }
}
