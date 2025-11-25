package com.ruoyi.system.domain;

import java.math.BigDecimal;
import java.util.List;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Digits;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 项目信息对象 bams_project
 *
 * @author Rick
 */
public class BamsProject extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 项目ID */
    private Long projectId;

    /** 项目编号 */
    @Excel(name = "项目编号")
    @Size(max = 50, message = "项目编号不能超过50个字符")
    private String projectCode;

    /** 项目名称 */
    @Excel(name = "项目名称")
    @NotBlank(message = "项目名称不能为空")
    @Size(min = 1, max = 200, message = "项目名称长度为1-200个字符")
    private String projectName;

    /** 项目负责人 */
    @Excel(name = "项目负责人")
    @Size(max = 100, message = "项目负责人不能超过100个字符")
    private String projectManager;

    /** 纬度 */
    @DecimalMin(value = "-90", message = "纬度范围：-90~90")
    @DecimalMax(value = "90", message = "纬度范围：-90~90")
    @Digits(integer = 2, fraction = 6, message = "纬度格式不正确，整数部分最多2位，小数部分最多6位")
    private BigDecimal latitude;

    /** 经度 */
    @DecimalMin(value = "-180", message = "经度范围：-180~180")
    @DecimalMax(value = "180", message = "经度范围：-180~180")
    @Digits(integer = 3, fraction = 6, message = "经度格式不正确，整数部分最多3位，小数部分最多6位")
    private BigDecimal longitude;

    /** 关联的阶段模板ID */
    private Long templateId;

    /** 阶段模板名称 */
    @Excel(name = "阶段模板")
    @Size(max = 100, message = "阶段模板名称不能超过100个字符")
    private String templateName;

    /** 档案完整度 */
    @Excel(name = "档案完整度(%)")
    @DecimalMin(value = "0", message = "档案完整度范围：0-100")
    @DecimalMax(value = "100", message = "档案完整度范围：0-100")
    private Integer completenessRate;

    /** 应归档文件总数 */
    @DecimalMin(value = "0", message = "应归档文件总数不能为负数")
    private Integer totalRequiredFiles;

    /** 已归档文件数量 */
    @DecimalMin(value = "0", message = "已归档文件数量不能为负数")
    private Integer actualArchivedFiles;

    /** 项目描述 */
    @Size(max = 1000, message = "项目描述不能超过1000个字符")
    private String projectDesc;

    /** 删除标志（0代表存在 2代表删除） */
    private String delFlag;

    /** 项目阶段列表 */
    private List<BamsProjectStage> stages;

    public Long getProjectId()
    {
        return projectId;
    }

    public void setProjectId(Long projectId)
    {
        this.projectId = projectId;
    }

    public String getProjectCode()
    {
        return projectCode;
    }

    public void setProjectCode(String projectCode)
    {
        this.projectCode = projectCode;
    }

    public String getProjectName()
    {
        return projectName;
    }

    public void setProjectName(String projectName)
    {
        this.projectName = projectName;
    }

    public String getProjectManager()
    {
        return projectManager;
    }

    public void setProjectManager(String projectManager)
    {
        this.projectManager = projectManager;
    }

    public BigDecimal getLatitude()
    {
        return latitude;
    }

    public void setLatitude(BigDecimal latitude)
    {
        this.latitude = latitude;
    }

    public BigDecimal getLongitude()
    {
        return longitude;
    }

    public void setLongitude(BigDecimal longitude)
    {
        this.longitude = longitude;
    }

    public Long getTemplateId()
    {
        return templateId;
    }

    public void setTemplateId(Long templateId)
    {
        this.templateId = templateId;
    }

    public String getTemplateName()
    {
        return templateName;
    }

    public void setTemplateName(String templateName)
    {
        this.templateName = templateName;
    }

    public Integer getCompletenessRate()
    {
        return completenessRate;
    }

    public void setCompletenessRate(Integer completenessRate)
    {
        this.completenessRate = completenessRate;
    }

    public Integer getTotalRequiredFiles()
    {
        return totalRequiredFiles;
    }

    public void setTotalRequiredFiles(Integer totalRequiredFiles)
    {
        this.totalRequiredFiles = totalRequiredFiles;
    }

    public Integer getActualArchivedFiles()
    {
        return actualArchivedFiles;
    }

    public void setActualArchivedFiles(Integer actualArchivedFiles)
    {
        this.actualArchivedFiles = actualArchivedFiles;
    }

    public String getProjectDesc()
    {
        return projectDesc;
    }

    public void setProjectDesc(String projectDesc)
    {
        this.projectDesc = projectDesc;
    }

    public String getDelFlag()
    {
        return delFlag;
    }

    public void setDelFlag(String delFlag)
    {
        this.delFlag = delFlag;
    }

    public List<BamsProjectStage> getStages()
    {
        return stages;
    }

    public void setStages(List<BamsProjectStage> stages)
    {
        this.stages = stages;
    }

    @Override
    public String toString()
    {
        return new ToStringBuilder(this, ToStringStyle.MULTI_LINE_STYLE)
            .append("projectId", getProjectId())
            .append("projectCode", getProjectCode())
            .append("projectName", getProjectName())
            .append("projectManager", getProjectManager())
            .append("latitude", getLatitude())
            .append("longitude", getLongitude())
            .append("templateId", getTemplateId())
            .append("templateName", getTemplateName())
            .append("completenessRate", getCompletenessRate())
            .append("totalRequiredFiles", getTotalRequiredFiles())
            .append("actualArchivedFiles", getActualArchivedFiles())
            .append("projectDesc", getProjectDesc())
            .append("delFlag", getDelFlag())
            .append("createBy", getCreateBy())
            .append("createTime", getCreateTime())
            .append("updateBy", getUpdateBy())
            .append("updateTime", getUpdateTime())
            .append("remark", getRemark())
            .toString();
    }
}
