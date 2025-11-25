import { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Button, Space, Typography, message, Row, Col } from 'antd';
import { DashboardOutlined, ReloadOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import KPICards from './components/KPICards';
import DetailCharts from './components/DetailCharts';
import ProjectMapCard from './components/ProjectMapCard';
import AMapComponent, { MarkerData } from '@/components/AMapComponent';
import { getDashboardOverview } from '@/services/system/dashboard';
import { getProjectList, getProjectStages, type ProjectType, type ProjectStageType } from '@/services/bams/project';

const { Title } = Typography;

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [kpiData, setKpiData] = useState({
    totalProjects: 0,
    totalArchives: 0,
    ongoingProjects: 0,
    avgCompleteness: 0
  });
  const [archiveData, setArchiveData] = useState({
    archiveTypeDistribution: [],
    archiveByStage: [],
    monthlyTrend: [],
  });
  const [completenessDistribution, setCompletenessDistribution] = useState([]);
  const [mapMarkers, setMapMarkers] = useState<MarkerData[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // 加载驾驶舱数据
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await getDashboardOverview();
      if (response.code === 200) {
        const { kpi, archiveTypeDistribution, archiveByStage, monthlyTrend, completenessDistribution } = response.data;
        setKpiData(kpi);
        setArchiveData({
          archiveTypeDistribution,
          archiveByStage,
          monthlyTrend,
        });
        setCompletenessDistribution(completenessDistribution);
      } else {
        message.error(response.msg || '加载数据失败');
      }
    } catch (error) {
      message.error('加载驾驶舱数据失败');
      console.error('加载驾驶舱数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    loadProjectMapData();
  }, []);

  // 根据项目状态生成标记点颜色
  const getMarkerColor = (status?: string) => {
    switch (status) {
      case '1': // 在建中
        return '#52c41a';
      case '2': // 已竣工
        return '#1890ff';
      case '3': // 已暂停
        return '#8c8c8c';
      default:
        return '#1890ff';
    }
  };

  // 获取状态显示文本
  const getStatusText = (status?: string) => {
    switch (status) {
      case '1':
        return '在建中';
      case '2':
        return '已竣工';
      case '3':
        return '已暂停';
      default:
        return '未知';
    }
  };

  // 创建自定义标记点图标 HTML
  const createMarkerIcon = (color: string) => {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg width="32" height="40" xmlns="http://www.w3.org/2000/svg">
        <g>
          <!-- 阴影 -->
          <ellipse cx="16" cy="37" rx="8" ry="3" fill="rgba(0,0,0,0.2)"/>
          <!-- 主体 -->
          <path d="M16 2 C 9 2 4 7 4 14 C 4 23 16 38 16 38 C 16 38 28 23 28 14 C 28 7 23 2 16 2 Z"
                fill="${color}" stroke="#fff" stroke-width="2"/>
          <!-- 内圆 -->
          <circle cx="16" cy="14" r="6" fill="#fff"/>
        </g>
      </svg>
    `)}`;
  };

  // 获取阶段进度条颜色
  const getPhaseColor = (percentage: number) => {
    if (percentage === 100) return '#52c41a';
    if (percentage >= 50) return '#faad14';
    if (percentage > 0) return '#d9d9d9';
    return '#d9d9d9';
  };

  // 从后端加载项目地图数据
  const loadProjectMapData = async () => {
    try {
      // 获取所有项目列表（不分页，获取全部）
      const response = await getProjectList({ pageNum: 1, pageSize: 1000 });

      if (response.code === 200 && response.rows) {
        const projects = response.rows;

        // 过滤出有经纬度的项目
        const projectsWithLocation = projects.filter(
          (p: ProjectType) => p.latitude && p.longitude
        );

        if (projectsWithLocation.length === 0) {
          message.warning('暂无项目位置数据');
          return;
        }

        // 为每个项目加载阶段信息
        const projectsWithStages = await Promise.all(
          projectsWithLocation.map(async (project: ProjectType) => {
            try {
              const stageResponse = await getProjectStages(project.projectId!);
              const stages = stageResponse.code === 200 ? stageResponse.data || [] : [];

              // 调试输出：查看原始数据
              console.log(`=== 项目数据 [${project.projectName}] ===`);
              console.log('项目完整度（原始）:', project.completenessRate);
              console.log('总要求文件数:', project.totalRequiredFiles);
              console.log('实际归档文件数:', project.actualArchivedFiles);
              console.log('阶段数据（原始）:', stages);

              // 转换阶段数据格式
              const phases = stages.map((stage: ProjectStageType) => {
                // 检查 completenessRate 是否是 0-1 之间的小数，如果是则转换为百分比
                const percentage = (stage.completenessRate || 0) <= 1 && (stage.completenessRate || 0) > 0
                  ? Math.round((stage.completenessRate || 0) * 100)
                  : Math.round(stage.completenessRate || 0);

                console.log(`  阶段 [${stage.stageDisplayName}]:`, {
                  原始完整度: stage.completenessRate,
                  转换后百分比: percentage,
                  已归档: stage.archivedFileCount,
                  要求总数: stage.requiredFileCount,
                  计算百分比: stage.requiredFileCount ? Math.round((stage.archivedFileCount || 0) / stage.requiredFileCount * 100) : 0
                });

                return {
                  name: stage.stageDisplayName,
                  completed: stage.archivedFileCount || 0,
                  total: stage.requiredFileCount || 0,
                  percentage,
                  color: getPhaseColor(percentage),
                };
              });

              // 处理项目总体完整度（检查是否是 0-1 的小数）
              const projectCompleteness = (project.completenessRate || 0) <= 1 && (project.completenessRate || 0) > 0
                ? Math.round((project.completenessRate || 0) * 100)
                : Math.round(project.completenessRate || 0);

              console.log('项目总体完整度（转换后）:', projectCompleteness);
              console.log('===========================\n');

              return {
                id: project.projectId!,
                name: project.projectName,
                address: project.projectDesc || '暂无地址信息',
                manager: project.projectManager || '未指定',
                status: getStatusText(project.status),
                statusColor: getMarkerColor(project.status),
                completeness: projectCompleteness,
                phases,
                rawProject: project,
              };
            } catch (error) {
              console.error(`加载项目 ${project.projectId} 的阶段信息失败:`, error);
              return {
                id: project.projectId!,
                name: project.projectName,
                address: project.projectDesc || '暂无地址信息',
                manager: project.projectManager || '未指定',
                status: getStatusText(project.status),
                statusColor: getMarkerColor(project.status),
                completeness: Math.round(project.completenessRate || 0),
                phases: [],
                rawProject: project,
              };
            }
          })
        );

        // 转换为地图标记点
        const markers = projectsWithStages.map((projectData: any) => ({
          id: projectData.id,
          projectId: projectData.id,
          projectData,
          position: [projectData.rawProject.longitude, projectData.rawProject.latitude],
          title: projectData.name,
          icon: createMarkerIcon(projectData.statusColor),
          anchor: 'bottom-center',
        }));

        setMapMarkers(markers as any);

        // 默认选中第一个项目
        if (projectsWithStages.length > 0) {
          setSelectedProject(projectsWithStages[0]);
        }
      } else {
        message.error(response.msg || '加载项目数据失败');
      }
    } catch (error) {
      console.error('加载项目地图数据失败:', error);
      message.error('加载项目地图数据失败');
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
    loadProjectMapData();
  };

  // 处理地图标记点击事件
  const handleMarkerClick = (marker: any) => {
    if (marker.projectData) {
      setSelectedProject(marker.projectData);
    }
  };

  // 查看项目详情（跳转到项目详情页面）
  const handleViewDetail = () => {
    if (selectedProject && selectedProject.id) {
      // 跳转到项目详情页面
      history.push(`/project/detail/${selectedProject.id}`);
    }
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
              <Button type="primary" icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                刷新数据
              </Button>
            </Space>
          </div>
        </Card>

        {/* 主要内容区域 */}
        <div style={{ flex: 1, padding: '24px 0', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* KPI卡片区域 */}
          <div style={{ paddingLeft: 24, paddingRight: 24 }}>
            <KPICards data={kpiData} />
          </div>

          {/* 地图区域 - 左右分栏布局 */}
          <div style={{ paddingLeft: 24, paddingRight: 24 }}>
            <Row gutter={[24, 24]} style={{ minHeight: 664 }}>
              {/* 左侧：地图 */}
              <Col xs={24} lg={18} style={{ display: 'flex' }}>
                <Card
                  title={
                    <Space>
                      <EnvironmentOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />
                      <span style={{ fontSize: 16, fontWeight: 600 }}>项目地理分布图</span>
                    </Space>
                  }
                  extra={
                    <Space>
                      <Space size="small">
                        <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: '#1890ff' }} />
                        <span style={{ fontSize: 14, color: '#8c8c8c' }}>已竣工</span>
                      </Space>
                      <Space size="small">
                        <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: '#52c41a' }} />
                        <span style={{ fontSize: 14, color: '#8c8c8c' }}>在建中</span>
                      </Space>
                      <Space size="small">
                        <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: '#8c8c8c' }} />
                        <span style={{ fontSize: 14, color: '#8c8c8c' }}>已暂停</span>
                      </Space>
                    </Space>
                  }
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', flex: 1, display: 'flex', flexDirection: 'column' }}
                  styles={{ body: { padding: 0, flex: 1, position: 'relative' } }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <AMapComponent
                      center={[112.549248, 37.857014]}
                      zoom={13}
                      markers={mapMarkers}
                      height="100%"
                      showScale
                      showToolBar
                      onMarkerClick={handleMarkerClick}
                    />
                  </div>
                </Card>
              </Col>

              {/* 右侧：项目详情卡片 */}
              <Col xs={24} lg={6} style={{ display: 'flex' }}>
                <ProjectMapCard
                  project={selectedProject}
                  onViewDetail={handleViewDetail}
                />
              </Col>
            </Row>
          </div>

          {/* 统计图表区域 */}
          <div style={{ paddingLeft: 24, paddingRight: 24 }}>
            <DetailCharts
              data={archiveData}
              completenessData={completenessDistribution}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
