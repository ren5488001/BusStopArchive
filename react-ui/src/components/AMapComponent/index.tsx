import React, { useEffect, useRef, useState } from 'react';
import { Spin } from 'antd';
import './index.less';

// 加载高德地图 JS API
const loadAMapScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.AMap) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&plugin=AMap.Scale,AMap.ToolBar,AMap.InfoWindow,AMap.PlaceSearch,AMap.Geocoder,AMap.AutoComplete`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('高德地图 JS API 加载失败'));
    document.head.appendChild(script);
  });
};

// 标记点数据类型
export interface MarkerData {
  id?: string | number;
  position: [number, number]; // [经度, 维度]
  title?: string;
  content?: string | React.ReactNode;
  icon?: string;
  offset?: [number, number];
  anchor?: string;
}

interface AMapComponentProps {
  center?: [number, number]; // 地图中心点 [经度, 维度]
  zoom?: number; // 缩放级别 3-20
  markers?: MarkerData[]; // 标记点数组
  showScale?: boolean; // 是否显示比例尺
  showToolBar?: boolean; // 是否显示工具条
  mapStyle?: string; // 地图样式
  height?: string | number; // 地图容器高度
  onClick?: (e: any) => void; // 地图点击事件
  onMarkerClick?: (marker: MarkerData, e: any) => void; // 标记点击事件
}

const AMapComponent: React.FC<AMapComponentProps> = ({
  center = [112.549248, 37.857014], // 默认太原市中心
  zoom = 13,
  markers = [],
  showScale = true,
  showToolBar = true,
  mapStyle = 'normal',
  height = 500,
  onClick,
  onMarkerClick,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // 初始化地图
  useEffect(() => {
    const initMap = async () => {
      try {
        setLoading(true);
        await loadAMapScript();

        if (!mapContainerRef.current) return;

        // 创建地图实例
        const map = new window.AMap.Map(mapContainerRef.current, {
          center,
          zoom,
          mapStyle: `amap://styles/${mapStyle}`,
          resizeEnable: true,
          // 隐藏默认的POI（兴趣点），只显示项目标记点
          features: ['bg', 'road', 'building'], // 只显示背景、道路、建筑物，不显示POI
          showIndoorMap: false, // 不显示室内地图
        });

        mapInstanceRef.current = map;

        // 添加比例尺
        if (showScale) {
          map.addControl(new window.AMap.Scale());
        }

        // 添加工具条
        if (showToolBar) {
          map.addControl(new window.AMap.ToolBar({
            position: 'RT',
          }));
        }

        // 地图点击事件
        if (onClick) {
          map.on('click', onClick);
        }

        setLoading(false);
      } catch (err) {
        setError('地图初始化失败');
        setLoading(false);
        console.error(err);
      }
    };

    initMap();

    // 清理函数
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 更新地图中心和缩放
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(center);
      mapInstanceRef.current.setZoom(zoom);
    }
  }, [center, zoom]);

  // 更新标记点
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // 清除旧标记
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.remove(marker);
    });
    markersRef.current = [];

    // 添加新标记
    const newMarkers = markers.map(markerData => {
      const markerOptions: any = {
        position: markerData.position,
        title: markerData.title || '',
      };

      if (markerData.icon) {
        markerOptions.icon = markerData.icon;
      }

      if (markerData.offset) {
        markerOptions.offset = new window.AMap.Pixel(markerData.offset[0], markerData.offset[1]);
      }

      if (markerData.anchor) {
        markerOptions.anchor = markerData.anchor;
      }

      const marker = new window.AMap.Marker(markerOptions);

      // 标记点击事件
      if (onMarkerClick) {
        marker.on('click', (e: any) => {
          onMarkerClick(markerData, e);
        });
      }

      // 如果有内容，添加信息窗体
      if (markerData.content) {
        marker.on('click', () => {
          const infoWindow = new window.AMap.InfoWindow({
            content: typeof markerData.content === 'string'
              ? markerData.content
              : `<div id="info-window-${markerData.id}"></div>`,
            offset: new window.AMap.Pixel(0, -30),
          });
          infoWindow.open(mapInstanceRef.current, markerData.position);

          // 如果是 React 组件，需要在信息窗口打开后渲染
          if (typeof markerData.content !== 'string' && markerData.id) {
            setTimeout(() => {
              const container = document.getElementById(`info-window-${markerData.id}`);
              if (container) {
                // 这里可以使用 ReactDOM.render 渲染 React 组件
                container.innerHTML = String(markerData.content);
              }
            }, 0);
          }
        });
      }

      mapInstanceRef.current.add(marker);
      return marker;
    });

    markersRef.current = newMarkers;

    // 如果有标记点，自动调整视野
    if (newMarkers.length > 0) {
      mapInstanceRef.current.setFitView();
    }
  }, [markers, onMarkerClick]);

  const containerHeight = typeof height === 'number' ? `${height}px` : height;

  if (error) {
    return <div className="amap-error">{error}</div>;
  }

  return (
    <div className="amap-container" style={{ height: containerHeight, position: 'relative' }}>
      {loading && (
        <div className="amap-loading">
          <Spin size="large" tip="地图加载中..." />
        </div>
      )}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default AMapComponent;
