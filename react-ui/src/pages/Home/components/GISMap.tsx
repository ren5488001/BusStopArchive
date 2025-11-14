import { useState } from 'react';
import { Card, Space, Button, Tooltip, Tag } from 'antd';
import {
  GlobalOutlined,
  PlusOutlined,
  MinusOutlined,
  ExpandOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';

interface Project {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number];
  status: string;
  completeness: number;
  manager: string;
}

interface GISMapProps {
  projects: Project[];
  selectedProject: Project;
  onProjectSelect: (project: Project) => void;
}

export default function GISMap({ projects, selectedProject, onProjectSelect }: GISMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([116.4074, 39.9042]);
  const [zoomLevel, setZoomLevel] = useState(10);

  const getStatusColor = (status: string) => {
    switch (status) {
      case '已竣工': return { bg: '#1890ff', border: '#096dd9' };
      case '在建中': return { bg: '#52c41a', border: '#389e0d' };
      case '已暂停': return { bg: '#d9d9d9', border: '#bfbfbf' };
      default: return { bg: '#1890ff', border: '#096dd9' };
    }
  };

  const getCompletenessColor = (completeness: number) => {
    if (completeness >= 90) return '#52c41a';
    if (completeness >= 70) return '#faad14';
    return '#ff4d4f';
  };

  return (
    <Card
      title={
        <Space>
          <GlobalOutlined style={{ color: '#1890ff' }} />
          <span>项目地理分布图</span>
        </Space>
      }
      extra={
        <Space>
          <Space size="small">
            <Tag color="blue">
              <span style={{ display: 'inline-block', width: 8, height: 8, background: '#1890ff', borderRadius: '50%', marginRight: 4 }} />
              已竣工
            </Tag>
            <Tag color="green">
              <span style={{ display: 'inline-block', width: 8, height: 8, background: '#52c41a', borderRadius: '50%', marginRight: 4 }} />
              在建中
            </Tag>
            <Tag>
              <span style={{ display: 'inline-block', width: 8, height: 8, background: '#d9d9d9', borderRadius: '50%', marginRight: 4 }} />
              已暂停
            </Tag>
          </Space>
          <Button
            type="text"
            icon={<PlusOutlined />}
            onClick={() => setZoomLevel(prev => Math.min(prev + 1, 18))}
          />
          <Button
            type="text"
            icon={<MinusOutlined />}
            onClick={() => setZoomLevel(prev => Math.max(prev - 1, 1))}
          />
        </Space>
      }
      styles={{
        body: {
          flex: 1,
          padding: 0,
          position: 'relative',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        {/* 地图背景 */}
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)',
            position: 'relative',
            overflow: 'hidden',
            backgroundImage: `url('https://readdy.ai/api/search-image?query=Modern%20city%20map%20view%20with%20clean%20streets%20and%20buildings%2C%20aerial%20perspective%2C%20minimalist%20design%2C%20light%20blue%20and%20green%20color%20scheme%2C%20urban%20planning%20visualization%2C%20geographic%20information%20system%20interface%2C%20professional%20dashboard%20background&width=800&height=600&seq=map001&orientation=landscape')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* 地图控件 */}
          <div style={{ position: 'absolute', top: 16, right: 16, background: '#fff', borderRadius: 8, padding: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
            <Space direction="vertical" size="small">
              <Button
                type="text"
                icon={<EnvironmentOutlined />}
                style={{ display: 'block', width: 32, height: 32 }}
              />
              <Button
                type="text"
                icon={<ExpandOutlined />}
                style={{ display: 'block', width: 32, height: 32 }}
              />
            </Space>
          </div>

          {/* 项目标记点 */}
          {projects.map((project, index) => {
            const statusColor = getStatusColor(project.status);
            const isSelected = selectedProject.id === project.id;
            return (
              <div
                key={project.id}
                style={{
                  position: 'absolute',
                  left: `${20 + (index % 5) * 15}%`,
                  top: `${25 + Math.floor(index / 5) * 20}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  zIndex: isSelected ? 10 : 1,
                }}
                onClick={() => onProjectSelect(project)}
                onMouseEnter={(e) => {
                  const tooltip = e.currentTarget.querySelector('.project-tooltip') as HTMLElement;
                  if (tooltip) tooltip.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  const tooltip = e.currentTarget.querySelector('.project-tooltip') as HTMLElement;
                  if (tooltip) tooltip.style.opacity = '0';
                }}
              >
                {/* 标记点 */}
                <div
                  style={{
                    width: isSelected ? 20 : 16,
                    height: isSelected ? 20 : 16,
                    borderRadius: '50%',
                    background: statusColor.bg,
                    border: `2px solid ${statusColor.border}`,
                    boxShadow: isSelected ? '0 0 0 4px rgba(24, 144, 255, 0.2)' : '0 2px 8px rgba(0,0,0,0.15)',
                    transition: 'all 0.2s',
                  }}
                />

                {/* 悬浮信息卡片 */}
                <div
                  className="project-tooltip"
                  style={{
                    position: 'absolute',
                    bottom: 24,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    pointerEvents: 'none',
                    zIndex: 1000,
                  }}
                >
                  <Card
                    size="small"
                    style={{
                      minWidth: 192,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{project.name}</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>{project.location}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: '#8c8c8c' }}>完整度:</span>
                      <span style={{ fontWeight: 500, color: getCompletenessColor(project.completeness) }}>
                        {project.completeness}%
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: '#8c8c8c' }}>状态:</span>
                      <span style={{ fontWeight: 500 }}>{project.status}</span>
                    </div>
                  </Card>
                </div>
              </div>
            );
          })}

          {/* 地图图例 */}
          <div style={{ position: 'absolute', bottom: 16, left: 16, background: '#fff', borderRadius: 8, padding: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#262626', marginBottom: 8 }}>图例说明</div>
            <Space direction="vertical" size="small" style={{ fontSize: 12 }}>
              <Space size="small">
                <span style={{ display: 'inline-block', width: 12, height: 12, background: '#1890ff', borderRadius: '50%' }} />
                <span>已竣工项目</span>
              </Space>
              <Space size="small">
                <span style={{ display: 'inline-block', width: 12, height: 12, background: '#52c41a', borderRadius: '50%' }} />
                <span>在建中项目</span>
              </Space>
              <Space size="small">
                <span style={{ display: 'inline-block', width: 12, height: 12, background: '#d9d9d9', borderRadius: '50%' }} />
                <span>已暂停项目</span>
              </Space>
            </Space>
          </div>
        </div>
      </div>
    </Card>
  );
}
