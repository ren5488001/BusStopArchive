import React from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Row, Col, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, UserOutlined, ProjectOutlined } from '@ant-design/icons';

export default function Dashboard() {
  return (
    <PageContainer title="领导驾驶舱">
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={1128}
              prefix={<UserOutlined />}
              suffix="人"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="项目总数"
              value={93}
              prefix={<ProjectOutlined />}
              suffix="个"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本周增长"
              value={11.28}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ArrowUpOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本周下降"
              value={9.3}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ArrowDownOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>
      <Card title="数据概览" style={{ marginTop: 16 }}>
        <p>这是领导驾驶舱页面，用于展示系统关键数据和指标。</p>
      </Card>
    </PageContainer>
  );
}
