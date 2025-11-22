package com.ruoyi.system.domain;

import java.util.Date;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 档案版本对象 bams_archive_version
 *
 * @author ruoyi
 * @date 2025-11-19
 */
public class BamsArchiveVersion extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 版本主键ID */
    private Long versionId;

    /** 档案ID（应用层维护关联） */
    @NotNull(message = "档案ID不能为空")
    private Long archiveId;

    /** 版本号（V1.0, V2.0, V3.0...） */
    @Excel(name = "版本号")
    @NotBlank(message = "版本号不能为空")
    @Size(max = 20, message = "版本号不能超过20个字符")
    private String versionNumber;

    /** 原始文件名（带扩展名） */
    @Excel(name = "文件名")
    @NotBlank(message = "文件名不能为空")
    @Size(max = 255, message = "文件名不能超过255个字符")
    private String fileName;

    /** 文件存储路径（相对路径或 URL） */
    @NotBlank(message = "文件路径不能为空")
    @Size(max = 500, message = "文件路径不能超过500个字符")
    private String filePath;

    /** 文件类型（固定为 PDF） */
    @Excel(name = "文件类型")
    private String fileType;

    /** 文件大小（字节） */
    @Excel(name = "文件大小(字节)")
    private Long fileSize;

    /** 文件 SHA-256 哈希值（用于去重） */
    private String fileHash;

    /** 是否当前版本（0=否, 1=是） */
    @Excel(name = "是否当前版本", readConverterExp = "0=否,1=是")
    private String isCurrent;

    /** 版本更新说明（由用户填写） */
    @Excel(name = "版本说明")
    @Size(max = 500, message = "版本说明不能超过500个字符")
    private String versionRemark;

    /** 上传人用户名 */
    @Excel(name = "上传人")
    private String uploadBy;

    /** 上传时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Excel(name = "上传时间", width = 30, dateFormat = "yyyy-MM-dd HH:mm:ss")
    private Date uploadTime;

    public void setVersionId(Long versionId)
    {
        this.versionId = versionId;
    }

    public Long getVersionId()
    {
        return versionId;
    }

    public void setArchiveId(Long archiveId)
    {
        this.archiveId = archiveId;
    }

    public Long getArchiveId()
    {
        return archiveId;
    }

    public void setVersionNumber(String versionNumber)
    {
        this.versionNumber = versionNumber;
    }

    public String getVersionNumber()
    {
        return versionNumber;
    }

    public void setFileName(String fileName)
    {
        this.fileName = fileName;
    }

    public String getFileName()
    {
        return fileName;
    }

    public void setFilePath(String filePath)
    {
        this.filePath = filePath;
    }

    public String getFilePath()
    {
        return filePath;
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

    public void setFileHash(String fileHash)
    {
        this.fileHash = fileHash;
    }

    public String getFileHash()
    {
        return fileHash;
    }

    public void setIsCurrent(String isCurrent)
    {
        this.isCurrent = isCurrent;
    }

    public String getIsCurrent()
    {
        return isCurrent;
    }

    public void setVersionRemark(String versionRemark)
    {
        this.versionRemark = versionRemark;
    }

    public String getVersionRemark()
    {
        return versionRemark;
    }

    public void setUploadBy(String uploadBy)
    {
        this.uploadBy = uploadBy;
    }

    public String getUploadBy()
    {
        return uploadBy;
    }

    public void setUploadTime(Date uploadTime)
    {
        this.uploadTime = uploadTime;
    }

    public Date getUploadTime()
    {
        return uploadTime;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this,ToStringStyle.MULTI_LINE_STYLE)
            .append("versionId", getVersionId())
            .append("archiveId", getArchiveId())
            .append("versionNumber", getVersionNumber())
            .append("fileName", getFileName())
            .append("filePath", getFilePath())
            .append("fileType", getFileType())
            .append("fileSize", getFileSize())
            .append("fileHash", getFileHash())
            .append("isCurrent", getIsCurrent())
            .append("versionRemark", getVersionRemark())
            .append("uploadBy", getUploadBy())
            .append("uploadTime", getUploadTime())
            .toString();
    }
}
