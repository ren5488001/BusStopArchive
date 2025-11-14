import { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Row, Col, Button, Space, Typography } from 'antd';
import { DashboardOutlined, ReloadOutlined } from '@ant-design/icons';
import KPICards from './components/KPICards';
import GISMap from './components/GISMap';
import ArchiveOverview from './components/ArchiveOverview';
import DetailCharts from './components/DetailCharts';
import { mockProjects, mockArchiveData } from '../../mocks/dashboardData';

const { Title } = Typography;

export default function Home() {
  const [selectedProject, setSelectedProject] = useState(mockProjects[0]);
  const [kpiData, setKpiData] = useState({
    totalProjects: 0,
    totalArchives: 0,
    ongoingProjects: 0,
    avgCompleteness: 0
  });

  useEffect(() => {
    // 计算KPI数据
    const totalProjects = mockProjects.length;
    const totalArchives = mockProjects.reduce((sum, project) => sum + project.totalArchives, 0);
    const ongoingProjects = mockProjects.filter(p => p.status === '在建中').length;
    const avgCompleteness = Math.round(
      mockProjects.reduce((sum, project) => sum + project.completeness, 0) / totalProjects
    );

    setKpiData({
      totalProjects,
      totalArchives,
      ongoingProjects,
      avgCompleteness
    });
  }, []);

  const handleProjectSelect = (project: typeof mockProjects[0]) => {
    setSelectedProject(project);
  };

  return (
    <PageContainer
      header={{
        title: false,
      }}
      style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh',
        padding: 0,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* 顶部导航 */}
        <Card
          style={{
            borderRadius: 0,
            borderLeft: 'none',
            borderRight: 'none',
            borderTop: 'none',
            marginBottom: 0,
          }}
          styles={{ body: { padding: '16px 24px' } }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space size="middle">
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: '#1890ff',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DashboardOutlined style={{ color: '#fff', fontSize: 18 }} />
              </div>
              <Title level={2} style={{ margin: 0, fontSize: 24, fontWeight: 'bold' }}>
                智能档案管理驾驶舱
              </Title>
            </Space>
            <Space size="middle">
              <span style={{ fontSize: 14, color: '#8c8c8c' }}>
                最后更新: {new Date().toLocaleString('zh-CN')}
              </span>
              <Button type="primary" icon={<ReloadOutlined />}>
                刷新数据
              </Button>
            </Space>
          </div>
        </Card>

        {/* 主要内容区域 */}
        <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 24, minHeight: 0 }}>
          {/* 第一层：KPI卡片区域 */}
          <div style={{ flexShrink: 0 }}>
            <KPICards data={kpiData} />
          </div>

          {/* 第二层：中央核心区域 */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <Row gutter={24} style={{ height: '100%' }}>
              {/* GIS地图 */}
              <Col xs={24} lg={16} style={{ height: '100%', minHeight: 0 }}>
                <GISMap 
                  projects={mockProjects}
                  selectedProject={selectedProject}
                  onProjectSelect={handleProjectSelect}
                />
              </Col>

              {/* 档案完整度概览 */}
              <Col xs={24} lg={8} style={{ height: '100%', minHeight: 0 }}>
                <ArchiveOverview project={selectedProject} />
              </Col>
            </Row>
          </div>

          {/* 第三层：底部详细统计图表 */}
          <div style={{ flexShrink: 0 }}>
            <DetailCharts data={mockArchiveData} projects={mockProjects} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
