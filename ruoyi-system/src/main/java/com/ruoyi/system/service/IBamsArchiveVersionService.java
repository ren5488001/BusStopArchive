package com.ruoyi.system.service;

import java.util.List;
import com.ruoyi.system.domain.BamsArchiveVersion;
import org.springframework.web.multipart.MultipartFile;

/**
 * 档案版本Service接口
 *
 * @author ruoyi
 * @date 2025-11-19
 */
public interface IBamsArchiveVersionService
{
    /**
     * 查询档案版本
     *
     * @param versionId 档案版本主键
     * @return 档案版本
     */
    public BamsArchiveVersion selectBamsArchiveVersionByVersionId(Long versionId);

    /**
     * 查询档案版本列表
     *
     * @param bamsArchiveVersion 档案版本
     * @return 档案版本集合
     */
    public List<BamsArchiveVersion> selectBamsArchiveVersionList(BamsArchiveVersion bamsArchiveVersion);

    /**
     * 根据档案ID查询版本列表
     *
     * @param archiveId 档案ID
     * @return 版本列表
     */
    public List<BamsArchiveVersion> selectVersionsByArchiveId(Long archiveId);

    /**
     * 获取当前版本
     *
     * @param archiveId 档案ID
     * @return 当前版本
     */
    public BamsArchiveVersion selectCurrentVersion(Long archiveId);

    /**
     * 临时文件上传（用于OCR识别）
     *
     * @param file 文件
     * @return 临时文件信息（包含文件路径、文件名等）
     */
    public java.util.Map<String, Object> uploadTempFile(MultipartFile file);

    /**
     * 上传新版本文件
     *
     * @param archiveId 档案ID
     * @param file 文件
     * @param versionRemark 版本说明
     * @return 结果
     */
    public BamsArchiveVersion uploadVersion(Long archiveId, MultipartFile file, String versionRemark);

    /**
     * 设置当前版本
     *
     * @param archiveId 档案ID
     * @param versionId 版本ID
     * @return 结果
     */
    public int setCurrentVersion(Long archiveId, Long versionId);

    /**
     * 修改版本说明
     *
     * @param bamsArchiveVersion 档案版本
     * @return 结果
     */
    public int updateBamsArchiveVersion(BamsArchiveVersion bamsArchiveVersion);

    /**
     * 删除档案版本
     *
     * @param versionId 档案版本主键
     * @return 结果
     */
    public int deleteBamsArchiveVersionByVersionId(Long versionId);

    /**
     * 批量删除档案版本
     *
     * @param versionIds 需要删除的数据主键集合
     * @return 结果
     */
    public int deleteBamsArchiveVersionByVersionIds(Long[] versionIds);

    /**
     * 下载版本文件
     *
     * @param versionId 版本ID
     * @return 文件路径
     */
    public String downloadVersion(Long versionId);
}
