
interface Project {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number];
  status: string;
  completeness: number;
  manager: string;
  phases: {
    name: string;
    completeness: number;
    total: number;
    completed: number;
  }[];
}

interface ArchiveOverviewProps {
  project: Project;
}

export default function ArchiveOverview({ project }: ArchiveOverviewProps) {
  const getCompletenessColor = (completeness: number) => {
    if (completeness >= 90) return 'text-green-600';
    if (completeness >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (completeness: number) => {
    if (completeness >= 90) return 'bg-green-500';
    if (completeness >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressBgColor = (completeness: number) => {
    if (completeness >= 90) return 'bg-green-100';
    if (completeness >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  // 计算环形进度条的路径
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (project.completeness / 100) * circumference;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <i className="ri-file-chart-line mr-2 text-blue-600"></i>
          档案完整度概览
        </h3>
      </div>

      <div className="p-6 space-y-6">
        {/* 项目基本信息 */}
        <div className="space-y-3">
          <div>
            <h4 className="text-lg font-medium text-gray-900">{project.name}</h4>
            <p className="text-sm text-gray-600 mt-1">{project.location}</p>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">项目负责人:</span>
            <span className="font-medium text-gray-900">{project.manager}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">项目状态:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              project.status === '已竣工' ? 'bg-blue-100 text-blue-800' :
              project.status === '在建中' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {project.status}
            </span>
          </div>
        </div>

        {/* 总体完整度仪表盘 */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              {/* 背景圆环 */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-gray-200"
              />
              {/* 进度圆环 */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className={getCompletenessColor(project.completeness).replace('text-', 'text-')}
                style={{
                  transition: 'stroke-dashoffset 0.5s ease-in-out',
                }}
              />
            </svg>
            {/* 中心文字 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${getCompletenessColor(project.completeness)}`}>
                {project.completeness}%
              </span>
              <span className="text-sm text-gray-500 mt-1">总体完整度</span>
            </div>
          </div>
        </div>

        {/* 阶段完整度列表 */}
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-gray-700">各阶段完整度</h5>
          <div className="space-y-3">
            {project.phases.map((phase, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{phase.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {phase.completed}/{phase.total}
                    </span>
                    <span className={`font-medium ${getCompletenessColor(phase.completeness)}`}>
                      {phase.completeness}%
                    </span>
                  </div>
                </div>
                <div className={`w-full h-2 ${getProgressBgColor(phase.completeness)} rounded-full overflow-hidden`}>
                  <div
                    className={`h-full ${getProgressColor(phase.completeness)} rounded-full transition-all duration-500`}
                    style={{ width: `${phase.completeness}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="pt-4 border-t border-gray-200">
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            <i className="ri-file-list-line mr-2"></i>
            查看详细档案
          </button>
        </div>
      </div>
    </div>
  );
}

