package com.ruoyi.system.service.impl;

import java.io.File;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.List;

import com.ruoyi.common.exception.ServiceException;
import com.ruoyi.common.utils.SecurityUtils;
import com.ruoyi.common.utils.ip.IpUtils;
import com.ruoyi.system.domain.BamsArchive;
import com.ruoyi.system.domain.BamsArchiveAuditLog;
import com.ruoyi.system.mapper.BamsArchiveAuditLogMapper;
import com.ruoyi.system.mapper.BamsArchiveMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.ruoyi.system.mapper.BamsArchiveVersionMapper;
import com.ruoyi.system.domain.BamsArchiveVersion;
import com.ruoyi.system.service.IBamsArchiveVersionService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * 档案版本Service业务层处理
 *
 * @author ruoyi
 * @date 2025-11-19
 */
@Service
public class BamsArchiveVersionServiceImpl implements IBamsArchiveVersionService {
    @Autowired
    private BamsArchiveVersionMapper versionMapper;

    @Autowired
    private BamsArchiveMapper archiveMapper;

    @Autowired
    private BamsArchiveAuditLogMapper auditLogMapper;

    @Value("${ruoyi.profile}")
    private String uploadPath;

    /**
     * 查询档案版本
     *
     * @param versionId 档案版本主键
     * @return 档案版本
     */
    @Override
    public BamsArchiveVersion selectBamsArchiveVersionByVersionId(Long versionId) {
        return versionMapper.selectBamsArchiveVersionByVersionId(versionId);
    }

    /**
     * 查询档案版本列表
     *
     * @param bamsArchiveVersion 档案版本
     * @return 档案版本
     */
    @Override
    public List<BamsArchiveVersion> selectBamsArchiveVersionList(BamsArchiveVersion bamsArchiveVersion) {
        return versionMapper.selectBamsArchiveVersionList(bamsArchiveVersion);
    }

    /**
     * 根据档案ID查询版本列表
     *
     * @param archiveId 档案ID
     * @return 版本列表
     */
    @Override
    public List<BamsArchiveVersion> selectVersionsByArchiveId(Long archiveId) {
        return versionMapper.selectVersionsByArchiveId(archiveId);
    }

    /**
     * 获取当前版本
     *
     * @param archiveId 档案ID
     * @return 当前版本
     */
    @Override
    public BamsArchiveVersion selectCurrentVersion(Long archiveId) {
        return versionMapper.selectCurrentVersion(archiveId);
    }

    /**
     * 临时文件上传（用于OCR识别）
     *
     * @param file 文件
     * @return 临时文件信息
     */
    @Override
    public java.util.Map<String, Object> uploadTempFile(MultipartFile file) {
        // 校验文件类型
        String fileName = file.getOriginalFilename();
        if (!isValidFileType(fileName)) {
            throw new ServiceException("不支持的文件格式。仅支持 Word、PDF、JPG、PNG、Excel、CAD 格式");
        }

        // 上传文件到临时目录
        String filePath;
        try {
            String subDir = "temp/" + java.time.LocalDate.now();
            filePath = uploadFile(file, subDir);
        } catch (IOException e) {
            throw new ServiceException("文件上传失败：" + e.getMessage());
        }

        // 获取文件类型
        String fileType = getFileType(fileName);

        // 返回临时文件信息
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("tempFilePath", filePath);
        result.put("fileName", fileName);
        result.put("fileSize", file.getSize());
        result.put("fileType", fileType);

        // TODO: 这里后续可以调用OCR服务识别文件内容
        // 目前返回模拟数据
        result.put("ocrResult", new java.util.HashMap<String, Object>() {
            {
                put("title", "");
                put("summary", "AI 正在分析文件内容...");
                put("tags", new String[] {});
            }
        });

        return result;
    }

    /**
     * 上传新版本文件
     *
     * @param archiveId     档案ID
     * @param file          文件
     * @param versionRemark 版本说明
     * @return 结果
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public BamsArchiveVersion uploadVersion(Long archiveId, MultipartFile file, String versionRemark) {
        // 查询档案信息
        BamsArchive archive = archiveMapper.selectBamsArchiveByArchiveId(archiveId);
        if (archive == null) {
            throw new ServiceException("档案不存在");
        }

        // 校验文件类型
        String fileName = file.getOriginalFilename();
        if (!isValidFileType(fileName)) {
            throw new ServiceException("不支持的文件格式。仅支持 Word、PDF、JPG、PNG、Excel、CAD 格式");
        }

        // 计算文件哈希值
        String fileHash;
        try {
            fileHash = calculateFileHash(file.getBytes());
        } catch (IOException | NoSuchAlgorithmException e) {
            throw new ServiceException("计算文件哈希值失败");
        }

        // 检查是否重复上传
        List<BamsArchiveVersion> existingVersions = versionMapper.selectVersionsByArchiveId(archiveId);
        for (BamsArchiveVersion version : existingVersions) {
            if (fileHash.equals(version.getFileHash())) {
                throw new ServiceException("文件已存在，请勿重复上传");
            }
        }

        // 生成版本号
        String versionNumber = generateVersionNumber(existingVersions.size());

        // 上传文件
        String filePath;
        try {
            // 构建存储路径：archive/{archiveId}/
            String subDir = "archive/" + archiveId;
            filePath = uploadFile(file, subDir);
        } catch (IOException e) {
            throw new ServiceException("文件上传失败：" + e.getMessage());
        }

        // 获取文件类型
        String fileType = getFileType(fileName);

        // 创建版本记录
        BamsArchiveVersion version = new BamsArchiveVersion();
        version.setArchiveId(archiveId);
        version.setVersionNumber(versionNumber);
        version.setFileName(fileName);
        version.setFilePath(filePath);
        version.setFileType(fileType);
        version.setFileSize(file.getSize());
        version.setFileHash(fileHash);
        version.setIsCurrent("1"); // 新上传的版本自动设为当前版本
        version.setVersionRemark(versionRemark);
        version.setUploadBy(SecurityUtils.getUsername());
        version.setUploadTime(new Date());

        // 取消之前的当前版本
        versionMapper.cancelCurrentVersion(archiveId);

        // 插入新版本
        versionMapper.insertBamsArchiveVersion(version);

        // 更新档案的版本信息
        int versionCount = existingVersions.size() + 1;
        archiveMapper.updateVersionInfo(archiveId, versionNumber, versionCount, file.getSize());

        // 记录审计日志
        createAuditLog(archiveId, version.getVersionId(), "VERSION_UPLOAD", "版本管理",
                "上传新版本：" + versionNumber);

        return version;
    }

    /**
     * 设置当前版本
     *
     * @param archiveId 档案ID
     * @param versionId 版本ID
     * @return 结果
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public int setCurrentVersion(Long archiveId, Long versionId) {
        BamsArchiveVersion version = versionMapper.selectBamsArchiveVersionByVersionId(versionId);
        if (version == null || !version.getArchiveId().equals(archiveId)) {
            throw new ServiceException("版本不存在或不属于该档案");
        }

        // 更新当前版本
        int result = versionMapper.updateCurrentVersion(archiveId, versionId);

        // 更新档案的当前版本号和文件大小
        archiveMapper.updateVersionInfo(archiveId, version.getVersionNumber(), null, version.getFileSize());

        // 记录审计日志
        createAuditLog(archiveId, versionId, "VERSION_SWITCH", "版本管理",
                "切换当前版本为：" + version.getVersionNumber());

        return result;
    }

    /**
     * 修改版本说明
     *
     * @param bamsArchiveVersion 档案版本
     * @return 结果
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public int updateBamsArchiveVersion(BamsArchiveVersion bamsArchiveVersion) {
        BamsArchiveVersion oldVersion = versionMapper.selectBamsArchiveVersionByVersionId(
                bamsArchiveVersion.getVersionId());

        int result = versionMapper.updateBamsArchiveVersion(bamsArchiveVersion);

        // 记录审计日志
        if (!equals(oldVersion.getVersionRemark(), bamsArchiveVersion.getVersionRemark())) {
            createAuditLog(oldVersion.getArchiveId(), bamsArchiveVersion.getVersionId(),
                    "VERSION_UPDATE", "版本管理", "修改版本说明");
        }

        return result;
    }

    /**
     * 删除档案版本
     *
     * @param versionId 档案版本主键
     * @return 结果
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public int deleteBamsArchiveVersionByVersionId(Long versionId) {
        BamsArchiveVersion version = versionMapper.selectBamsArchiveVersionByVersionId(versionId);
        if (version == null) {
            return 0;
        }

        // 检查是否为当前版本
        if ("1".equals(version.getIsCurrent())) {
            throw new ServiceException("当前版本不允许删除，请先切换到其他版本");
        }

        // 删除物理文件
        deletePhysicalFile(version.getFilePath());

        // 记录审计日志
        createAuditLog(version.getArchiveId(), versionId, "VERSION_DELETE", "版本管理",
                "删除版本：" + version.getVersionNumber());

        // 删除版本记录
        int result = versionMapper.deleteBamsArchiveVersionByVersionId(versionId);

        // 更新档案的版本计数
        List<BamsArchiveVersion> remainingVersions = versionMapper.selectVersionsByArchiveId(version.getArchiveId());
        archiveMapper.updateVersionInfo(version.getArchiveId(), null, remainingVersions.size(), null);

        return result;
    }

    /**
     * 批量删除档案版本
     *
     * @param versionIds 需要删除的数据主键集合
     * @return 结果
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public int deleteBamsArchiveVersionByVersionIds(Long[] versionIds) {
        int count = 0;
        for (Long versionId : versionIds) {
            count += deleteBamsArchiveVersionByVersionId(versionId);
        }
        return count;
    }

    /**
     * 下载版本文件
     *
     * @param versionId 版本ID
     * @return 文件路径
     */
    @Override
    public String downloadVersion(Long versionId) {
        BamsArchiveVersion version = versionMapper.selectBamsArchiveVersionByVersionId(versionId);
        if (version == null) {
            throw new ServiceException("版本不存在");
        }

        // 记录审计日志
        createAuditLog(version.getArchiveId(), versionId, "DOWNLOAD", "文件操作",
                "下载版本文件：" + version.getVersionNumber());

        return version.getFilePath();
    }

    /**
     * 上传文件并返回相对路径（不含 /profile 前缀）
     * 
     * @param file   文件
     * @param subDir 子目录
     * @return 相对路径，例如：/archive/4/2025/11/21/xxx.jpg
     */
    private String uploadFile(MultipartFile file, String subDir) throws IOException {
        // 生成文件名：日期路径/原文件名_序列号.扩展名
        String datePath = java.time.LocalDate.now().toString().replace("-", "/");
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            throw new IOException("文件名不能为空");
        }
        if (!originalFilename.contains(".")) {
            throw new IOException("文件必须包含扩展名");
        }

        String baseName = originalFilename.substring(0, originalFilename.lastIndexOf("."));
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String fileName = datePath + "/" + baseName + "_" + System.currentTimeMillis() + extension;

        // 构建完整路径
        String fullPath = uploadPath + "/" + subDir + "/" + fileName;
        java.io.File destFile = new java.io.File(fullPath);

        // 创建目录
        if (!destFile.getParentFile().exists()) {
            destFile.getParentFile().mkdirs();
        }

        // 保存文件
        file.transferTo(destFile);

        // 返回相对路径（不含 /profile 前缀）
        return "/" + subDir + "/" + fileName;
    }

    /**
     * 验证文件类型是否支持
     */
    private boolean isValidFileType(String fileName) {
        if (fileName == null) {
            return false;
        }

        String lowerFileName = fileName.toLowerCase();
        return lowerFileName.endsWith(".pdf") ||
                lowerFileName.endsWith(".doc") ||
                lowerFileName.endsWith(".docx") ||
                lowerFileName.endsWith(".xls") ||
                lowerFileName.endsWith(".xlsx") ||
                lowerFileName.endsWith(".jpg") ||
                lowerFileName.endsWith(".jpeg") ||
                lowerFileName.endsWith(".png") ||
                lowerFileName.endsWith(".dwg") ||
                lowerFileName.endsWith(".dxf");
    }

    /**
     * 根据文件名获取文件类型
     */
    private String getFileType(String fileName) {
        if (fileName == null) {
            return "UNKNOWN";
        }

        String lowerFileName = fileName.toLowerCase();
        if (lowerFileName.endsWith(".pdf")) {
            return "PDF";
        } else if (lowerFileName.endsWith(".doc") || lowerFileName.endsWith(".docx")) {
            return "WORD";
        } else if (lowerFileName.endsWith(".xls") || lowerFileName.endsWith(".xlsx")) {
            return "EXCEL";
        } else if (lowerFileName.endsWith(".jpg") || lowerFileName.endsWith(".jpeg")) {
            return "JPG";
        } else if (lowerFileName.endsWith(".png")) {
            return "PNG";
        } else if (lowerFileName.endsWith(".dwg") || lowerFileName.endsWith(".dxf")) {
            return "CAD";
        }
        return "OTHER";
    }

    /**
     * 生成版本号
     */
    private String generateVersionNumber(int currentCount) {
        int nextVersion = currentCount + 1;
        return "V" + nextVersion + ".0";
    }

    /**
     * 计算文件SHA-256哈希值
     */
    private String calculateFileHash(byte[] fileBytes) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hashBytes = digest.digest(fileBytes);

        // 转换为16进制字符串
        StringBuilder hexString = new StringBuilder();
        for (byte b : hashBytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }

    /**
     * 删除物理文件
     */
    private void deletePhysicalFile(String filePath) {
        if (filePath != null && !filePath.isEmpty()) {
            try {
                File file = new File(uploadPath + filePath);
                if (file.exists()) {
                    file.delete();
                }
            } catch (Exception e) {
                // 忽略文件删除失败
            }
        }
    }

    /**
     * 创建审计日志
     */
    private void createAuditLog(Long archiveId, Long versionId, String operationType,
            String module, String desc) {
        BamsArchiveAuditLog log = new BamsArchiveAuditLog();
        log.setArchiveId(archiveId);
        log.setVersionId(versionId);
        log.setOperationType(operationType);
        log.setOperationModule(module);
        log.setOperationDesc(desc);
        log.setOperator(SecurityUtils.getUsername());
        log.setOperationTime(new Date());
        log.setIpAddress(IpUtils.getIpAddr());
        auditLogMapper.insertBamsArchiveAuditLog(log);
    }

    /**
     * 比较两个对象是否相等
     */
    private boolean equals(Object obj1, Object obj2) {
        if (obj1 == null && obj2 == null) {
            return true;
        }
        if (obj1 == null || obj2 == null) {
            return false;
        }
        return obj1.equals(obj2);
    }
}
