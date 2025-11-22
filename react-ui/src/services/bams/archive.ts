import { request } from '@umijs/max';

/** API统一响应类型 */
export type ApiResponse<T = any> = {
  code: number;
  msg: string;
  data?: T;
};

/** 分页响应类型 */
export type PageResult<T = any> = {
  code: number;
  msg: string;
  total: number;
  rows: T[];
};

/** 分页查询参数类型 */
export type PageParams = {
  pageNum?: number;
  pageSize?: number;
};

/** 档案查询参数类型 */
export type ArchiveListParams = PageParams & {
  archiveNumber?: string;
  title?: string;
  projectId?: number;
  projectCode?: string;
  stage?: string;
  fileStandard?: string;
  archiveCategory?: string;
  delFlag?: string;
  status?: string;
  params?: {
    beginFileDate?: string;
    endFileDate?: string;
  };
};

/** 档案信息类型 */
export type ArchiveType = {
  archiveId?: number;
  archiveNumber?: string; // 档案编号（非必填，由前端输入）
  title: string;
  projectId?: number;
  projectCode?: string;
  projectName?: string;
  stage?: string;
  fileDate?: string;
  fileStandard?: string; // 文件标准（字典值）
  archiveCategory?: string; // 档案分类（字典值）
  hasPaperMaterial?: string; // 是否有纸质材料（0=否, 1=是）
  archivalDate?: string;
  fileType?: string;
  fileSize?: number;
  description?: string;
  tags?: string;
  tagList?: string[];
  summary?: string;
  currentVersion?: string;
  versionCount?: number;
  status?: string;
  delFlag?: string;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
  remark?: string;
  versions?: ArchiveVersionType[];
};

/** 档案版本信息类型 */
export type ArchiveVersionType = {
  versionId?: number;
  archiveId?: number;
  versionNumber?: string;
  fileName?: string;
  filePath?: string;
  fileType?: string;
  fileSize?: number;
  fileHash?: string;
  isCurrent?: string;
  versionRemark?: string;
  uploadBy?: string;
  uploadTime?: string;
};

/** 审计日志类型 */
export type AuditLogType = {
  logId?: number;
  archiveId?: number;
  versionId?: number;
  archiveNumber?: string;
  operationType?: string;
  operationModule?: string;
  operationDesc?: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  changeDetail?: string;
  operator?: string;
  operationTime?: string;
  ipAddress?: string;
  userAgent?: string;
};

/** 标签字典类型 */
export type TagDictionaryType = {
  tagId?: number;
  tagName: string;
  usageCount?: number;
  status?: string;
  createBy?: string;
  createTime?: string;
};

// ==================== 档案管理 API ====================

/**
 * 查询档案列表
 */
export async function getArchiveList(params: ArchiveListParams) {
  return request<PageResult<ArchiveType>>('/api/system/archive/list', {
    method: 'GET',
    params,
  });
}

/**
 * 获取档案详情
 */
export async function getArchiveDetail(archiveId: number) {
  return request<ApiResponse<ArchiveType>>(`/api/system/archive/${archiveId}`, {
    method: 'GET',
  });
}

/**
 * 新增档案
 */
export async function addArchive(data: ArchiveType) {
  return request<ApiResponse>('/api/system/archive', {
    method: 'POST',
    data,
  });
}

/**
 * 修改档案
 */
export async function updateArchive(data: ArchiveType) {
  return request<ApiResponse>('/api/system/archive', {
    method: 'PUT',
    data,
  });
}

/**
 * 删除档案（移至回收站）
 */
export async function deleteArchive(archiveIds: number[]) {
  return request<ApiResponse>(`/api/system/archive/${archiveIds.join(',')}`, {
    method: 'DELETE',
  });
}

/**
 * 恢复档案
 */
export async function restoreArchive(archiveIds: number[]) {
  return request<ApiResponse>(`/api/system/archive/restore/${archiveIds.join(',')}`, {
    method: 'PUT',
  });
}

/**
 * 永久删除档案
 */
export async function permanentDeleteArchive(archiveIds: number[]) {
  return request<ApiResponse>(`/api/system/archive/permanent/${archiveIds.join(',')}`, {
    method: 'DELETE',
  });
}

/**
 * 生成档案编号
 */
export async function generateArchiveNumber(projectCode: string) {
  return request<ApiResponse<string>>(`/api/system/archive/generateNumber/${projectCode}`, {
    method: 'GET',
  });
}

/**
 * 导出档案列表
 */
export async function exportArchive(params: ArchiveListParams) {
  return request('/api/system/archive/export', {
    method: 'POST',
    params,
    responseType: 'blob',
  });
}

/**
 * 根据档案ID查询版本列表
 */
export async function getArchiveVersions(archiveId: number) {
  return request<ApiResponse<ArchiveVersionType[]>>(`/api/system/archive/${archiveId}/versions`, {
    method: 'GET',
  });
}

// ==================== 档案版本管理 API ====================

/**
 * 获取版本详情
 */
export async function getVersionDetail(versionId: number) {
  return request<ApiResponse<ArchiveVersionType>>(`/api/system/archive/version/${versionId}`, {
    method: 'GET',
  });
}

/**
 * 临时文件上传（用于OCR识别）
 */
export async function uploadTempFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return request<ApiResponse<{
    tempFilePath: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    ocrResult: {
      title: string;
      summary: string;
      tags: string[];
    };
  }>>('/api/system/archive/version/uploadTemp', {
    method: 'POST',
    data: formData,
    requestType: 'form',
  });
}

/**
 * 上传新版本
 */
export async function uploadVersion(archiveId: number, file: File, versionRemark?: string) {
  const formData = new FormData();
  formData.append('file', file);
  if (versionRemark) {
    formData.append('versionRemark', versionRemark);
  }

  return request<ApiResponse<ArchiveVersionType>>(`/api/system/archive/version/upload/${archiveId}`, {
    method: 'POST',
    data: formData,
    requestType: 'form',
  });
}

/**
 * 设置当前版本
 */
export async function setCurrentVersion(archiveId: number, versionId: number) {
  return request<ApiResponse>(`/api/system/archive/version/setCurrent/${archiveId}/${versionId}`, {
    method: 'PUT',
  });
}

/**
 * 修改版本说明
 */
export async function updateVersion(data: ArchiveVersionType) {
  return request<ApiResponse>('/api/system/archive/version', {
    method: 'PUT',
    data,
  });
}

/**
 * 删除版本
 */
export async function deleteVersion(versionIds: number[]) {
  return request<ApiResponse>(`/api/system/archive/version/${versionIds.join(',')}`, {
    method: 'DELETE',
  });
}

/**
 * 下载版本文件
 */
export async function downloadVersion(versionId: number, fileName?: string) {
  const response = await request(`/api/system/archive/version/download/${versionId}`, {
    method: 'GET',
    responseType: 'blob',
  });

  // 创建下载链接
  const blob = new Blob([response]);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName || `file_${versionId}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * 在线预览文件
 */
export async function previewVersion(versionId: number) {
  const response = await request(`/api/system/archive/version/preview/${versionId}`, {
    method: 'GET',
    responseType: 'blob',
  });

  // 创建预览窗口
  const blob = new Blob([response]);
  const url = window.URL.createObjectURL(blob);
  window.open(url, '_blank');

  // 延迟释放 URL，确保新窗口有时间加载
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 100);
}

// ==================== 审计日志 API ====================

/**
 * 查询审计日志列表
 */
export async function getAuditLogList(params: PageParams & {
  archiveId?: number;
  versionId?: number;
  operationType?: string;
  operationModule?: string;
  operator?: string;
}) {
  return request<PageResult<AuditLogType>>('/api/system/archive/auditLog/list', {
    method: 'GET',
    params,
  });
}

/**
 * 根据档案ID查询审计日志
 */
export async function getAuditLogsByArchiveId(archiveId: number) {
  return request<ApiResponse<AuditLogType[]>>(`/api/system/archive/auditLog/archive/${archiveId}`, {
    method: 'GET',
  });
}

/**
 * 根据版本ID查询审计日志
 */
export async function getAuditLogsByVersionId(versionId: number) {
  return request<ApiResponse<AuditLogType[]>>(`/api/system/archive/auditLog/version/${versionId}`, {
    method: 'GET',
  });
}

// ==================== 标签字典 API ====================

/**
 * 查询标签列表
 */
export async function getTagList(params: PageParams & {
  tagName?: string;
  status?: string;
}) {
  return request<PageResult<TagDictionaryType>>('/api/system/archive/tag/list', {
    method: 'GET',
    params,
  });
}

/**
 * 获取所有启用的标签
 */
export async function getEnabledTags() {
  return request<ApiResponse<TagDictionaryType[]>>('/api/system/archive/tag/enabled', {
    method: 'GET',
  });
}

/**
 * 新增标签
 */
export async function addTag(data: TagDictionaryType) {
  return request<ApiResponse>('/api/system/archive/tag', {
    method: 'POST',
    data,
  });
}

/**
 * 修改标签
 */
export async function updateTag(data: TagDictionaryType) {
  return request<ApiResponse>('/api/system/archive/tag', {
    method: 'PUT',
    data,
  });
}

/**
 * 删除标签
 */
export async function deleteTag(tagIds: number[]) {
  return request<ApiResponse>(`/api/system/archive/tag/${tagIds.join(',')}`, {
    method: 'DELETE',
  });
}
