package com.ruoyi.web.controller.system;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import jakarta.servlet.http.HttpServletResponse;

import com.ruoyi.common.config.RuoYiConfig;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.ruoyi.common.annotation.Log;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.enums.BusinessType;
import com.ruoyi.system.domain.BamsArchiveVersion;
import com.ruoyi.system.service.IBamsArchiveVersionService;
import com.ruoyi.common.core.page.TableDataInfo;
import org.springframework.web.multipart.MultipartFile;

/**
 * 档案版本Controller
 *
 * @author ruoyi
 * @date 2025-11-19
 */
@RestController
@RequestMapping("/system/archive/version")
public class BamsArchiveVersionController extends BaseController {
    @Autowired
    private IBamsArchiveVersionService bamsArchiveVersionService;

    /**
     * 查询档案版本列表
     */
    @PreAuthorize("@ss.hasPermi('system:archive:list')")
    @GetMapping("/list")
    public TableDataInfo list(BamsArchiveVersion bamsArchiveVersion) {
        startPage();
        List<BamsArchiveVersion> list = bamsArchiveVersionService.selectBamsArchiveVersionList(bamsArchiveVersion);
        return getDataTable(list);
    }

    /**
     * 获取档案版本详细信息
     */
    @PreAuthorize("@ss.hasPermi('system:archive:query')")
    @GetMapping(value = "/{versionId}")
    public AjaxResult getInfo(@PathVariable("versionId") Long versionId) {
        return success(bamsArchiveVersionService.selectBamsArchiveVersionByVersionId(versionId));
    }

    /**
     * 临时文件上传（用于OCR识别）
     */
    @PreAuthorize("@ss.hasPermi('system:archive:add')")
    @Log(title = "临时文件上传", businessType = BusinessType.INSERT)
    @PostMapping("/uploadTemp")
    public AjaxResult uploadTemp(@RequestParam("file") MultipartFile file) {
        return success(bamsArchiveVersionService.uploadTempFile(file));
    }

    /**
     * 上传新版本文件
     */
    @PreAuthorize("@ss.hasPermi('system:archive:edit')")
    @Log(title = "档案版本", businessType = BusinessType.INSERT)
    @PostMapping("/upload/{archiveId}")
    public AjaxResult upload(@PathVariable Long archiveId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "versionRemark", required = false) String versionRemark) {
        BamsArchiveVersion version = bamsArchiveVersionService.uploadVersion(archiveId, file, versionRemark);
        return success(version);
    }

    /**
     * 设置当前版本
     */
    @PreAuthorize("@ss.hasPermi('system:archive:edit')")
    @Log(title = "档案版本", businessType = BusinessType.UPDATE)
    @PutMapping("/setCurrent/{archiveId}/{versionId}")
    public AjaxResult setCurrent(@PathVariable Long archiveId, @PathVariable Long versionId) {
        return toAjax(bamsArchiveVersionService.setCurrentVersion(archiveId, versionId));
    }

    /**
     * 修改版本说明
     */
    @PreAuthorize("@ss.hasPermi('system:archive:edit')")
    @Log(title = "档案版本", businessType = BusinessType.UPDATE)
    @PutMapping
    public AjaxResult edit(@RequestBody BamsArchiveVersion bamsArchiveVersion) {
        return toAjax(bamsArchiveVersionService.updateBamsArchiveVersion(bamsArchiveVersion));
    }

    /**
     * 删除档案版本
     */
    @PreAuthorize("@ss.hasPermi('system:archive:remove')")
    @Log(title = "档案版本", businessType = BusinessType.DELETE)
    @DeleteMapping("/{versionIds}")
    public AjaxResult remove(@PathVariable Long[] versionIds) {
        return toAjax(bamsArchiveVersionService.deleteBamsArchiveVersionByVersionIds(versionIds));
    }

    /**
     * 下载版本文件
     */
    @PreAuthorize("@ss.hasPermi('system:archive:query')")
    @Log(title = "档案版本", businessType = BusinessType.EXPORT)
    @GetMapping("/download/{versionId}")
    public void download(@PathVariable Long versionId, HttpServletResponse response) {
        BamsArchiveVersion version = bamsArchiveVersionService.selectBamsArchiveVersionByVersionId(versionId);
        if (version == null) {
            return;
        }

        try {
            String filePath = RuoYiConfig.getProfile() + version.getFilePath();
            File file = new File(filePath);

            if (!file.exists()) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().write("文件不存在");
                return;
            }

            // 根据文件类型设置 Content-Type
            String contentType = getContentType(version.getFileName());
            response.setContentType(contentType);
            response.setCharacterEncoding("UTF-8");
            response.setContentLengthLong(file.length());

            // 设置下载文件名
            String fileName = URLEncoder.encode(version.getFileName(), StandardCharsets.UTF_8);
            response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName + "\"");

            // 读取文件并输出
            try (InputStream inputStream = new FileInputStream(file);
                    OutputStream outputStream = response.getOutputStream()) {
                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, bytesRead);
                }
                outputStream.flush();
            }
        } catch (IOException e) {
            logger.error("下载文件失败：{}", e.getMessage());
        }
    }

    /**
     * 在线预览文件
     */
    @PreAuthorize("@ss.hasPermi('system:archive:query')")
    @GetMapping("/preview/{versionId}")
    public void preview(@PathVariable Long versionId, HttpServletResponse response) {
        BamsArchiveVersion version = bamsArchiveVersionService.selectBamsArchiveVersionByVersionId(versionId);
        if (version == null) {
            return;
        }

        try {
            String filePath = RuoYiConfig.getProfile() + version.getFilePath();
            File file = new File(filePath);

            if (!file.exists()) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().write("文件不存在");
                return;
            }

            // 根据文件类型设置 Content-Type
            String contentType = getContentType(version.getFileName());
            response.setContentType(contentType);
            response.setCharacterEncoding("UTF-8");
            response.setContentLengthLong(file.length());
            response.setHeader("Content-Disposition", "inline");

            // 读取文件并输出
            try (InputStream inputStream = new FileInputStream(file);
                    OutputStream outputStream = response.getOutputStream()) {
                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, bytesRead);
                }
                outputStream.flush();
            }
        } catch (IOException e) {
            logger.error("预览文件失败：{}", e.getMessage());
        }
    }

    /**
     * 根据文件名获取 Content-Type
     */
    private String getContentType(String fileName) {
        if (fileName == null) {
            return "application/octet-stream";
        }

        String lowerFileName = fileName.toLowerCase();
        if (lowerFileName.endsWith(".pdf")) {
            return "application/pdf";
        } else if (lowerFileName.endsWith(".doc")) {
            return "application/msword";
        } else if (lowerFileName.endsWith(".docx")) {
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        } else if (lowerFileName.endsWith(".xls")) {
            return "application/vnd.ms-excel";
        } else if (lowerFileName.endsWith(".xlsx")) {
            return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        } else if (lowerFileName.endsWith(".jpg") || lowerFileName.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (lowerFileName.endsWith(".png")) {
            return "image/png";
        } else if (lowerFileName.endsWith(".dwg")) {
            return "application/acad";
        } else if (lowerFileName.endsWith(".dxf")) {
            return "application/dxf";
        }
        return "application/octet-stream";
    }
}
