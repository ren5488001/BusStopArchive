import React from 'react';
import { Card, Space, Button, message } from 'antd';
import AMapComponent, { MarkerData } from './index';

/**
 * 高德地图组件使用示例
 */
const AMapDemo: React.FC = () => {
  // 示例标记点数据
  const markers: MarkerData[] = [
    {
      id: 1,
      position: [116.397428, 39.90923],
      title: '天安门',
      content: '<div style="padding: 10px;"><h3>天安门</h3><p>北京市中心</p></div>',
    },
    {
      id: 2,
      position: [116.404, 39.915],
      title: '故宫',
      content: '<div style="padding: 10px;"><h3>故宫博物院</h3><p>中国明清两代的皇家宫殿</p></div>',
    },
    {
      id: 3,
      position: [116.391, 39.906],
      title: '北京站',
      content: '<div style="padding: 10px;"><h3>北京站</h3><p>北京重要的交通枢纽</p></div>',
    },
  ];

  // 地图点击事件
  const handleMapClick = (e: any) => {
    const { lng, lat } = e.lnglat;
    message.info(`点击位置: 经度 ${lng.toFixed(6)}, 纬度 ${lat.toFixed(6)}`);
  };

  // 标记点击事件
  const handleMarkerClick = (marker: MarkerData, e: any) => {
    message.success(`点击了标记: ${marker.title}`);
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="基础地图示例">
          <AMapComponent
            center={[116.397428, 39.90923]}
            zoom={13}
            height={400}
            showScale
            showToolBar
          />
        </Card>

        <Card title="带标记点的地图">
          <AMapComponent
            center={[116.397428, 39.90923]}
            zoom={13}
            markers={markers}
            height={500}
            onClick={handleMapClick}
            onMarkerClick={handleMarkerClick}
          />
        </Card>

        <Card title="不同样式的地图">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <h4>标准样式</h4>
              <AMapComponent
                center={[116.397428, 39.90923]}
                zoom={12}
                mapStyle="normal"
                height={300}
              />
            </div>
            <div>
              <h4>暗色样式</h4>
              <AMapComponent
                center={[116.397428, 39.90923]}
                zoom={12}
                mapStyle="dark"
                height={300}
              />
            </div>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default AMapDemo;
