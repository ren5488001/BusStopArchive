# 方案三：使用若依系统字典管理阶段名称

## 优点
- 符合若依框架设计理念
- 字典可在系统管理界面维护，灵活性高
- 可在多处复用，维护统一
- 支持国际化扩展

## 实施步骤

### 1. 创建系统字典

在数据库执行以下SQL，创建阶段字典：

```sql
-- 创建字典类型
INSERT INTO sys_dict_type (dict_name, dict_type, status, create_by, create_time, remark)
VALUES ('建设阶段', 'bams_construction_stage', '0', 'admin', NOW(), '建设项目各阶段名称');

-- 创建字典数据
INSERT INTO sys_dict_data (dict_sort, dict_label, dict_value, dict_type, status, create_by, create_time, remark)
VALUES
(1, '立项', '0', 'bams_construction_stage', '0', 'admin', NOW(), '项目立项阶段'),
(2, '设计', '1', 'bams_construction_stage', '0', 'admin', NOW', '项目设计阶段'),
(3, '施工', '2', 'bams_construction_stage', '0', 'admin', NOW(), '项目施工阶段'),
(4, '验收', '3', 'bams_construction_stage', '0', 'admin', NOW(), '项目验收阶段');
```

### 2. 修改后端代码

在 `BamsProjectController.java` 中：

```java
import com.ruoyi.common.utils.DictUtils;

/**
 * 查询项目阶段列表（返回字典翻译后的名称）
 */
@PreAuthorize("@ss.hasPermi('bams:project:query')")
@GetMapping("/stages/{projectId}")
public AjaxResult getStages(@PathVariable Long projectId)
{
    List<BamsProjectStage> stages = projectService.selectProjectStages(projectId);

    // 使用字典服务转换阶段名称
    for (BamsProjectStage stage : stages) {
        String stageLabel = DictUtils.getDictLabel("bams_construction_stage", stage.getStageName());
        stage.setStageName(stageLabel);
    }

    return success(stages);
}
```

或者在 `BamsProjectServiceImpl.java` 中统一处理：

```java
import com.ruoyi.common.utils.spring.SpringUtils;
import com.ruoyi.system.service.ISysDictTypeService;

@Autowired
private ISysDictTypeService dictTypeService;

@Override
public List<BamsProjectStage> selectProjectStages(Long projectId)
{
    List<BamsProjectStage> stages = projectStageMapper.selectByProjectId(projectId);

    // 使用字典服务转换阶段名称
    for (BamsProjectStage stage : stages) {
        String stageLabel = DictUtils.getDictLabel("bams_construction_stage", stage.getStageName());
        stage.setStageName(stageLabel);
    }

    return stages;
}
```

### 3. 前端移除映射

修改以下三个前端文件，移除 `STAGE_NAME_MAP` 映射和 `getStageName` 函数：
- `react-ui/src/pages/Archive/ArchiveSearch.tsx`
- `react-ui/src/pages/Archive/ArchiveEntry.tsx`
- `react-ui/src/pages/Archive/components/ArchiveDetail.tsx`

因为后端已经返回翻译后的名称，前端直接使用即可。

### 4. 前端也可以使用字典

若依前端也支持字典翻译，可在前端调用字典API：

```typescript
import { getDicts } from '@/services/system/dict';

// 在组件中获取字典
const [stageDict, setStageDict] = useState<any[]>([]);

useEffect(() => {
  getDicts('bams_construction_stage').then((response) => {
    if (response.code === 200) {
      setStageDict(response.data);
    }
  });
}, []);

// 使用字典翻译
const getStageName = (value: string) => {
  const item = stageDict.find(d => d.dictValue === value);
  return item ? item.dictLabel : value;
};
```

## 总结

这个方案最符合若依框架的设计理念，但需要改动的代码最多。适合长期维护的项目。
