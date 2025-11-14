
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
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* 档案类型分布 - 饼图 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i className="ri-pie-chart-line mr-2 text-blue-600"></i>
          档案类型分布
        </h3>
        
        <div className="relative w-48 h-48 mx-auto mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            {data.archiveTypes.map((type, index) => {
              const total = data.archiveTypes.reduce((sum, t) => sum + t.count, 0);
              const percentage = (type.count / total) * 100;
              const angle = (percentage / 100) * 360;
              const startAngle = data.archiveTypes.slice(0, index).reduce((sum, t) => 
                sum + ((t.count / total) * 360), 0
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
                'Z'
              ].join(' ');
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={type.color}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              );
            })}
          </svg>
        </div>
        
        <div className="space-y-2">
          {data.archiveTypes.map((type, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: type.color }}
                ></div>
                <span className="text-gray-700">{type.name}</span>
              </div>
              <span className="font-medium text-gray-900">{type.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 按阶段归档数量 - 柱状图 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i className="ri-bar-chart-line mr-2 text-green-600"></i>
          按阶段归档数量
        </h3>
        
        <div className="space-y-4">
          {data.phaseArchives.map((phase, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-medium">{phase.phase}</span>
                <span className="text-gray-900 font-semibold">{phase.count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(phase.count / maxPhaseCount) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 近半年档案新增趋势 - 折线图 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i className="ri-line-chart-line mr-2 text-purple-600"></i>
          近半年新增趋势
        </h3>
        
        <div className="relative h-40">
          <svg className="w-full h-full" viewBox="0 0 300 120">
            {/* 网格线 */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={i}
                x1="0"
                y1={i * 24}
                x2="300"
                y2={i * 24}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
            ))}
            
            {/* 折线 */}
            <polyline
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={data.monthlyTrend.map((item, index) => 
                `${(index * 50) + 25},${120 - (item.count / maxTrendCount) * 100}`
              ).join(' ')}
            />
            
            {/* 数据点 */}
            {data.monthlyTrend.map((item, index) => (
              <circle
                key={index}
                cx={(index * 50) + 25}
                cy={120 - (item.count / maxTrendCount) * 100}
                r="4"
                fill="#8b5cf6"
                className="hover:r-6 transition-all cursor-pointer"
              />
            ))}
          </svg>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          {data.monthlyTrend.map((item, index) => (
            <span key={index}>{item.month}</span>
          ))}
        </div>
      </div>

      {/* 高风险项目清单 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i className="ri-alert-line mr-2 text-red-600"></i>
          高风险项目清单
        </h3>
        
        {highRiskProjects.length > 0 ? (
          <div className="space-y-3">
            {highRiskProjects.slice(0, 5).map((project, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {project.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    状态: {project.status}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">
                    {project.completeness}%
                  </div>
                  <div className="text-xs text-red-500">
                    完整度
                  </div>
                </div>
              </div>
            ))}
            
            {highRiskProjects.length > 5 && (
              <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 py-2">
                查看全部 {highRiskProjects.length} 个高风险项目
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <i className="ri-checkbox-circle-line text-4xl text-green-500 mb-2"></i>
            <p className="text-sm text-gray-500">暂无高风险项目</p>
          </div>
        )}
      </div>
    </div>
  );
}

