# 方案二：后端Service层添加阶段名称映射

## 修改文件
`ruoyi-system/src/main/java/com/ruoyi/system/service/impl/BamsProjectServiceImpl.java`

## 修改方法

在 `BamsProjectServiceImpl.java` 中添加阶段名称映射方法：

```java
/**
 * 将阶段代码转换为阶段名称
 *
 * @param stageCode 阶段代码 (0, 1, 2, 3)
 * @return 阶段名称 (立项, 设计, 施工, 验收)
 */
private String convertStageCodeToName(String stageCode) {
    if (stageCode == null) {
        return stageCode;
    }

    switch (stageCode) {
        case "0":
            return "立项";
        case "1":
            return "设计";
        case "2":
            return "施工";
        case "3":
            return "验收";
        default:
            return stageCode;
    }
}

/**
 * 批量转换阶段列表的阶段名称
 *
 * @param stages 阶段列表
 */
private void convertStageNames(List<BamsProjectStage> stages) {
    if (stages != null && !stages.isEmpty()) {
        for (BamsProjectStage stage : stages) {
            stage.setStageName(convertStageCodeToName(stage.getStageName()));
        }
    }
}
```

然后修改 `selectProjectStages` 方法（第221-224行）：

```java
@Override
public List<BamsProjectStage> selectProjectStages(Long projectId)
{
    List<BamsProjectStage> stages = projectStageMapper.selectByProjectId(projectId);
    // 转换阶段代码为阶段名称
    convertStageNames(stages);
    return stages;
}
```

## 优缺点

### 优点
- 不修改数据库，保持数据原样
- API返回的是正确的中文名称
- 前端无需修改，直接移除 STAGE_NAME_MAP 映射

### 缺点
- 每次查询都需要转换，有性能开销
- 如果有多个地方查询阶段，都需要添加转换逻辑
- 代码维护成本略高
