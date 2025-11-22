-- 更新阶段显示名称为字典配置（4个字）
-- 根据系统字典 bams_project_phase 的配置
-- 作者: Claude
-- 日期: 2025-01-19

-- 1. 更新阶段模板详情表
UPDATE bams_stage_template_detail
SET stage_display_name = CASE stage_id
    WHEN '0' THEN '立项阶段'
    WHEN '1' THEN '设计阶段'
    WHEN '2' THEN '招标阶段'
    WHEN '3' THEN '施工阶段'
    ELSE stage_display_name
END
WHERE stage_id IN ('0', '1', '2', '3');

-- 2. 更新项目阶段实例表
UPDATE bams_project_stage
SET stage_display_name = CASE stage_id
    WHEN '0' THEN '立项阶段'
    WHEN '1' THEN '设计阶段'
    WHEN '2' THEN '招标阶段'
    WHEN '3' THEN '施工阶段'
    ELSE stage_display_name
END
WHERE stage_id IN ('0', '1', '2', '3');

-- 3. 验证结果
SELECT '阶段模板详情表更新结果:' AS message;
SELECT id, template_id, stage_id AS 阶段ID, stage_display_name AS 阶段名称, stage_order AS 排序
FROM bams_stage_template_detail
ORDER BY template_id, stage_order;

SELECT '' AS spacer;
SELECT '项目阶段实例表更新结果:' AS message;
SELECT id, project_id, stage_id AS 阶段ID, stage_display_name AS 阶段名称, stage_order AS 排序
FROM bams_project_stage
ORDER BY project_id, stage_order;

-- 完成
SELECT '阶段显示名称已更新为字典配置（4个字）！' AS message;
SELECT '0=立项阶段, 1=设计阶段, 2=招标阶段, 3=施工阶段' AS 映射说明;
