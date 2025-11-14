import { useState } from 'react';
import { Card, Input, Select, Checkbox, Button, Table, Tag, Progress, Space, Tooltip } from 'antd';
import { SearchOutlined, PlusOutlined, DownloadOutlined, EyeOutlined, EditOutlined, DeleteOutlined, UndoOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface Project {
  id: string;
  code: string;
  name: string;
  template: string;
  status: string;
  completeness: number;
  manager: string;
  createDate: string;
  isDeleted?: boolean;
}

interface ProjectListProps {
  projects: Project[];
  onNewProject: () => void;
  onEditProject: (project: Project) => void;
}

export default function ProjectList({ projects, onNewProject, onEditProject }: ProjectListProps) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [managerFilter, setManagerFilter] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case '在建中': return 'processing';
      case '已竣工': return 'success';
      case '暂停': return 'default';
      case '计划中': return 'warning';
      default: return 'default';
    }
  };

  const getCompletenessColor = (completeness: number) => {
    if (completeness >= 90) return 'success';
    if (completeness >= 70) return 'normal';
    return 'exception';
  };

  const filteredProjects = projects.filter(project => {
    if (!showDeleted && project.isDeleted) return false;
    if (showDeleted && !project.isDeleted) return false;
    
    if (searchKeyword && !project.code.includes(searchKeyword) && !project.name.includes(searchKeyword)) return false;
    if (statusFilter && project.status !== statusFilter) return false;
    if (managerFilter && project.manager !== managerFilter) return false;
    
    return true;
  });

  const uniqueManagers = [...new Set(projects.map(p => p.manager))];

  const columns: ColumnsType<Project> = [
    {
      title: '项目编号',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      ellipsis: true,
    },
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: '建设阶段模板',
      dataIndex: 'template',
      key: 'template',
      width: 200,
      ellipsis: true,
    },
    {
      title: '项目状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: '档案完整度',
      dataIndex: 'completeness',
      key: 'completeness',
      width: 200,
      render: (completeness: number) => (
        <Space>
          <Progress
            percent={completeness}
            status={getCompletenessColor(completeness)}
            size="small"
            style={{ width: 120 }}
          />
          <span style={{ minWidth: 40, textAlign: 'right' }}>{completeness}%</span>
        </Space>
      ),
    },
    {
      title: '负责人',
      dataIndex: 'manager',
      key: 'manager',
      width: 120,
    },
    {
      title: '创建日期',
      dataIndex: 'createDate',
      key: 'createDate',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {record.isDeleted ? (
            <>
              <Tooltip title="恢复">
                <Button
                  type="link"
                  icon={<UndoOutlined />}
                  onClick={() => {
                    // TODO: 实现恢复功能
                    console.log('恢复项目', record);
                  }}
                >
                  恢复
                </Button>
              </Tooltip>
              <Tooltip title="彻底删除">
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    // TODO: 实现彻底删除功能
                    console.log('彻底删除项目', record);
                  }}
                >
                  彻底删除
                </Button>
              </Tooltip>
            </>
          ) : (
            <>
              <Tooltip title="详情">
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => {
                    // TODO: 实现详情功能
                    console.log('查看详情', record);
                  }}
                >
                  详情
                </Button>
              </Tooltip>
              <Tooltip title="编辑">
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => onEditProject(record)}
                >
                  编辑
                </Button>
              </Tooltip>
              <Tooltip title="删除">
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    // TODO: 实现删除功能
                    console.log('删除项目', record);
                  }}
                >
                  删除
                </Button>
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex', width: '100%' }}>
      {/* 筛选查询区 */}
      <Card title="筛选查询">
        <Space wrap size="large" style={{ width: '100%' }}>
          <Input
            placeholder="项目编号或名称"
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          
          <Select
            placeholder="全部状态"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
            allowClear
          >
            <Select.Option value="在建中">在建中</Select.Option>
            <Select.Option value="已竣工">已竣工</Select.Option>
            <Select.Option value="暂停">暂停</Select.Option>
            <Select.Option value="计划中">计划中</Select.Option>
          </Select>
          
          <Select
            placeholder="全部负责人"
            value={managerFilter}
            onChange={setManagerFilter}
            style={{ width: 150 }}
            allowClear
          >
            {uniqueManagers.map(manager => (
              <Select.Option key={manager} value={manager}>{manager}</Select.Option>
            ))}
          </Select>
          
          <Checkbox
            checked={showDeleted}
            onChange={(e) => setShowDeleted(e.target.checked)}
          >
            显示已删除
          </Checkbox>
        </Space>
      </Card>

      {/* 操作栏 */}
      <Card>
        <Space style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onNewProject}
            >
              新增项目
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => {
                // TODO: 实现批量导出功能
                console.log('批量导出');
              }}
            >
              批量导出
            </Button>
          </Space>
          <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
            共 {filteredProjects.length} 个项目
          </span>
        </Space>
      </Card>

      {/* 数据表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredProjects}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>
    </Space>
  );
}

