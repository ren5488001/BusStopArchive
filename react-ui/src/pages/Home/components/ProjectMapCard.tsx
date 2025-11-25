import { Card, Progress, Button, Space, Empty } from 'antd';
import { FileOutlined } from '@ant-design/icons';

interface ProjectDetail {
  id: string | number;
  name: string;
  address: string;
  manager: string;
  status: string;
  statusColor: string;
  completeness: number;
  phases: {
    name: string;
    completed: number;
    total: number;
    percentage: number;
    color: string;
  }[];
}

interface ProjectMapCardProps {
  project?: ProjectDetail;
  onViewDetail?: () => void;
}

export default function ProjectMapCard({ project, onViewDetail }: ProjectMapCardProps) {
  if (!project) {
    return (
      <Card
        title={
          <Space>
            <FileOutlined style={{ color: '#1890ff' }} />
            <span>档案完整度概览</span>
          </Space>
        }
        style={{ height: '100%' }}
      >
        <Empty
          description="点击地图上的标记点查看项目详情"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space>
          <FileOutlined style={{ color: '#1890ff' }} />
          <span>档案完整度概览</span>
        </Space>
      }
      style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}
      styles={{
        body: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* 项目基本信息 */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px 0' }}>
            {project.name}
          </h2>
          <p style={{ fontSize: 14, color: '#8c8c8c', margin: '0 0 16px 0' }}>
            {project.address}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span style={{ color: '#8c8c8c' }}>项目负责人：</span>
            <span style={{ fontWeight: 500 }}>{project.manager}</span>
          </div>
        </div>

        {/* 总体完整度 */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 200, height: 200 }}>
            <svg width="200" height="200" viewBox="0 0 200 200">
              {/* 背景圆环 */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#f0f0f0"
                strokeWidth="16"
              />
              {/* 进度圆环 */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#faad14"
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 80 * (project.completeness / 100)} ${2 * Math.PI * 80}`}
                transform="rotate(-90 100 100)"
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 48, fontWeight: 'bold', color: '#faad14' }}>
                {project.completeness}%
              </div>
              <div style={{ fontSize: 14, color: '#8c8c8c', marginTop: 4 }}>
                总体完整度
              </div>
            </div>
          </div>
        </div>

        {/* 各阶段完整度 */}
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>各阶段完整度</h3>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {project.phases.map((phase, index) => (
              <div key={index}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                    fontSize: 14,
                  }}
                >
                  <span style={{ fontWeight: 500 }}>{phase.name}</span>
                  <span style={{ color: '#8c8c8c' }}>
                    {phase.completed}/{phase.total} {phase.percentage}%
                  </span>
                </div>
                <Progress
                  percent={phase.percentage}
                  strokeColor={phase.color}
                  showInfo={false}
                  size="small"
                />
              </div>
            ))}
          </Space>
        </div>

        {/* 查看详情按钮 */}
        <div style={{ marginTop: 'auto', paddingTop: 16 }}>
          <Button
            type="primary"
            block
            size="large"
            icon={<FileOutlined />}
            onClick={onViewDetail}
          >
            查看项目详情
          </Button>
        </div>
      </div>
    </Card>
  );
}
