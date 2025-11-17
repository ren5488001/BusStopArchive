# 项目阶段模板接口设计方案

## 一、数据库设计

### 1.1 阶段模板主表 (bams_stage_template)

| 字段名 | 类型 | 长度 | 必填 | 说明 |
|--------|------|------|------|------|
| template_id | bigint | 20 | 是 | 模板ID（主键，自增） |
| template_name | varchar | 100 | 是 | 模板名称 |
| template_desc | varchar | 500 | 否 | 模板描述 |
| stage_count | int | 11 | 否 | 阶段总数 |
| status | char | 1 | 否 | 状态（0正常 1停用） |
| del_flag | char | 1 | 否 | 删除标志（0存在 2删除） |
| create_by | varchar | 64 | 否 | 创建者 |
| create_time | datetime | - | 否 | 创建时间 |
| update_by | varchar | 64 | 否 | 更新者 |
| update_time | datetime | - | 否 | 更新时间 |
| remark | varchar | 500 | 否 | 备注 |

**索引**：
- PRIMARY KEY (`template_id`)

### 1.2 阶段模板明细表 (bams_stage_template_detail)

| 字段名 | 类型 | 长度 | 必填 | 说明 |
|--------|------|------|------|------|
| detail_id | bigint | 20 | 是 | 明细ID（主键，自增） |
| template_id | bigint | 20 | 是 | 模板ID（外键） |
| stage_name | varchar | 100 | 是 | 阶段名称 |
| stage_order | int | 11 | 是 | 阶段顺序 |
| required_files | varchar | 1000 | 否 | 标准文件配置（逗号分隔的dict_value） |
| create_time | datetime | - | 否 | 创建时间 |
| update_time | datetime | - | 否 | 更新时间 |

**索引**：
- PRIMARY KEY (`detail_id`)
- INDEX `idx_template_id` (`template_id`)

**外键约束**：
- FOREIGN KEY (`template_id`) REFERENCES `bams_stage_template` (`template_id`) ON DELETE CASCADE

### 1.3 表关系说明
- 一个模板可以包含多个阶段（一对多）
- 删除模板时，级联删除所有关联的阶段明细
- `required_files` 字段存储字典值，多个值用逗号分隔（如："0,1,2"）

---

## 二、接口设计

### 2.1 新增阶段模板

**接口路径**：`POST /api/bams/stage/template`

**请求参数**：
```json
{
  "templateName": "标准工程项目模板",
  "templateDesc": "适用于一般工程建设项目",
  "remark": "包含立项、设计、招标、施工四个阶段",
  "stages": [
    {
      "stageName": "立项阶段",
      "stageOrder": 1,
      "requiredFiles": ["0", "1"]
    },
    {
      "stageName": "设计阶段",
      "stageOrder": 2,
      "requiredFiles": ["2"]
    },
    {
      "stageName": "招标阶段",
      "stageOrder": 3,
      "requiredFiles": ["0", "1", "2"]
    },
    {
      "stageName": "施工阶段",
      "stageOrder": 4,
      "requiredFiles": ["0", "1", "2"]
    }
  ]
}
```

**响应结果**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "templateId": 1
  }
}
```

### 2.2 查询阶段模板列表

**接口路径**：`GET /api/bams/stage/template/list`

**请求参数**：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| templateName | String | 否 | 模板名称（模糊查询） |
| status | String | 否 | 状态（0正常 1停用） |
| pageNum | Integer | 否 | 页码 |
| pageSize | Integer | 否 | 每页条数 |

**响应结果**：
```json
{
  "code": 200,
  "msg": "查询成功",
  "rows": [
    {
      "templateId": 1,
      "templateName": "标准工程项目模板",
      "templateDesc": "适用于一般工程建设项目",
      "stageCount": 4,
      "status": "0",
      "createBy": "admin",
      "createTime": "2025-01-17 10:00:00",
      "remark": "包含立项、设计、招标、施工四个阶段"
    }
  ],
  "total": 1
}
```

### 2.3 查询阶段模板详情

**接口路径**：`GET /api/bams/stage/template/{templateId}`

**请求参数**：
- `templateId`: 模板ID（路径参数）

**响应结果**：
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "templateId": 1,
    "templateName": "标准工程项目模板",
    "templateDesc": "适用于一般工程建设项目",
    "stageCount": 4,
    "status": "0",
    "createBy": "admin",
    "createTime": "2025-01-17 10:00:00",
    "remark": "包含立项、设计、招标、施工四个阶段",
    "stages": [
      {
        "detailId": 1,
        "stageName": "立项阶段",
        "stageOrder": 1,
        "requiredFiles": ["0", "1"]
      },
      {
        "detailId": 2,
        "stageName": "设计阶段",
        "stageOrder": 2,
        "requiredFiles": ["2"]
      },
      {
        "detailId": 3,
        "stageName": "招标阶段",
        "stageOrder": 3,
        "requiredFiles": ["0", "1", "2"]
      },
      {
        "detailId": 4,
        "stageName": "施工阶段",
        "stageOrder": 4,
        "requiredFiles": ["0", "1", "2"]
      }
    ]
  }
}
```

### 2.4 修改阶段模板

**接口路径**：`PUT /api/bams/stage/template`

**请求参数**：
```json
{
  "templateId": 1,
  "templateName": "标准工程项目模板（修改）",
  "templateDesc": "适用于一般工程建设项目",
  "remark": "更新备注",
  "stages": [
    {
      "detailId": 1,
      "stageName": "立项阶段",
      "stageOrder": 1,
      "requiredFiles": ["0", "1"]
    },
    {
      "stageName": "新增阶段",
      "stageOrder": 2,
      "requiredFiles": ["2"]
    }
  ]
}
```

**说明**：
- 有 `detailId` 的阶段会被更新
- 没有 `detailId` 的阶段会被新增
- 不在列表中的原有阶段会被删除

**响应结果**：
```json
{
  "code": 200,
  "msg": "操作成功"
}
```

### 2.5 删除阶段模板

**接口路径**：`DELETE /api/bams/stage/template/{templateIds}`

**请求参数**：
- `templateIds`: 模板ID，多个用逗号分隔（如："1,2,3"）

**响应结果**：
```json
{
  "code": 200,
  "msg": "删除成功"
}
```

### 2.6 复制阶段模板

**接口路径**：`POST /api/bams/stage/template/copy/{templateId}`

**请求参数**：
- `templateId`: 要复制的模板ID（路径参数）

**响应结果**：
```json
{
  "code": 200,
  "msg": "复制成功",
  "data": {
    "templateId": 2
  }
}
```

---

## 三、后端代码结构

### 3.1 项目结构
```
ruoyi-system/
└── src/main/java/com/ruoyi/
    ├── domain/
    │   ├── BamsStageTemplate.java          # 模板主表实体
    │   └── BamsStageTemplateDetail.java    # 模板明细表实体
    ├── mapper/
    │   ├── BamsStageTemplateMapper.java    # 模板主表Mapper
    │   └── BamsStageTemplateDetailMapper.java # 模板明细表Mapper
    ├── service/
    │   ├── IBamsStageTemplateService.java  # 服务接口
    │   └── impl/
    │       └── BamsStageTemplateServiceImpl.java # 服务实现
    └── controller/
        └── BamsStageTemplateController.java # 控制器

ruoyi-system/src/main/resources/mapper/
├── BamsStageTemplateMapper.xml
└── BamsStageTemplateDetailMapper.xml
```

### 3.2 核心类说明

#### 3.2.1 BamsStageTemplate (实体类)
```java
public class BamsStageTemplate extends BaseEntity {
    private Long templateId;
    private String templateName;
    private String templateDesc;
    private Integer stageCount;
    private String status;
    private String delFlag;

    // 关联的阶段明细列表
    private List<BamsStageTemplateDetail> stages;
}
```

#### 3.2.2 BamsStageTemplateDetail (实体类)
```java
public class BamsStageTemplateDetail {
    private Long detailId;
    private Long templateId;
    private String stageName;
    private Integer stageOrder;
    private String requiredFiles; // 逗号分隔的字符串
    private Date createTime;
    private Date updateTime;

    // 前端传递的数组，不存数据库
    @TableField(exist = false)
    private List<String> requiredFileList;
}
```

### 3.3 Service 层核心方法

```java
public interface IBamsStageTemplateService {
    /**
     * 新增阶段模板（含明细）
     */
    int insertStageTemplate(BamsStageTemplate template);

    /**
     * 查询阶段模板列表
     */
    List<BamsStageTemplate> selectStageTemplateList(BamsStageTemplate template);

    /**
     * 查询阶段模板详情（含明细）
     */
    BamsStageTemplate selectStageTemplateById(Long templateId);

    /**
     * 修改阶段模板（含明细）
     */
    int updateStageTemplate(BamsStageTemplate template);

    /**
     * 删除阶段模板
     */
    int deleteStageTemplateByIds(Long[] templateIds);

    /**
     * 复制阶段模板
     */
    int copyStageTemplate(Long templateId);
}
```

---

## 四、业务逻辑说明

### 4.1 新增模板
1. 接收前端传入的模板信息和阶段列表
2. 插入主表数据，获取 `templateId`
3. 计算 `stageCount`
4. 将 `requiredFileList` 数组转为逗号分隔的字符串
5. 批量插入明细表数据
6. 事务控制：主表和明细表同时成功或失败

### 4.2 修改模板
1. 更新主表信息
2. 删除原有的所有明细数据
3. 重新插入新的明细数据
4. 更新 `stageCount`
5. 事务控制

### 4.3 复制模板
1. 查询原模板及其明细
2. 创建新模板，名称添加"（副本）"后缀
3. 复制所有阶段明细
4. 返回新模板ID

### 4.4 删除模板
1. 逻辑删除：更新 `del_flag` 为 '2'
2. 或物理删除：直接删除记录（外键级联删除明细）

---

## 五、前端调用示例

### 5.1 新增模板调用
```typescript
// react-ui/src/services/bams/stageTemplate.ts
import { request } from '@umijs/max';

export async function addStageTemplate(data: API.StageTemplate) {
  return request<API.Result>('/api/bams/stage/template', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    data: data
  });
}
```

### 5.2 StageTemplateManager 组件调用
```typescript
const handleSubmit = async () => {
  try {
    const values = await form.validateFields();

    // 验证阶段配置...

    const templateData = {
      templateName: values.name,
      templateDesc: values.desc,
      remark: values.desc,
      stages: stages.map(stage => ({
        stageName: stage.name,
        stageOrder: stage.order,
        requiredFiles: stage.requiredFiles
      }))
    };

    const result = await addStageTemplate(templateData);
    if (result.code === 200) {
      message.success('模板保存成功');
      onClose();
      // 刷新列表
    } else {
      message.error(result.msg || '保存失败');
    }
  } catch (error) {
    console.error('保存失败:', error);
  }
};
```

---

## 六、测试数据

已在 SQL 脚本中包含一条测试数据：
- 模板名称：标准工程项目模板
- 包含 4 个阶段：立项、设计、招标、施工
- 每个阶段配置了不同的标准文件

---

## 七、权限设计

建议在菜单管理中配置以下权限：
- `bams:template:list` - 查看模板列表
- `bams:template:query` - 查询模板详情
- `bams:template:add` - 新增模板
- `bams:template:edit` - 修改模板
- `bams:template:remove` - 删除模板
- `bams:template:copy` - 复制模板

---

## 八、后续优化建议

1. **版本控制**：为模板增加版本号，支持模板历史版本查询
2. **模板分类**：增加模板分类字段，便于管理
3. **模板共享**：支持模板在不同用户/部门间共享
4. **模板审核**：增加模板审核流程
5. **使用统计**：记录模板被使用的次数
