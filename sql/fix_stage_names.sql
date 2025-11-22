-- 修复阶段名称数据
-- 将数字代码改为实际阶段名称
-- 作者: Claude
-- 日期: 2025-01-19

-- 1. 更新阶段模板详情表中的阶段名称
UPDATE bams_stage_template_detail
SET stage_name = CASE stage_name
    WHEN '0' THEN '立项'
    WHEN '1' THEN '设计'
    WHEN '2' THEN '施工'
    WHEN '3' THEN '验收'
    ELSE stage_name
END
WHERE stage_name IN ('0', '1', '2', '3');

-- 2. 更新项目阶段实例表中的阶段名称
UPDATE bams_project_stage
SET stage_name = CASE stage_name
    WHEN '0' THEN '立项'
    WHEN '1' THEN '设计'
    WHEN '2' THEN '施工'
    WHEN '3' THEN '验收'
    ELSE stage_name
END
WHERE stage_name IN ('0', '1', '2', '3');

-- 3. 验证更新结果
SELECT 'Stage Template Detail 表更新结果:' AS message;
SELECT template_id, stage_name, stage_order
FROM bams_stage_template_detail
ORDER BY template_id, stage_order;

SELECT '' AS spacer;
SELECT 'Project Stage 表更新结果:' AS message;
SELECT project_id, stage_name, stage_order
FROM bams_project_stage
ORDER BY project_id, stage_order;

-- 完成
SELECT '阶段名称数据修复完成！' AS message;
