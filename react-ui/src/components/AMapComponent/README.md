# AMapComponent - 高德地图组件

基于高德地图 JS API 2.0 封装的 React 地图组件，支持地图展示、标记点、信息窗口等功能。

## 功能特性

- ✅ 基础地图展示
- ✅ 自定义中心点和缩放级别
- ✅ 标记点（Marker）支持
- ✅ 信息窗口（InfoWindow）
- ✅ 地图点击事件
- ✅ 标记点击事件
- ✅ 比例尺和工具条
- ✅ 多种地图样式
- ✅ 自动适配视野

## 快速开始

### 基础用法

```tsx
import AMapComponent from '@/components/AMapComponent';

const MyPage = () => {
  return (
    <AMapComponent
      center={[116.397428, 39.90923]}
      zoom={13}
      height={500}
    />
  );
};
```

### 添加标记点

```tsx
import AMapComponent, { MarkerData } from '@/components/AMapComponent';

const MyPage = () => {
  const markers: MarkerData[] = [
    {
      id: 1,
      position: [116.397428, 39.90923],
      title: '天安门',
      content: '<div><h3>天安门</h3><p>北京市中心</p></div>',
    },
    {
      id: 2,
      position: [116.404, 39.915],
      title: '故宫',
      content: '<div><h3>故宫</h3><p>明清皇宫</p></div>',
    },
  ];

  return (
    <AMapComponent
      center={[116.397428, 39.90923]}
      zoom={13}
      markers={markers}
      height={500}
    />
  );
};
```

### 监听事件

```tsx
import AMapComponent, { MarkerData } from '@/components/AMapComponent';
import { message } from 'antd';

const MyPage = () => {
  const handleMapClick = (e: any) => {
    const { lng, lat } = e.lnglat;
    message.info(`点击位置: ${lng}, ${lat}`);
  };

  const handleMarkerClick = (marker: MarkerData, e: any) => {
    message.success(`点击了: ${marker.title}`);
  };

  return (
    <AMapComponent
      center={[116.397428, 39.90923]}
      zoom={13}
      markers={[/* ... */]}
      onClick={handleMapClick}
      onMarkerClick={handleMarkerClick}
      height={500}
    />
  );
};
```

## API 文档

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| center | 地图中心点坐标 [经度, 纬度] | `[number, number]` | `[116.397428, 39.90923]` |
| zoom | 地图缩放级别 (3-20) | `number` | `13` |
| markers | 标记点数组 | `MarkerData[]` | `[]` |
| showScale | 是否显示比例尺 | `boolean` | `true` |
| showToolBar | 是否显示工具条 | `boolean` | `true` |
| mapStyle | 地图样式 | `string` | `'normal'` |
| height | 地图容器高度 | `string \| number` | `500` |
| onClick | 地图点击事件 | `(e: any) => void` | - |
| onMarkerClick | 标记点击事件 | `(marker: MarkerData, e: any) => void` | - |

### MarkerData 类型

```typescript
interface MarkerData {
  id?: string | number;           // 标记唯一标识
  position: [number, number];     // 标记位置 [经度, 纬度]
  title?: string;                 // 标记标题
  content?: string | ReactNode;   // 信息窗口内容（支持 HTML 字符串）
  icon?: string;                  // 自定义图标 URL
  offset?: [number, number];      // 图标偏移量
  anchor?: string;                // 图标锚点
}
```

### 地图样式 (mapStyle)

高德地图支持多种预设样式：

- `normal` - 标准样式
- `dark` - 暗色样式
- `light` - 月光银样式
- `whitesmoke` - 远山黛样式
- `fresh` - 草色青样式
- `grey` - 雅士灰样式
- `graffiti` - 涂鸦样式
- `macaron` - 马卡龙样式
- `blue` - 靛青蓝样式
- `darkblue` - 极夜蓝样式
- `wine` - 酱籽样式

## 使用场景

### 公交站点地图

```tsx
const BusStopMap = () => {
  const busStops = [
    {
      id: 'stop1',
      position: [116.397, 39.909],
      title: '公交站点 A',
      content: `
        <div style="padding: 10px;">
          <h3>公交站点 A</h3>
          <p>线路: 1路, 2路, 3路</p>
          <p>首末班: 05:00 - 23:00</p>
        </div>
      `,
    },
    // 更多站点...
  ];

  return (
    <AMapComponent
      markers={busStops}
      zoom={14}
      height={600}
    />
  );
};
```

### 动态更新标记点

```tsx
const DynamicMap = () => {
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  const addMarker = (lng: number, lat: number) => {
    setMarkers([
      ...markers,
      {
        id: Date.now(),
        position: [lng, lat],
        title: '新标记',
      },
    ]);
  };

  return (
    <AMapComponent
      markers={markers}
      onClick={(e) => {
        const { lng, lat } = e.lnglat;
        addMarker(lng, lat);
      }}
      height={500}
    />
  );
};
```

## 注意事项

1. **API Key**: 组件使用全局配置的 `AMAP_KEY`，已在 `config/config.ts` 中配置
2. **首次加载**: 地图 JS API 会在首次使用时从 CDN 加载，可能需要等待几秒
3. **自适应视野**: 当有多个标记点时，地图会自动调整视野以显示所有标记
4. **性能优化**: 大量标记点时建议使用高德的海量点图层（未实现，可扩展）
5. **React 组件内容**: 信息窗口目前仅支持 HTML 字符串，不支持直接渲染 React 组件

## 扩展功能

如需更多功能，可以扩展组件支持：

- 路径规划和导航
- 地理编码（地址转坐标）
- POI 搜索
- 定位功能
- 轨迹回放
- 区域绘制（圆形、多边形、矩形）
- 热力图
- 海量点图层

## 参考文档

- [高德地图 JS API 2.0 文档](https://lbs.amap.com/api/javascript-api/summary)
- [高德开放平台控制台](https://console.amap.com/)
