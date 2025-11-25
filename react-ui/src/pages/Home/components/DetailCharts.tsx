import { Card, Row, Col, Progress, Space } from 'antd';
import {
  PieChartOutlined,
  BarChartOutlined,
  LineChartOutlined,
} from '@ant-design/icons';

interface ArchiveData {
  archiveTypeDistribution: { name: string; count: number }[];
  archiveByStage: { stage: string; count: number }[];
  monthlyTrend: { month: string; count: number }[];
}

interface CompletenessItem {
  name: string;
  count: number;
  color: string;
}

interface DetailChartsProps {
  data: ArchiveData;
  completenessData: CompletenessItem[];
}

export default function DetailCharts({ data, completenessData }: DetailChartsProps) {

  // 计算最大值用于柱状图缩放，添加空数组保护
  const maxPhaseCount = data.archiveByStage?.length > 0
    ? Math.max(...data.archiveByStage.map(p => p.count))
    : 1;
  const maxTrendCount = data.monthlyTrend?.length > 0
    ? Math.max(...data.monthlyTrend.map(m => m.count))
    : 1;

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
                {(() => {
                  // 只显示有数据的分类
                  const validData = data.archiveTypeDistribution.filter(t => t.count > 0);
                  const total = validData.reduce((sum, t) => sum + t.count, 0);

                  if (total === 0) {
                    // 如果没有数据，显示灰色圆环
                    return (
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="#f0f0f0"
                      />
                    );
                  }

                  return validData.map((type, index) => {
                    const percentage = (type.count / total) * 100;
                    const angle = (percentage / 100) * 360;
                    const startAngle = validData.slice(0, index).reduce(
                      (sum, t) => sum + ((t.count / total) * 360),
                      0
                    );

                    const startAngleRad = (startAngle * Math.PI) / 180;
                    const endAngleRad = ((startAngle + angle) * Math.PI) / 180;

                    // 定义颜色数组
                    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'];
                    const color = colors[data.archiveTypeDistribution.indexOf(type) % colors.length];

                    // 如果是100%，绘制完整的圆
                    if (percentage >= 99.9) {
                      return (
                        <circle
                          key={index}
                          cx="100"
                          cy="100"
                          r="80"
                          fill={color}
                          style={{ transition: 'opacity 0.2s', cursor: 'pointer' }}
                        />
                      );
                    }

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
                        fill={color}
                        style={{ transition: 'opacity 0.2s', cursor: 'pointer' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.8';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                      />
                    );
                  });
                })()}
              </svg>
            </div>
          </div>

          <Space direction="vertical" size="small" style={{ width: '100%', flex: 1 }}>
            {data.archiveTypeDistribution.map((type, index) => {
              const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'];
              const color = colors[index % colors.length];
              return (
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
                        background: color,
                      }}
                    />
                    <span>{type.name}</span>
                  </Space>
                  <span style={{ fontWeight: 500 }}>{type.count}</span>
                </div>
              );
            })}
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
            {data.archiveByStage.map((phase, index) => (
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
                  <span style={{ fontWeight: 500, color: '#262626' }}>{phase.stage}</span>
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

      {/* 项目完成度分布 */}
      <Col xs={24} sm={12} lg={6} style={{ display: 'flex' }}>
        <Card
          title={
            <Space>
              <PieChartOutlined style={{ color: '#1890ff' }} />
              <span>项目完成度分布</span>
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
          <Space direction="vertical" size="large" style={{ width: '100%', flex: 1 }}>
            {(completenessData || []).map((item, index) => {
              const total = (completenessData || []).reduce((sum, d) => sum + d.count, 0);
              const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;

              return (
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
                    <Space size="small">
                      <span
                        style={{
                          display: 'inline-block',
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          background: item.color,
                        }}
                      />
                      <span style={{ fontWeight: 500, color: '#262626' }}>{item.name}</span>
                    </Space>
                    <span style={{ fontWeight: 600, color: '#262626' }}>{item.count} 个</span>
                  </div>
                  <Progress
                    percent={percentage}
                    strokeColor={item.color}
                    showInfo={true}
                    format={(percent) => `${percent}%`}
                    size="small"
                  />
                </div>
              );
            })}
          </Space>
        </Card>
      </Col>
    </Row>
  );
}
