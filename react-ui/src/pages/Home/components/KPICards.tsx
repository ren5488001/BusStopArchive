import { Card, Row, Col, Statistic, Tag, Space } from 'antd';
import {
  BuildOutlined,
  FileTextOutlined,
  ToolOutlined,
  PieChartOutlined,
  WarningOutlined,
} from '@ant-design/icons';

interface KPIData {
  totalProjects: number;
  totalArchives: number;
  ongoingProjects: number;
  avgCompleteness: number;
}

interface KPICardsProps {
  data: KPIData;
}

export default function KPICards({ data }: KPICardsProps) {
  const cards = [
    {
      title: '项目总数',
      value: data.totalProjects,
      unit: '个',
      icon: <BuildOutlined />,
      color: '#1890ff',
      bgColor: '#e6f7ff',
      textColor: '#1890ff',
    },
    {
      title: '档案总量',
      value: data.totalArchives,
      unit: '份',
      icon: <FileTextOutlined />,
      color: '#52c41a',
      bgColor: '#f6ffed',
      textColor: '#52c41a',
    },
    {
      title: '在建中项目',
      value: data.ongoingProjects,
      unit: '个',
      icon: <ToolOutlined />,
      color: '#faad14',
      bgColor: '#fffbe6',
      textColor: '#faad14',
      highlight: true,
    },
    {
      title: '平均档案完整度',
      value: data.avgCompleteness,
      unit: '%',
      icon: <PieChartOutlined />,
      color: data.avgCompleteness >= 90 ? '#52c41a' : data.avgCompleteness >= 70 ? '#faad14' : '#ff4d4f',
      bgColor: data.avgCompleteness >= 90 ? '#f6ffed' : data.avgCompleteness >= 70 ? '#fffbe6' : '#fff1f0',
      textColor: data.avgCompleteness >= 90 ? '#52c41a' : data.avgCompleteness >= 70 ? '#faad14' : '#ff4d4f',
      warning: data.avgCompleteness < 90,
    }
  ];

  return (
    <Row gutter={[24, 24]}>
      {cards.map((card, index) => (
        <Col xs={24} sm={12} lg={6} key={index} style={{ display: 'flex' }}>
          <Card
            style={{
              background: card.bgColor,
              borderColor: card.highlight ? '#faad14' : card.warning ? '#ff4d4f' : '#d9d9d9',
              borderWidth: card.highlight || card.warning ? 2 : 1,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
            styles={{
              body: {
                padding: 24,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
              },
            }}
            hoverable
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flex: 1 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: '#8c8c8c', marginBottom: 8, fontWeight: 500 }}>
                  {card.title}
                </div>
                <Statistic
                  value={card.value}
                  suffix={card.unit}
                  valueStyle={{
                    color: card.textColor,
                    fontSize: 32,
                    fontWeight: 'bold',
                  }}
                />
                {card.warning && (
                  <Space style={{ marginTop: 8 }}>
                    <WarningOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />
                    <span style={{ fontSize: 12, color: '#ff4d4f' }}>低于预警值</span>
                  </Space>
                )}
              </div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  background: card.color,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <div style={{ color: '#fff', fontSize: 20 }}>
                  {card.icon}
                </div>
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
