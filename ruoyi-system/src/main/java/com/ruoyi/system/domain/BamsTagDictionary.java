package com.ruoyi.system.domain;

import java.util.Date;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 标签字典对象 bams_tag_dictionary
 *
 * @author ruoyi
 * @date 2025-11-19
 */
public class BamsTagDictionary extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 标签主键ID */
    private Long tagId;

    /** 标签名称（唯一） */
    @Excel(name = "标签名称")
    @NotBlank(message = "标签名称不能为空")
    @Size(max = 50, message = "标签名称不能超过50个字符")
    private String tagName;

    /** 使用次数（每次关联 +1） */
    @Excel(name = "使用次数")
    private Integer usageCount;

    /** 状态（0=正常, 1=停用） */
    @Excel(name = "状态", readConverterExp = "0=正常,1=停用")
    private String status;

    public void setTagId(Long tagId)
    {
        this.tagId = tagId;
    }

    public Long getTagId()
    {
        return tagId;
    }

    public void setTagName(String tagName)
    {
        this.tagName = tagName;
    }

    public String getTagName()
    {
        return tagName;
    }

    public void setUsageCount(Integer usageCount)
    {
        this.usageCount = usageCount;
    }

    public Integer getUsageCount()
    {
        return usageCount;
    }

    public void setStatus(String status)
    {
        this.status = status;
    }

    public String getStatus()
    {
        return status;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this,ToStringStyle.MULTI_LINE_STYLE)
            .append("tagId", getTagId())
            .append("tagName", getTagName())
            .append("usageCount", getUsageCount())
            .append("status", getStatus())
            .append("createBy", getCreateBy())
            .append("createTime", getCreateTime())
            .toString();
    }
}
