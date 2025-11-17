import { request } from '@umijs/max';

/**
 * 项目阶段模板 API
 *
 * @author Rick
 */

// 查询阶段模板列表
export async function getTemplateList(params?: any) {
  return request('/api/bams/stage/template/list', {
    method: 'GET',
    params: {
      ...params,
    },
  });
}

// 查询阶段模板详情
export async function getTemplateDetail(templateId: number) {
  return request(`/api/bams/stage/template/${templateId}`, {
    method: 'GET',
  });
}

// 新增阶段模板
export async function addTemplate(data: any) {
  return request('/api/bams/stage/template', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    data: data,
  });
}

// 修改阶段模板
export async function updateTemplate(data: any) {
  return request('/api/bams/stage/template', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    data: data,
  });
}

// 删除阶段模板
export async function deleteTemplate(templateIds: string) {
  return request(`/api/bams/stage/template/${templateIds}`, {
    method: 'DELETE',
  });
}

// 复制阶段模板
export async function copyTemplate(templateId: number) {
  return request(`/api/bams/stage/template/copy/${templateId}`, {
    method: 'POST',
  });
}
