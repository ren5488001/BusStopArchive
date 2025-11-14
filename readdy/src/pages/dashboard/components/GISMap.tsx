import { useState } from 'react';

interface Project {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number];
  status: string;
  completeness: number;
  manager: string;
}

interface GISMapProps {
  projects: Project[];
  selectedProject: Project;
  onProjectSelect: (project: Project) => void;
}

export default function GISMap({ projects, selectedProject, onProjectSelect }: GISMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([116.4074, 39.9042]);
  const [zoomLevel, setZoomLevel] = useState(10);

  const getStatusColor = (status: string) => {
    switch (status) {
      case '已竣工': return 'bg-blue-500 border-blue-600';
      case '在建中': return 'bg-green-500 border-green-600';
      case '已暂停': return 'bg-gray-400 border-gray-500';
      default: return 'bg-blue-500 border-blue-600';
    }
  };

  const getCompletenessColor = (completeness: number) => {
    if (completeness >= 90) return 'text-green-600';
    if (completeness >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <i className="ri-map-2-line mr-2 text-blue-600"></i>
            项目地理分布图
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>已竣工</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>在建中</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span>已暂停</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setZoomLevel(prev => Math.min(prev + 1, 18))}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <i className="ri-add-line text-gray-600"></i>
              </button>
              <button 
                onClick={() => setZoomLevel(prev => Math.max(prev - 1, 1))}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <i className="ri-subtract-line text-gray-600"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex-1 min-h-0">
        {/* 地图背景 */}
        <div 
          className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 relative overflow-hidden"
          style={{
            backgroundImage: `url('https://readdy.ai/api/search-image?query=Modern%20city%20map%20view%20with%20clean%20streets%20and%20buildings%2C%20aerial%20perspective%2C%20minimalist%20design%2C%20light%20blue%20and%20green%20color%20scheme%2C%20urban%20planning%20visualization%2C%20geographic%20information%20system%20interface%2C%20professional%20dashboard%20background&width=800&height=600&seq=map001&orientation=landscape')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* 地图控件 */}
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-2 space-y-2">
            <button className="block w-8 h-8 hover:bg-gray-100 rounded flex items-center justify-center">
              <i className="ri-navigation-line text-gray-600"></i>
            </button>
            <button className="block w-8 h-8 hover:bg-gray-100 rounded flex items-center justify-center">
              <i className="ri-fullscreen-line text-gray-600"></i>
            </button>
          </div>

          {/* 项目标记点 */}
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
              style={{
                left: `${20 + (index % 5) * 15}%`,
                top: `${25 + Math.floor(index / 5) * 20}%`
              }}
              onClick={() => onProjectSelect(project)}
            >
              {/* 标记点 */}
              <div className={`w-4 h-4 rounded-full border-2 ${getStatusColor(project.status)} 
                ${selectedProject.id === project.id ? 'ring-4 ring-blue-200 scale-125' : 'hover:scale-110'} 
                transition-all duration-200 shadow-lg`}>
              </div>
              
              {/* 悬浮信息卡片 */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 
                transition-opacity duration-200 pointer-events-none z-10">
                <div className="bg-white rounded-lg shadow-lg p-3 min-w-48 border">
                  <div className="text-sm font-medium text-gray-900 mb-1">{project.name}</div>
                  <div className="text-xs text-gray-600 mb-2">{project.location}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">完整度:</span>
                    <span className={`font-medium ${getCompletenessColor(project.completeness)}`}>
                      {project.completeness}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-gray-500">状态:</span>
                    <span className="font-medium">{project.status}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* 地图图例 */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3">
            <div className="text-xs font-medium text-gray-700 mb-2">图例说明</div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>已竣工项目</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>在建中项目</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span>已暂停项目</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
