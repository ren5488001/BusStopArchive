# 阶段名称显示问题分析与解决方案

## 问题描述

API接口 `http://localhost:8000/api/bams/project/stages/3` 返回的阶段名称是数字代码（"0", "1", "2", "3"），而不是实际的中文名称（"立项", "设计", "施工", "验收"）。

## 根本原因

经过代码调查和数据库查询，确认问题根源在于：

### 数据库层面
```sql
-- bams_stage_template_detail 表
SELECT stage_name FROM bams_stage_template_detail WHERE template_id = 10;
-- 结果：stage_name 存储的是 "0", "1", "2", "3"

-- bams_project_stage 表
SELECT stage_name FROM bams_project_stage WHERE project_id = 3;
-- 结果：stage_name 存储的也是 "0", "1", "2", "3"
```

### 后端代码层面

在 `BamsProjectServiceImpl.java:330` 行，应用阶段模板时：

```java
// 直接复制模板中的 stage_name（数字代码）
stage.setStageName(detail.getStageName());
```

在 `BamsProjectController.java:72-77` 行，API直接返回数据库原始数据：

```java
@GetMapping("/stages/{projectId}")
public AjaxResult getStages(@PathVariable Long projectId)
{
    List<BamsProjectStage> stages = projectService.selectProjectStages(projectId);
    return success(stages);  // 直接返回，没有转换
}
```

### 前端临时方案

目前前端使用了临时映射方案：

```typescript
const STAGE_NAME_MAP: Record<string, string> = {
  '0': '立项',
  '1': '设计',
  '2': '施工',
  '3': '验收',
};
```

在三个文件中都有这个映射：
- `ArchiveSearch.tsx`
- `ArchiveEntry.tsx`
- `ArchiveDetail.tsx`

## 解决方案对比

| 方案 | 优点 | 缺点 | 难度 | 推荐度 |
|------|------|------|------|--------|
| **方案一：修复数据库数据** | ✅ 最彻底<br>✅ 无性能开销<br>✅ 前后端都简洁 | ⚠️ 需要更新现有数据 | ⭐ 简单 | ⭐⭐⭐⭐⭐ 强烈推荐 |
| **方案二：后端Service映射** | ✅ 不改数据库<br>✅ API返回正确值 | ❌ 每次查询都转换<br>❌ 多处需要添加 | ⭐⭐ 中等 | ⭐⭐⭐ 推荐 |
| **方案三：系统字典管理** | ✅ 符合框架规范<br>✅ 易维护扩展 | ❌ 改动最多<br>❌ 需配置字典 | ⭐⭐⭐ 复杂 | ⭐⭐ 适合长期项目 |

## 推荐方案：方案一（修复数据库数据）

### 理由
1. **最彻底解决问题**：从源头修复数据
2. **性能最优**：无需运行时转换
3. **代码最简洁**：前后端都可以移除映射代码
4. **易于维护**：数据即所见，无需记忆映射规则

### 实施步骤

#### 1. 执行SQL修复数据
```bash
mysql -u root -proot ry-vue < sql/fix_stage_names.sql
```

#### 2. 验证数据
```sql
-- 检查模板详情表
SELECT template_id, stage_name, stage_order
FROM bams_stage_template_detail
ORDER BY template_id, stage_order;

-- 检查项目阶段表
SELECT project_id, stage_name, stage_order
FROM bams_project_stage
ORDER BY project_id, stage_order;
```

#### 3. 清理前端映射代码

在以下三个文件中删除 `STAGE_NAME_MAP` 和 `getStageName` 函数：
- `react-ui/src/pages/Archive/ArchiveSearch.tsx` (第47-57行, 第269行)
- `react-ui/src/pages/Archive/ArchiveEntry.tsx` (相应位置)
- `react-ui/src/pages/Archive/components/ArchiveDetail.tsx` (相应位置)

#### 4. 测试验证

重启服务后测试：
```bash
# 重启后端
./backend.sh restart

# 访问API
curl http://localhost:8000/api/bams/project/stages/3

# 预期结果
{
  "code": 200,
  "data": [
    {
      "stageId": 12,
      "stageName": "立项",  // 现在是中文名称了
      "stageOrder": 1
    }
  ]
}
```

## 其他方案文档

- [方案二：后端Service层映射](./fix_stage_names_backend.md)
- [方案三：使用系统字典](./fix_stage_names_dict.md)

## 总结

您的分析完全正确："项目阶段实例表中只保存了阶段id，没保存阶段名称"。

建议采用**方案一**直接修复数据库数据，这是最简洁高效的解决方案。SQL脚本已经准备好，可以直接执行。
