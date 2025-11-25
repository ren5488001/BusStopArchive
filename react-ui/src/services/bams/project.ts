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

/** 项目查询参数类型 */
export type ProjectListParams = PageParams & {
  projectCode?: string;
  projectName?: string;
  projectManager?: string;
  params?: {
    beginTime?: string;
    endTime?: string;
  };
};

/** 项目信息类型 */
export type ProjectType = {
  projectId?: number;
  projectCode?: string;
  projectName: string;
  projectManager?: string;
  latitude?: number;
  longitude?: number;
  templateId?: number;
  templateName?: string;
  completenessRate?: number;
  totalRequiredFiles?: number;
  actualArchivedFiles?: number;
  projectDesc?: string;
  createTime?: string;
  updateTime?: string;
  remark?: string;
};

/** 文件选项类型 */
export type FileOptionType = {
  id: string; // 字典值
  name: string; // 中文名称
  archives?: any[]; // 该标准文件对应的档案列表
};

/** 项目阶段类型 */
export type ProjectStageType = {
  id?: number; // 主键ID
  projectId?: number;
  stageId: string; // 阶段ID（字典键值: 0,1,2,3）
  stageDisplayName: string; // 阶段显示名称: 立项,设计,施工,验收
  stageOrder: number;
  requiredFiles?: string; // 标准文件字典值（逗号分隔）
  requiredFileList?: FileOptionType[]; // 标准文件列表（对象数组）
  requiredFileCount?: number;
  archivedFileCount?: number;
  completenessRate?: number;
  createTime?: string;
  updateTime?: string;
};

/** 查询项目列表 */
export async function getProjectList(
  params: ProjectListParams
): Promise<PageResult<ProjectType>> {
  return request('/api/bams/project/list', {
    method: 'GET',
    params,
  });
}

/** 查询项目详情 */
export async function getProject(
  projectId: number
): Promise<ApiResponse<ProjectType>> {
  return request(`/api/bams/project/${projectId}`, {
    method: 'GET',
  });
}

/** 根据项目编号查询 */
export async function getProjectByCode(
  projectCode: string
): Promise<ApiResponse<ProjectType>> {
  return request(`/api/bams/project/code/${projectCode}`, {
    method: 'GET',
  });
}

/** 查询项目阶段列表 */
export async function getProjectStages(
  projectId: number
): Promise<ApiResponse<ProjectStageType[]>> {
  return request(`/api/bams/project/stages/${projectId}`, {
    method: 'GET',
  });
}

/** 新增项目 */
export async function addProject(
  data: ProjectType
): Promise<ApiResponse<{ projectId: number; projectCode: string }>> {
  return request('/api/bams/project', {
    method: 'POST',
    data,
  });
}

/** 修改项目 */
export async function updateProject(
  data: ProjectType
): Promise<ApiResponse<void>> {
  return request('/api/bams/project/update', {
    method: 'POST',
    data,
  });
}

/** 获取项目的档案数量 */
export async function getProjectArchiveCount(
  projectId: number
): Promise<ApiResponse<number>> {
  return request(`/api/bams/project/archiveCount/${projectId}`, {
    method: 'GET',
  });
}

/** 删除项目 */
export async function deleteProject(
  projectIds: number[]
): Promise<ApiResponse<void>> {
  return request('/api/bams/project/delete', {
    method: 'POST',
    data: projectIds,
  });
}

/** 导出项目数据 */
export async function exportProject(
  params: ProjectListParams
): Promise<Blob> {
  return request('/api/bams/project/export', {
    method: 'POST',
    data: params,
    responseType: 'blob',
  });
}

/** 查询回收站列表 */
export async function getRecycleList(params: any) {
  return request('/api/bams/project/recycle/list', {
    method: 'GET',
    params,
  });
}

/** 恢复已删除项目 */
export async function restoreProject(projectId: number) {
  return request('/api/bams/project/recycle/restore', {
    method: 'POST',
    data: projectId,
  });
}

/** 彻底删除项目 */
export async function cleanProject(projectIds: number[]) {
  return request('/api/bams/project/recycle/clean', {
    method: 'POST',
    data: projectIds,
  });
}

/** 刷新项目统计数据 */
export async function refreshProjectStatistics(
  projectId: number
): Promise<ApiResponse<void>> {
  return request(`/api/bams/project/refreshStatistics/${projectId}`, {
    method: 'POST',
  });
}
