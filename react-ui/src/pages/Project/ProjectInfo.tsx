import { useState, useRef, useMemo, useCallback } from 'react';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, message, Modal, Tag, Progress, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExportOutlined } from '@ant-design/icons';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { getProjectList, deleteProject, type ProjectType } from '@/services/bams/project';
import { downLoadXlsx } from '@/utils/downloadfile';
import ProjectForm from './components/ProjectForm';

export default function ProjectInfo() {
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectType | null>(null);
  const [searchParams, setSearchParams] = useState<any>({});
  const actionRef = useRef<ActionType>();

  // 使用 useCallback 缓存事件处理函数，避免子组件不必要的重渲染
  const handleNewProject = useCallback(() => {
    setEditingProject(null);
    setShowProjectForm(true);
  }, []);

  const handleEditProject = useCallback((project: ProjectType) => {
    setEditingProject(project);
    setShowProjectForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowProjectForm(false);
    setEditingProject(null);
    actionRef.current?.reload();
  }, []);

  const handleDelete = useCallback((record: ProjectType) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除项目"${record.projectName}"吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteProject([record.projectId!]);
          message.success('删除成功');
          actionRef.current?.reload();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  }, []);

  const handleExport = useCallback(async () => {
    try {
      // 导出时传递当前的筛选条件
      await downLoadXlsx('/api/bams/project/export', { data: searchParams }, '项目信息.xlsx');
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
    }
  }, [searchParams]);

  // 使用 useMemo 缓存计算结果
  const getCompletenessColor = useMemo(() => {
    return (completeness: number) => {
      if (completeness >= 90) return 'success';
      if (completeness >= 70) return 'normal';
      return 'exception';
    };
  }, []);

  // 使用 useMemo 缓存columns配置，避免每次渲染都重新创建
  const columns: ProColumns<ProjectType>[] = useMemo(() => [
    {
      title: '项目编号',
      dataIndex: 'projectCode',
      width: 150,
      ellipsis: true,
      copyable: true,
    },
    {
      title: '项目名称',
      dataIndex: 'projectName',
      width: 200,
      ellipsis: false,
      formItemProps: {
        rules: [{ required: true, message: '请输入项目名称' }],
      },
    },
    {
      title: '阶段模板',
      dataIndex: 'templateName',
      width: 180,
      ellipsis: true,
      search: false,
    },
    {
      title: '档案完整度',
      dataIndex: 'completenessRate',
      width: 180,
      search: false,
      render: (_, record) => (
        <Progress
          percent={record.completenessRate || 0}
          status={getCompletenessColor(record.completenessRate || 0)}
          size="small"
        />
      ),
    },
    {
      title: '项目负责人',
      dataIndex: 'projectManager',
      width: 120,
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 180,
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      fixed: 'right',
      render: (_, record) => [
        <Button
          key="edit"
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleEditProject(record)}
        >
          编辑
        </Button>,
        <Button
          key="delete"
          type="link"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record)}
        >
          删除
        </Button>,
      ],
    },
  ], [handleEditProject, handleDelete, getCompletenessColor]);

  return (
    <PageContainer>
      <ProTable<ProjectType>
        columns={columns}
        actionRef={actionRef}
        request={async (params) => {
          const { current, pageSize, ...rest } = params;
          // 保存查询参数，用于导出
          setSearchParams(rest);
          const response = await getProjectList({
            pageNum: current,
            pageSize,
            ...rest,
          });
          return {
            data: response.rows || [],
            success: true,
            total: response.total || 0,
          };
        }}
        rowKey="projectId"
        search={{
          labelWidth: 'auto',
          collapsed: false,
          collapseRender: false,
        }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        dateFormatter="string"
        headerTitle="项目列表"
        toolBarRender={() => [
          <Button
            key="export"
            icon={<ExportOutlined />}
            onClick={handleExport}
          >
            导出
          </Button>,
          <Button
            key="button"
            icon={<PlusOutlined />}
            type="primary"
            onClick={handleNewProject}
          >
            新增项目
          </Button>,
        ]}
      />

      {/* 项目表单弹窗 */}
      {showProjectForm && (
        <ProjectForm
          project={editingProject}
          onClose={handleCloseForm}
        />
      )}
    </PageContainer>
  );
}
