import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Modal, Button, Space, Typography, message, Spin } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import './index.less';

const { Text } = Typography;

// 加载高德地图 JS API
const loadAMapScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.AMap) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    // 暂时移除PlaceSearch和AutoComplete插件（等待API Key升级权限）
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&plugin=AMap.Scale,AMap.ToolBar,AMap.InfoWindow,AMap.Geocoder`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('高德地图 JS API 加载失败'));
    document.head.appendChild(script);
  });
};

interface MapPickerProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (lng: number, lat: number) => void;
  defaultCenter?: [number, number];
  defaultPosition?: [number, number];
}

interface SearchResult {
  name: string;
  address: string;
  location: [number, number];
}

/**
 * 地图选点组件（带地址搜索和逆地理编码）
 * 功能：
 * 1. 地址搜索 - 输入关键词搜索地点
 * 2. 地图选点 - 点击地图选择位置
 * 3. 逆地理编码 - 显示选中位置的详细地址
 */
const MapPicker: React.FC<MapPickerProps> = ({
  visible,
  onClose,
  onConfirm,
  defaultCenter = [112.549248, 37.857014], // 默认太原市中心
  defaultPosition,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  // const placeSearchRef = useRef<any>(null); // 暂时禁用搜索功能

  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(
    defaultPosition || null,
  );
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  // const [searchKeyword, setSearchKeyword] = useState<string>(''); // 暂时禁用搜索功能
  // const [searchResults, setSearchResults] = useState<SearchResult[]>([]); // 暂时禁用搜索功能
  // const [searching, setSearching] = useState(false); // 暂时禁用搜索功能
  const [geocoding, setGeocoding] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);

  // 初始化地图
  useEffect(() => {
    if (!visible) return;

    const initMap = async () => {
      try {
        setMapLoading(true);
        console.log('开始初始化地图...');

        // 加载地图脚本
        console.log('加载高德地图API...');
        await loadAMapScript();
        console.log('高德地图API加载成功');

        // 等待容器就绪
        if (!mapContainerRef.current) {
          console.log('等待地图容器就绪...');
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        if (!mapContainerRef.current) {
          console.error('地图容器DOM未找到');
          throw new Error('地图容器未就绪');
        }

        console.log('创建地图实例...');
        // 创建地图实例
        const map = new window.AMap.Map(mapContainerRef.current, {
          center: selectedPosition || defaultCenter,
          zoom: 15,
          resizeEnable: true,
        });

        console.log('地图实例创建成功');
        mapInstanceRef.current = map;

        // 添加比例尺和工具条
        map.addControl(new window.AMap.Scale());
        map.addControl(new window.AMap.ToolBar({ position: 'RT' }));

        // 初始化逆地理编码
        geocoderRef.current = new window.AMap.Geocoder({
          radius: 1000,
        });

        // 暂时禁用地点搜索功能（等待API Key升级权限）
        // window.AMap.plugin(['AMap.PlaceSearch'], () => {
        //   placeSearchRef.current = new window.AMap.PlaceSearch({
        //     pageSize: 10,
        //     pageIndex: 1,
        //     citylimit: false,
        //   });
        //   console.log('地点搜索插件初始化成功');
        // });

        // 如果有默认位置，添加标记并获取地址
        if (selectedPosition) {
          addMarker(selectedPosition);
          getAddress(selectedPosition);
        }

        // 地图点击事件
        map.on('click', handleMapClick);

        setMapLoading(false);
      } catch (err: any) {
        const errorMsg = err.message || '地图初始化失败';
        message.error(errorMsg);
        console.error('地图初始化错误:', err);
        setMapLoading(false);
      }
    };

    // 延迟初始化，确保DOM已渲染
    const timer = setTimeout(() => {
      initMap();
    }, 100);

    // 清理函数
    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [visible]);

  // 添加或更新标记
  const addMarker = (position: [number, number]) => {
    if (!mapInstanceRef.current) return;

    // 移除旧标记
    if (markerRef.current) {
      mapInstanceRef.current.remove(markerRef.current);
    }

    // 创建新标记
    const marker = new window.AMap.Marker({
      position,
      title: '选中位置',
      draggable: true, // 可拖拽
    });

    // 标记拖拽结束事件
    marker.on('dragend', (e: any) => {
      const pos = e.target.getPosition();
      const newPosition: [number, number] = [pos.lng, pos.lat];
      setSelectedPosition(newPosition);
      getAddress(newPosition);
    });

    mapInstanceRef.current.add(marker);
    mapInstanceRef.current.setCenter(position);
    markerRef.current = marker;
  };

  // 地图点击事件处理
  const handleMapClick = useCallback((e: any) => {
    const { lng, lat } = e.lnglat;
    const position: [number, number] = [lng, lat];

    setSelectedPosition(position);
    addMarker(position);
    getAddress(position);
  }, []);

  // 逆地理编码 - 获取地址
  const getAddress = async (position: [number, number]) => {
    if (!geocoderRef.current) return;

    setGeocoding(true);
    try {
      geocoderRef.current.getAddress(position, (status: string, result: any) => {
        setGeocoding(false);
        if (status === 'complete' && result.info === 'OK') {
          const address = result.regeocode.formattedAddress;
          setSelectedAddress(address);
        } else {
          setSelectedAddress('无法获取地址信息');
        }
      });
    } catch (error) {
      setGeocoding(false);
      setSelectedAddress('获取地址失败');
    }
  };

  // 暂时禁用地址搜索功能（等待API Key升级权限）
  // const handleSearch = (value: string) => {
  //   if (!value.trim()) {
  //     setSearchResults([]);
  //     return;
  //   }
  //   if (!placeSearchRef.current) {
  //     message.warning('搜索功能正在初始化，请稍后重试');
  //     return;
  //   }
  //   setSearching(true);
  //   setSearchKeyword(value);
  //   placeSearchRef.current.search(value, (status: string, result: any) => {
  //     setSearching(false);
  //     if (status === 'complete' && result.poiList?.pois?.length > 0) {
  //       const results: SearchResult[] = result.poiList.pois.map((poi: any) => ({
  //         name: poi.name,
  //         address: poi.address || poi.district || poi.adname || '无地址信息',
  //         location: [poi.location.lng, poi.location.lat],
  //       }));
  //       setSearchResults(results);
  //     } else {
  //       setSearchResults([]);
  //       message.info('未找到相关地点');
  //     }
  //   });
  // };

  // const handleSelectSearchResult = (result: SearchResult) => {
  //   setSelectedPosition(result.location);
  //   setSelectedAddress(`${result.name} - ${result.address}`);
  //   addMarker(result.location);
  //   setSearchResults([]);
  //   setSearchKeyword('');
  // };

  // 确认选择
  const handleConfirm = () => {
    if (!selectedPosition) {
      message.warning('请先在地图上选择一个位置');
      return;
    }

    const [lng, lat] = selectedPosition;
    onConfirm(lng, lat);
    handleClose();
  };

  // 关闭弹窗并重置状态
  const handleClose = () => {
    setSelectedPosition(defaultPosition || null);
    setSelectedAddress('');
    // setSearchKeyword(''); // 暂时禁用搜索功能
    // setSearchResults([]); // 暂时禁用搜索功能
    onClose();
  };

  return (
    <Modal
      title="地图选点"
      open={visible}
      onCancel={handleClose}
      width={1000}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          取消
        </Button>,
        <Button key="confirm" type="primary" onClick={handleConfirm}>
          确定
        </Button>,
      ]}
    >
      <div className="map-picker-container">
        {/* 暂时禁用搜索功能（等待API Key升级权限） */}
        {/* <div className="map-search-box">
          <Search
            placeholder="搜索地址或地点（如：太原市迎泽区）"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onSearch={handleSearch}
            loading={searching}
          />
          {searchResults.length > 0 && (
            <div className="search-results">
              <List
                size="small"
                dataSource={searchResults}
                renderItem={(item) => (
                  <List.Item
                    className="search-result-item"
                    onClick={() => handleSelectSearchResult(item)}
                  >
                    <List.Item.Meta
                      avatar={<EnvironmentOutlined style={{ fontSize: '18px', color: '#1890ff' }} />}
                      title={item.name}
                      description={item.address}
                    />
                  </List.Item>
                )}
              />
            </div>
          )}
        </div> */}

        {/* 当前选中位置信息 */}
        <div className="selected-info">
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            {selectedPosition ? (
              <>
                <Space>
                  <EnvironmentOutlined style={{ fontSize: '16px', color: '#52c41a' }} />
                  <Text strong>
                    经度: {selectedPosition[0].toFixed(6)}，纬度: {selectedPosition[1].toFixed(6)}
                  </Text>
                </Space>
                {geocoding ? (
                  <Text type="secondary">
                    <Spin size="small" /> 正在获取地址...
                  </Text>
                ) : (
                  selectedAddress && (
                    <Text type="secondary" style={{ marginLeft: '24px' }}>
                      {selectedAddress}
                    </Text>
                  )
                )}
              </>
            ) : (
              <Text type="secondary">
                <EnvironmentOutlined /> 请在地图上点击选择位置
              </Text>
            )}
          </Space>
        </div>

        {/* 地图容器 */}
        <div className="map-wrapper">
          {mapLoading && (
            <div className="map-loading">
              <Spin size="large" tip="地图加载中..." />
            </div>
          )}
          <div ref={mapContainerRef} className="map-container" />
        </div>

        {/* 使用提示 */}
        <div className="map-tips">
          <Text type="secondary" style={{ fontSize: '12px' }}>
            提示：可以直接点击地图选点，也可以拖动标记调整位置
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default MapPicker;
