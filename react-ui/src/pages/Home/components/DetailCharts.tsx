import { Card, Row, Col, Progress, List, Tag, Space, Empty } from 'antd';
import {
  PieChartOutlined,
  BarChartOutlined,
  LineChartOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

interface ArchiveData {
  archiveTypes: { name: string; count: number; color: string }[];
  phaseArchives: { phase: string; count: number }[];
  monthlyTrend: { month: string; count: number }[];
}

interface Project {
  id: string;
  name: string;
  completeness: number;
  status: string;
}

interface DetailChartsProps {
  data: ArchiveData;
  projects: Project[];
}

export default function DetailCharts({ data, projects }: DetailChartsProps) {
  // 筛选高风险项目（完整度低于70%）
  const highRiskProjects = projects.filter(p => p.completeness < 70);

  // 计算最大值用于柱状图缩放
  const maxPhaseCount = Math.max(...data.phaseArchives.map(p => p.count));
  const maxTrendCount = Math.max(...data.monthlyTrend.map(m => m.count));

  return (
    <Row gutter={[24, 24]}>
      {/* 档案类型分布 - 饼图 */}
      <Col xs={24} sm={12} lg={6} style={{ display: 'flex' }}>
        <Card
          title={
            <Space>
              <PieChartOutlined style={{ color: '#1890ff' }} />
              <span>档案类型分布</span>
            </Space>
          }
          style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
          styles={{
            body: {
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, flexShrink: 0 }}>
            <div style={{ position: 'relative', width: 192, height: 192 }}>
              <svg
                style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}
                viewBox="0 0 200 200"
              >
                {data.archiveTypes.map((type, index) => {
                  const total = data.archiveTypes.reduce((sum, t) => sum + t.count, 0);
                  const percentage = (type.count / total) * 100;
                  const angle = (percentage / 100) * 360;
                  const startAngle = data.archiveTypes.slice(0, index).reduce(
                    (sum, t) => sum + ((t.count / total) * 360),
                    0
                  );

                  const startAngleRad = (startAngle * Math.PI) / 180;
                  const endAngleRad = ((startAngle + angle) * Math.PI) / 180;

                  const largeArcFlag = angle > 180 ? 1 : 0;
                  const x1 = 100 + 80 * Math.cos(startAngleRad);
                  const y1 = 100 + 80 * Math.sin(startAngleRad);
                  const x2 = 100 + 80 * Math.cos(endAngleRad);
                  const y2 = 100 + 80 * Math.sin(endAngleRad);

                  const pathData = [
                    `M 100 100`,
                    `L ${x1} ${y1}`,
                    `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    'Z',
                  ].join(' ');

                  return (
                    <path
                      key={index}
                      d={pathData}
                      fill={type.color}
                      style={{ transition: 'opacity 0.2s', cursor: 'pointer' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    />
                  );
                })}
              </svg>
            </div>
          </div>

          <Space direction="vertical" size="small" style={{ width: '100%', flex: 1 }}>
            {data.archiveTypes.map((type, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 14,
                }}
              >
                <Space size="small">
                  <span
                    style={{
                      display: 'inline-block',
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: type.color,
                    }}
                  />
                  <span>{type.name}</span>
                </Space>
                <span style={{ fontWeight: 500 }}>{type.count}</span>
              </div>
            ))}
          </Space>
        </Card>
      </Col>

      {/* 按阶段归档数量 - 柱状图 */}
      <Col xs={24} sm={12} lg={6} style={{ display: 'flex' }}>
        <Card
          title={
            <Space>
              <BarChartOutlined style={{ color: '#52c41a' }} />
              <span>按阶段归档数量</span>
            </Space>
          }
          style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
          styles={{
            body: {
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%', flex: 1 }}>
            {data.phaseArchives.map((phase, index) => (
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
                  <span style={{ fontWeight: 500, color: '#262626' }}>{phase.phase}</span>
                  <span style={{ fontWeight: 600, color: '#262626' }}>{phase.count}</span>
                </div>
                <Progress
                  percent={(phase.count / maxPhaseCount) * 100}
                  strokeColor="#52c41a"
                  showInfo={false}
                  size="small"
                />
              </div>
            ))}
          </Space>
        </Card>
      </Col>

      {/* 近半年档案新增趋势 - 折线图 */}
      <Col xs={24} sm={12} lg={6} style={{ display: 'flex' }}>
        <Card
          title={
            <Space>
              <LineChartOutlined style={{ color: '#722ed1' }} />
              <span>近半年新增趋势</span>
            </Space>
          }
          style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
          styles={{
            body: {
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          <div style={{ position: 'relative', height: 160, marginBottom: 8, flexShrink: 0 }}>
            <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 300 120">
              {/* 网格线 */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1="0"
                  y1={i * 24}
                  x2="300"
                  y2={i * 24}
                  stroke="#f0f0f0"
                  strokeWidth="1"
                />
              ))}

              {/* 折线 */}
              <polyline
                fill="none"
                stroke="#722ed1"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={data.monthlyTrend
                  .map(
                    (item, index) =>
                      `${(index * 50) + 25},${120 - (item.count / maxTrendCount) * 100}`
                  )
                  .join(' ')}
              />

              {/* 数据点 */}
              {data.monthlyTrend.map((item, index) => (
                <circle
                  key={index}
                  cx={(index * 50) + 25}
                  cy={120 - (item.count / maxTrendCount) * 100}
                  r="4"
                  fill="#722ed1"
                  style={{ transition: 'r 0.2s', cursor: 'pointer' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.setAttribute('r', '6');
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.setAttribute('r', '4');
                  }}
                />
              ))}
            </svg>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 12,
              color: '#8c8c8c',
              flexShrink: 0,
            }}
          >
            {data.monthlyTrend.map((item, index) => (
              <span key={index}>{item.month}</span>
            ))}
          </div>
        </Card>
      </Col>

      {/* 高风险项目清单 */}
      <Col xs={24} sm={12} lg={6} style={{ display: 'flex' }}>
        <Card
          title={
            <Space>
              <WarningOutlined style={{ color: '#ff4d4f' }} />
              <span>高风险项目清单</span>
            </Space>
          }
          style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
          styles={{
            body: {
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {highRiskProjects.length > 0 ? (
              <List
                dataSource={highRiskProjects.slice(0, 5)}
                renderItem={(project, index) => (
                <List.Item
                  style={{
                    background: '#fff1f0',
                    border: '1px solid #ffccc7',
                    borderRadius: 8,
                    marginBottom: 12,
                    padding: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#262626',
                        marginBottom: 4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {project.name}
                    </div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>状态: {project.status}</div>
                  </div>
                  <div style={{ textAlign: 'right', marginLeft: 12 }}>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#ff4d4f',
                      }}
                    >
                      {project.completeness}%
                    </div>
                    <div style={{ fontSize: 12, color: '#ff4d4f' }}>完整度</div>
                  </div>
                </List.Item>
              )}
            />
          ) : (
              <Empty
                image={<CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />}
                description={<span style={{ fontSize: 14, color: '#8c8c8c' }}>暂无高风险项目</span>}
                style={{ padding: '32px 0', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              />
            )}
            {highRiskProjects.length > 5 && (
              <Button type="link" block style={{ marginTop: 8, flexShrink: 0 }}>
                查看全部 {highRiskProjects.length} 个高风险项目
              </Button>
            )}
          </div>
        </Card>
      </Col>
    </Row>
  );
}
