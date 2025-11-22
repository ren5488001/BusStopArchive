package com.ruoyi.system.domain;

import java.util.Date;
import java.util.List;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 档案主表对象 bams_archive
 *
 * @author ruoyi
 * @date 2025-11-19
 */
public class BamsArchive extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 档案主键ID */
    private Long archiveId;

    /** 档案编号（由前端输入，非必填） */
    @Excel(name = "档案编号")
    @Size(max = 100, message = "档案编号不能超过100个字符")
    private String archiveNumber;

    /** 档案题名 */
    @Excel(name = "档案题名")
    @NotBlank(message = "档案题名不能为空")
    @Size(max = 500, message = "档案题名不能超过500个字符")
    private String title;

    /** 所属项目ID */
    @NotNull(message = "所属项目ID不能为空")
    private Long projectId;

    /** 项目编号（冗余字段） */
    @Excel(name = "项目编号")
    @NotBlank(message = "项目编号不能为空")
    @Size(max = 50, message = "项目编号不能超过50个字符")
    private String projectCode;

    /** 项目名称（冗余字段） */
    @Excel(name = "项目名称")
    @Size(max = 200, message = "项目名称不能超过200个字符")
    private String projectName;

    /** 建设阶段（枚举：立项/设计/施工/验收） */
    @Excel(name = "建设阶段")
    @NotBlank(message = "建设阶段不能为空")
    @Size(max = 50, message = "建设阶段不能超过50个字符")
    private String stage;

    /** 文件形成日期 */
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Excel(name = "文件形成日期", width = 30, dateFormat = "yyyy-MM-dd")
    private Date fileDate;

    /** 文件标准（字典值） */
    @Excel(name = "文件标准")
    @Size(max = 100, message = "文件标准不能超过100个字符")
    private String fileStandard;

    /** 档案分类（字典值） */
    @Excel(name = "档案分类")
    @Size(max = 100, message = "档案分类不能超过100个字符")
    private String archiveCategory;

    /** 是否有纸质材料（0=否, 1=是） */
    @Excel(name = "是否有纸质材料", readConverterExp = "0=否,1=是")
    private String hasPaperMaterial;

    /** 归档日期（系统自动记录） */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Excel(name = "归档日期", width = 30, dateFormat = "yyyy-MM-dd HH:mm:ss")
    private Date archivalDate;

    /** 文件类型（固定为 PDF） */
    @Excel(name = "文件类型")
    private String fileType;

    /** 当前版本文件大小（字节） */
    @Excel(name = "文件大小(字节)")
    private Long fileSize;

    /** 档案描述（人工填写） */
    @Size(max = 2000, message = "档案描述不能超过2000个字符")
    private String description;

    /** 标签数组（JSON 格式：["标签1", "标签2"]） */
    private String tags;

    /** AI 生成的摘要（待对接 AI 服务） */
    @Size(max = 2000, message = "摘要不能超过2000个字符")
    private String summary;

    /** 当前版本号 */
    @Excel(name = "当前版本")
    private String currentVersion;

    /** 总版本数 */
    @Excel(name = "版本数")
    private Integer versionCount;

    /** 状态（0=正常, 1=草稿） */
    @Excel(name = "状态", readConverterExp = "0=正常,1=草稿")
    private String status;

    /** 删除标志（0=存在, 1=逻辑删除） */
    private String delFlag;

    /** 版本列表（非数据库字段，用于返回详情时包含版本信息） */
    private List<BamsArchiveVersion> versions;

    /** 标签列表（非数据库字段，用于前端显示） */
    private List<String> tagList;

    public void setArchiveId(Long archiveId)
    {
        this.archiveId = archiveId;
    }

    public Long getArchiveId()
    {
        return archiveId;
    }

    public void setArchiveNumber(String archiveNumber)
    {
        this.archiveNumber = archiveNumber;
    }

    public String getArchiveNumber()
    {
        return archiveNumber;
    }

    public void setTitle(String title)
    {
        this.title = title;
    }

    public String getTitle()
    {
        return title;
    }

    public void setProjectId(Long projectId)
    {
        this.projectId = projectId;
    }

    public Long getProjectId()
    {
        return projectId;
    }

    public void setProjectCode(String projectCode)
    {
        this.projectCode = projectCode;
    }

    public String getProjectCode()
    {
        return projectCode;
    }

    public void setProjectName(String projectName)
    {
        this.projectName = projectName;
    }

    public String getProjectName()
    {
        return projectName;
    }

    public void setStage(String stage)
    {
        this.stage = stage;
    }

    public String getStage()
    {
        return stage;
    }

    public void setFileDate(Date fileDate)
    {
        this.fileDate = fileDate;
    }

    public Date getFileDate()
    {
        return fileDate;
    }

    public void setFileStandard(String fileStandard)
    {
        this.fileStandard = fileStandard;
    }

    public String getFileStandard()
    {
        return fileStandard;
    }

    public void setArchiveCategory(String archiveCategory)
    {
        this.archiveCategory = archiveCategory;
    }

    public String getArchiveCategory()
    {
        return archiveCategory;
    }

    public void setHasPaperMaterial(String hasPaperMaterial)
    {
        this.hasPaperMaterial = hasPaperMaterial;
    }

    public String getHasPaperMaterial()
    {
        return hasPaperMaterial;
    }

    public void setArchivalDate(Date archivalDate)
    {
        this.archivalDate = archivalDate;
    }

    public Date getArchivalDate()
    {
        return archivalDate;
    }

    public void setFileType(String fileType)
    {
        this.fileType = fileType;
    }

    public String getFileType()
    {
        return fileType;
    }

    public void setFileSize(Long fileSize)
    {
        this.fileSize = fileSize;
    }

    public Long getFileSize()
    {
        return fileSize;
    }

    public void setDescription(String description)
    {
        this.description = description;
    }

    public String getDescription()
    {
        return description;
    }

    public void setTags(String tags)
    {
        this.tags = tags;
    }

    public String getTags()
    {
        return tags;
    }

    public void setSummary(String summary)
    {
        this.summary = summary;
    }

    public String getSummary()
    {
        return summary;
    }

    public void setCurrentVersion(String currentVersion)
    {
        this.currentVersion = currentVersion;
    }

    public String getCurrentVersion()
    {
        return currentVersion;
    }

    public void setVersionCount(Integer versionCount)
    {
        this.versionCount = versionCount;
    }

    public Integer getVersionCount()
    {
        return versionCount;
    }

    public void setStatus(String status)
    {
        this.status = status;
    }

    public String getStatus()
    {
        return status;
    }

    public void setDelFlag(String delFlag)
    {
        this.delFlag = delFlag;
    }

    public String getDelFlag()
    {
        return delFlag;
    }

    public List<BamsArchiveVersion> getVersions()
    {
        return versions;
    }

    public void setVersions(List<BamsArchiveVersion> versions)
    {
        this.versions = versions;
    }

    public List<String> getTagList()
    {
        return tagList;
    }

    public void setTagList(List<String> tagList)
    {
        this.tagList = tagList;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this,ToStringStyle.MULTI_LINE_STYLE)
            .append("archiveId", getArchiveId())
            .append("archiveNumber", getArchiveNumber())
            .append("title", getTitle())
            .append("projectId", getProjectId())
            .append("projectCode", getProjectCode())
            .append("projectName", getProjectName())
            .append("stage", getStage())
            .append("fileDate", getFileDate())
            .append("fileStandard", getFileStandard())
            .append("archiveCategory", getArchiveCategory())
            .append("hasPaperMaterial", getHasPaperMaterial())
            .append("archivalDate", getArchivalDate())
            .append("fileType", getFileType())
            .append("fileSize", getFileSize())
            .append("description", getDescription())
            .append("tags", getTags())
            .append("summary", getSummary())
            .append("currentVersion", getCurrentVersion())
            .append("versionCount", getVersionCount())
            .append("status", getStatus())
            .append("delFlag", getDelFlag())
            .append("createBy", getCreateBy())
            .append("createTime", getCreateTime())
            .append("updateBy", getUpdateBy())
            .append("updateTime", getUpdateTime())
            .append("remark", getRemark())
            .toString();
    }
}
