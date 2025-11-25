package com.ruoyi.system.domain;

import java.util.List;
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

    /** 主键ID */
    private Long id;

    /** 项目ID */
    private Long projectId;

    /** 阶段ID（字典键值：0,1,2,3） */
    private String stageId;

    /** 阶段显示名称（中文：立项,设计,施工,验收） */
    private String stageDisplayName;

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

    /** 标准文件列表（翻译后的对象数组，用于前端展示） */
    private List<FileOption> requiredFileList;

    /**
     * 文件选项内部类
     * 用于返回标准文件的ID、中文名称和对应的档案列表
     */
    public static class FileOption
    {
        /** 字典值（用于保存） */
        private String id;

        /** 中文名称（用于显示） */
        private String name;

        /** 该标准文件对应的档案列表 */
        private List<BamsArchive> archives;

        public FileOption()
        {
        }

        public FileOption(String id, String name)
        {
            this.id = id;
            this.name = name;
        }

        public String getId()
        {
            return id;
        }

        public void setId(String id)
        {
            this.id = id;
        }

        public String getName()
        {
            return name;
        }

        public void setName(String name)
        {
            this.name = name;
        }

        public List<BamsArchive> getArchives()
        {
            return archives;
        }

        public void setArchives(List<BamsArchive> archives)
        {
            this.archives = archives;
        }
    }

    public Long getId()
    {
        return id;
    }

    public void setId(Long id)
    {
        this.id = id;
    }

    public Long getProjectId()
    {
        return projectId;
    }

    public void setProjectId(Long projectId)
    {
        this.projectId = projectId;
    }

    public String getStageId()
    {
        return stageId;
    }

    public void setStageId(String stageId)
    {
        this.stageId = stageId;
    }

    public String getStageDisplayName()
    {
        return stageDisplayName;
    }

    public void setStageDisplayName(String stageDisplayName)
    {
        this.stageDisplayName = stageDisplayName;
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

    public List<FileOption> getRequiredFileList()
    {
        return requiredFileList;
    }

    public void setRequiredFileList(List<FileOption> requiredFileList)
    {
        this.requiredFileList = requiredFileList;
    }

    @Override
    public String toString()
    {
        return new ToStringBuilder(this, ToStringStyle.MULTI_LINE_STYLE)
            .append("id", getId())
            .append("projectId", getProjectId())
            .append("stageId", getStageId())
            .append("stageDisplayName", getStageDisplayName())
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
