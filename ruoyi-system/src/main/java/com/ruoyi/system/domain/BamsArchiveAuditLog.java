package com.ruoyi.system.domain;

import java.util.Date;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.ruoyi.common.annotation.Excel;

/**
 * 审计日志对象 bams_archive_audit_log
 *
 * @author ruoyi
 * @date 2025-11-19
 */
public class BamsArchiveAuditLog
{
    private static final long serialVersionUID = 1L;

    /** 日志主键ID */
    private Long logId;

    /** 档案ID（可为 NULL，如查询操作） */
    private Long archiveId;

    /** 版本ID（可为 NULL） */
    private Long versionId;

    /** 档案编号（冗余，便于查询） */
    @Excel(name = "档案编号")
    private String archiveNumber;

    /** 操作类型（CREATE/UPDATE/DELETE/RESTORE/PERMANENT_DELETE/VERSION_UPLOAD/DOWNLOAD/VIEW/EXPORT） */
    @Excel(name = "操作类型")
    @NotBlank(message = "操作类型不能为空")
    @Size(max = 50, message = "操作类型不能超过50个字符")
    private String operationType;

    /** 操作模块（metadata/file/version） */
    @Excel(name = "操作模块")
    @Size(max = 50, message = "操作模块不能超过50个字符")
    private String operationModule;

    /** 操作描述 */
    @Size(max = 500, message = "操作描述不能超过500个字符")
    private String operationDesc;

    /** 修改的字段名（如 title, description） */
    @Size(max = 100, message = "字段名不能超过100个字符")
    private String fieldName;

    /** 修改前的值 */
    private String oldValue;

    /** 修改后的值 */
    private String newValue;

    /** 完整变更详情（JSON 格式） */
    private String changeDetail;

    /** 操作人用户名 */
    @Excel(name = "操作人")
    @NotBlank(message = "操作人不能为空")
    @Size(max = 64, message = "操作人不能超过64个字符")
    private String operator;

    /** 操作时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Excel(name = "操作时间", width = 30, dateFormat = "yyyy-MM-dd HH:mm:ss")
    private Date operationTime;

    /** 操作 IP 地址 */
    @Excel(name = "IP地址")
    private String ipAddress;

    /** 浏览器 User-Agent */
    private String userAgent;

    public void setLogId(Long logId)
    {
        this.logId = logId;
    }

    public Long getLogId()
    {
        return logId;
    }

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

    public void setVersionId(Long versionId)
    {
        this.versionId = versionId;
    }

    public Long getVersionId()
    {
        return versionId;
    }

    public void setOperationType(String operationType)
    {
        this.operationType = operationType;
    }

    public String getOperationType()
    {
        return operationType;
    }

    public void setOperationModule(String operationModule)
    {
        this.operationModule = operationModule;
    }

    public String getOperationModule()
    {
        return operationModule;
    }

    public void setOperationDesc(String operationDesc)
    {
        this.operationDesc = operationDesc;
    }

    public String getOperationDesc()
    {
        return operationDesc;
    }

    public void setFieldName(String fieldName)
    {
        this.fieldName = fieldName;
    }

    public String getFieldName()
    {
        return fieldName;
    }

    public void setOldValue(String oldValue)
    {
        this.oldValue = oldValue;
    }

    public String getOldValue()
    {
        return oldValue;
    }

    public void setNewValue(String newValue)
    {
        this.newValue = newValue;
    }

    public String getNewValue()
    {
        return newValue;
    }

    public void setChangeDetail(String changeDetail)
    {
        this.changeDetail = changeDetail;
    }

    public String getChangeDetail()
    {
        return changeDetail;
    }

    public void setOperator(String operator)
    {
        this.operator = operator;
    }

    public String getOperator()
    {
        return operator;
    }

    public void setOperationTime(Date operationTime)
    {
        this.operationTime = operationTime;
    }

    public Date getOperationTime()
    {
        return operationTime;
    }

    public void setIpAddress(String ipAddress)
    {
        this.ipAddress = ipAddress;
    }

    public String getIpAddress()
    {
        return ipAddress;
    }

    public void setUserAgent(String userAgent)
    {
        this.userAgent = userAgent;
    }

    public String getUserAgent()
    {
        return userAgent;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this,ToStringStyle.MULTI_LINE_STYLE)
            .append("logId", getLogId())
            .append("archiveId", getArchiveId())
            .append("archiveNumber", getArchiveNumber())
            .append("operationType", getOperationType())
            .append("operationModule", getOperationModule())
            .append("fieldName", getFieldName())
            .append("oldValue", getOldValue())
            .append("newValue", getNewValue())
            .append("changeDetail", getChangeDetail())
            .append("operator", getOperator())
            .append("operationTime", getOperationTime())
            .append("ipAddress", getIpAddress())
            .append("userAgent", getUserAgent())
            .toString();
    }
}
