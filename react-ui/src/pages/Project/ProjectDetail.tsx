import { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Descriptions, Tag, Progress, Spin, Button, Space, message, Table, Empty, Modal } from 'antd';
import { ArrowLeftOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { useParams, history } from '@umijs/max';
import { getProject, getProjectStages, refreshProjectStatistics, type ProjectType, type ProjectStageType, type FileOptionType } from '@/services/bams/project';
import { type ArchiveType } from '@/services/bams/archive';
import ArchiveDetail from '@/pages/Archive/components/ArchiveDetail';
import type { ColumnsType } from 'antd/es/table';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectType | null>(null);
  const [stages, setStages] = useState<ProjectStageType[]>([]);
  const [selectedArchiveId, setSelectedArchiveId] = useState<number | null>(null);
  const [archiveDetailVisible, setArchiveDetailVisible] = useState(false);

  useEffect(() => {
    if (id) {
      loadProjectDetail();
    }
  }, [id]);

  const loadProjectDetail = async () => {
    try {
      setLoading(true);
      const projectId = parseInt(id!);

      // 并行请求项目信息和阶段信息（阶段信息已包含档案列表）
      const [projectRes, stagesRes] = await Promise.all([
        getProject(projectId),
        getProjectStages(projectId),
      ]);

      if (projectRes.code === 200) {
        setProject(projectRes.data!);
      } else {
        message.error(projectRes.msg || '获取项目信息失败');
      }

      if (stagesRes.code === 200) {
        setStages(stagesRes.data || []);
      }
    } catch (error) {
      console.error('加载项目详情失败:', error);
      message.error('加载项目详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStatistics = async () => {
    try {
      const projectId = parseInt(id!);
      const res = await refreshProjectStatistics(projectId);
      if (res.code === 200) {
        message.success('统计数据已刷新');
        // 重新加载项目详情
        loadProjectDetail();
      } else {
        message.error(res.msg || '刷新统计数据失败');
      }
    } catch (error) {
      console.error('刷新统计数据失败:', error);
      message.error('刷新统计数据失败');
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case '在建中': return 'processing';
      case '已竣工': return 'success';
      case '暂停': return 'default';
      case '计划中': return 'warning';
      default: return 'default';
    }
  };

  const getCompletenessStatus = (completeness: number) => {
    if (completeness >= 90) return 'success';
    if (completeness >= 70) return 'normal';
    return 'exception';
  };

  const getStageColor = (stageName: string) => {
    const colorMap: Record<string, string> = {
      立项: 'blue',
      设计: 'cyan',
      施工: 'orange',
      验收: 'green',
    };
    return colorMap[stageName] || 'default';
  };

  // 档案列表列定义
  const archiveColumns: ColumnsType<ArchiveType> = [
    {
      title: '档案编号',
      dataIndex: 'archiveNumber',
      key: 'archiveNumber',
      width: 180,
      render: (text) => text || '-',
    },
    {
      title: '档案名称',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '归档日期',
      dataIndex: 'archivalDate',
      key: 'archivalDate',
      width: 120,
      render: (text) => text || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedArchiveId(record.archiveId!);
            setArchiveDetailVisible(true);
          }}
        >
          查看
        </Button>
      ),
    },
  ];

  // 展开行内容 - 现在直接使用后端返回的档案数据
  const expandedRowRender = (record: ProjectStageType) => {
    const files = record.requiredFileList;

    if (!files || files.length === 0) {
      return (
        <div style={{ padding: '16px 0' }}>
          <Empty description="该阶段暂无标准文件要求" />
        </div>
      );
    }

    return (
      <div style={{ padding: '8px 0' }}>
        {files.map((file, index) => (
          <div key={file.id} style={{ marginBottom: index < files.length - 1 ? 24 : 0 }}>
            <div style={{
              marginBottom: 12,
              padding: '8px 12px',
              background: '#fafafa',
              borderLeft: '3px solid #1890ff',
            }}>
              <Space>
                <span style={{ fontWeight: 500, fontSize: 14 }}>标准文件：</span>
                <Tag color="blue">{file.name}</Tag>
                <span style={{ color: '#999', fontSize: 12 }}>
                  已归档 {file.archives?.length || 0} 份
                </span>
              </Space>
            </div>

            {file.archives && file.archives.length > 0 ? (
              <Table
                columns={archiveColumns}
                dataSource={file.archives}
                rowKey="archiveId"
                pagination={false}
                size="small"
              />
            ) : (
              <Empty
                description={`暂无"${file.name}"的归档档案`}
                style={{ padding: '20px 0' }}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const stageColumns: ColumnsType<ProjectStageType> = [
    {
      title: '阶段名称',
      dataIndex: 'stageDisplayName',
      key: 'stageDisplayName',
      width: 120,
      render: (text) => <Tag color={getStageColor(text)}>{text}</Tag>,
    },
    {
      title: '要求文件数',
      dataIndex: 'requiredFileCount',
      key: 'requiredFileCount',
      width: 120,
      render: (count) => <span style={{ fontWeight: 500 }}>{count || 0}</span>,
    },
    {
      title: '已归档文件数',
      dataIndex: 'archivedFileCount',
      key: 'archivedFileCount',
      width: 120,
      render: (count) => (
        <span style={{ fontWeight: 500, color: '#52c41a' }}>{count || 0}</span>
      ),
    },
    {
      title: '完整度',
      dataIndex: 'completenessRate',
      key: 'completenessRate',
      width: 200,
      render: (rate) => (
        <Progress
          percent={rate || 0}
          status={getCompletenessStatus(rate || 0)}
          size="small"
        />
      ),
    },
  ];

  if (loading) {
    return (
      <PageContainer>
        <Card>
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" tip="加载中..." />
          </div>
        </Card>
      </PageContainer>
    );
  }

  if (!project) {
    return (
      <PageContainer>
        <Card>
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <p style={{ fontSize: 16, color: '#999' }}>项目不存在</p>
            <Button type="primary" onClick={() => history.back()}>
              返回
            </Button>
          </div>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="项目详情"
      extra={
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => history.back()}>
            返回
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefreshStatistics}
          >
            刷新统计
          </Button>
        </Space>
      }
    >
      <Space direction="vertical" size="large" style={{ display: 'flex', width: '100%' }}>
        {/* 基本信息 */}
        <Card title="基本信息" bordered={false}>
          <Descriptions column={2} bordered>
            <Descriptions.Item label="项目编号" span={1}>
              {project.projectCode}
            </Descriptions.Item>
            <Descriptions.Item label="项目名称" span={1}>
              {project.projectName}
            </Descriptions.Item>
            <Descriptions.Item label="阶段模板" span={1}>
              {project.templateName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="项目状态" span={1}>
              <Tag color={getStatusColor(project.status)}>{project.status || '未知'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="项目负责人" span={1}>
              {project.projectManager || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间" span={1}>
              {project.createTime || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间" span={1}>
              {project.updateTime || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="档案完整度" span={1}>
              <Space>
                <Progress
                  percent={project.completenessRate || 0}
                  status={getCompletenessStatus(project.completenessRate || 0)}
                  style={{ width: 200 }}
                />
              </Space>
            </Descriptions.Item>
            {project.latitude && project.longitude && (
              <>
                <Descriptions.Item label="纬度" span={1}>
                  {project.latitude}
                </Descriptions.Item>
                <Descriptions.Item label="经度" span={1}>
                  {project.longitude}
                </Descriptions.Item>
              </>
            )}
            {project.projectDesc && (
              <Descriptions.Item label="项目描述" span={2}>
                {project.projectDesc}
              </Descriptions.Item>
            )}
            {project.remark && (
              <Descriptions.Item label="备注" span={2}>
                {project.remark}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* 档案统计 */}
        <Card title="档案统计" bordered={false}>
          <Descriptions column={3} bordered>
            <Descriptions.Item label="档案完整度">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Progress
                  type="circle"
                  percent={project.completenessRate || 0}
                  status={getCompletenessStatus(project.completenessRate || 0)}
                  width={80}
                />
                <div>
                  <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>
                    {project.completenessRate || 0}%
                  </div>
                  <div style={{ color: '#8c8c8c' }}>总体完整度</div>
                </div>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="要求文件总数">
              <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1890ff' }}>
                {project.totalRequiredFiles || 0}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="已归档文件数">
              <div style={{ fontSize: 28, fontWeight: 'bold', color: '#52c41a' }}>
                {project.actualArchivedFiles || 0}
              </div>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 项目阶段信息 */}
        {stages.length > 0 && (
          <Card title="项目阶段信息" bordered={false}>
            <div style={{ marginBottom: 16, color: '#666', fontSize: 14 }}>
              点击展开查看每个阶段的标准文件及已归档档案详情
            </div>
            <Table
              columns={stageColumns}
              dataSource={stages}
              rowKey="id"
              pagination={false}
              expandable={{
                expandedRowRender,
              }}
            />
          </Card>
        )}
      </Space>

      {/* 档案详情弹窗 */}
      <Modal
        title="档案详情"
        open={archiveDetailVisible}
        onCancel={() => {
          setArchiveDetailVisible(false);
          setSelectedArchiveId(null);
        }}
        footer={null}
        width={1200}
        destroyOnClose
      >
        {selectedArchiveId && (
          <ArchiveDetail
            archiveId={selectedArchiveId}
            onClose={() => {
              setArchiveDetailVisible(false);
              setSelectedArchiveId(null);
            }}
          />
        )}
      </Modal>
    </PageContainer>
  );
}
