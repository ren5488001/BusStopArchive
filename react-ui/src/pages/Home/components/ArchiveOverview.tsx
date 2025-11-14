import { Card, Progress, Button, Descriptions, Tag, Space } from 'antd';
import { FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons';

interface Project {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number];
  status: string;
  completeness: number;
  manager: string;
  phases: {
    name: string;
    completeness: number;
    total: number;
    completed: number;
  }[];
}

interface ArchiveOverviewProps {
  project: Project;
}

export default function ArchiveOverview({ project }: ArchiveOverviewProps) {
  const getCompletenessColor = (completeness: number) => {
    if (completeness >= 90) return '#52c41a';
    if (completeness >= 70) return '#faad14';
    return '#ff4d4f';
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case '已竣工':
        return <Tag color="blue">{status}</Tag>;
      case '在建中':
        return <Tag color="green">{status}</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  // 计算环形进度条的路径
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (project.completeness / 100) * circumference;

  return (
    <Card
      title={
        <Space>
          <FileTextOutlined style={{ color: '#1890ff' }} />
          <span>档案完整度概览</span>
        </Space>
      }
      styles={{
        body: {
          padding: 24,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* 项目基本信息 */}
        <div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>{project.name}</div>
            <div style={{ fontSize: 14, color: '#8c8c8c' }}>{project.location}</div>
          </div>
          <Descriptions column={1} size="small" style={{ marginTop: 12 }}>
            <Descriptions.Item label="项目负责人">{project.manager}</Descriptions.Item>
            <Descriptions.Item label="项目状态">{getStatusTag(project.status)}</Descriptions.Item>
          </Descriptions>
        </div>

        {/* 总体完整度仪表盘 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ position: 'relative', width: 192, height: 192 }}>
            <svg
              style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}
              viewBox="0 0 200 200"
            >
              {/* 背景圆环 */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                stroke="#f0f0f0"
                strokeWidth="12"
                fill="transparent"
              />
              {/* 进度圆环 */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                stroke={getCompletenessColor(project.completeness)}
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                style={{
                  transition: 'stroke-dashoffset 0.5s ease-in-out',
                }}
              />
            </svg>
            {/* 中心文字 */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 'bold',
                  color: getCompletenessColor(project.completeness),
                }}
              >
                {project.completeness}%
              </span>
              <span style={{ fontSize: 14, color: '#8c8c8c', marginTop: 4 }}>总体完整度</span>
            </div>
          </div>
        </div>

        {/* 阶段完整度列表 */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#262626', marginBottom: 12 }}>
            各阶段完整度
          </div>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {project.phases.map((phase, index) => (
              <div key={index}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#262626' }}>{phase.name}</span>
                  <Space size="small">
                    <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                      {phase.completed}/{phase.total}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: getCompletenessColor(phase.completeness),
                      }}
                    >
                      {phase.completeness}%
                    </span>
                  </Space>
                </div>
                <Progress
                  percent={phase.completeness}
                  strokeColor={getCompletenessColor(phase.completeness)}
                  showInfo={false}
                  size="small"
                />
              </div>
            ))}
          </Space>
        </div>

        {/* 操作按钮 */}
        <div style={{ paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
          <Button type="primary" block icon={<FileTextOutlined />}>
            查看详细档案
          </Button>
        </div>
      </div>
    </Card>
  );
}
