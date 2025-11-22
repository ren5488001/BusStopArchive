-- 在项目阶段表中新增阶段显示名称字段
-- 作者: Claude
-- 日期: 2025-01-19
-- 说明: 新增 stage_display_name 字段，用于存储阶段的显示名称（中文）

-- 1. 在阶段模板详情表中新增字段
ALTER TABLE bams_stage_template_detail
ADD COLUMN stage_display_name VARCHAR(50) NULL COMMENT '阶段显示名称' AFTER stage_name;

-- 2. 在项目阶段实例表中新增字段
ALTER TABLE bams_project_stage
ADD COLUMN stage_display_name VARCHAR(50) NULL COMMENT '阶段显示名称' AFTER stage_name;

-- 3. 更新阶段模板详情表的显示名称（根据 stage_name 代码填充）
UPDATE bams_stage_template_detail
SET stage_display_name = CASE stage_name
    WHEN '立项' THEN '立项'
    WHEN '设计' THEN '设计'
    WHEN '施工' THEN '施工'
    WHEN '验收' THEN '验收'
    WHEN '0' THEN '立项'
    WHEN '1' THEN '设计'
    WHEN '2' THEN '施工'
    WHEN '3' THEN '验收'
    ELSE stage_name
END;

-- 4. 更新项目阶段实例表的显示名称（根据 stage_name 代码填充）
UPDATE bams_project_stage
SET stage_display_name = CASE stage_name
    WHEN '立项' THEN '立项'
    WHEN '设计' THEN '设计'
    WHEN '施工' THEN '施工'
    WHEN '验收' THEN '验收'
    WHEN '0' THEN '立项'
    WHEN '1' THEN '设计'
    WHEN '2' THEN '施工'
    WHEN '3' THEN '验收'
    ELSE stage_name
END;

-- 5. 将 stage_name 恢复为代码（如果之前被改成了中文）
UPDATE bams_stage_template_detail
SET stage_name = CASE stage_display_name
    WHEN '立项' THEN '0'
    WHEN '设计' THEN '1'
    WHEN '施工' THEN '2'
    WHEN '验收' THEN '3'
    ELSE stage_name
END
WHERE stage_name IN ('立项', '设计', '施工', '验收');

UPDATE bams_project_stage
SET stage_name = CASE stage_display_name
    WHEN '立项' THEN '0'
    WHEN '设计' THEN '1'
    WHEN '施工' THEN '2'
    WHEN '验收' THEN '3'
    ELSE stage_name
END
WHERE stage_name IN ('立项', '设计', '施工', '验收');

-- 6. 验证结果
SELECT '阶段模板详情表结果:' AS message;
SELECT template_id, stage_name AS 阶段代码, stage_display_name AS 阶段名称, stage_order AS 排序
FROM bams_stage_template_detail
ORDER BY template_id, stage_order;

SELECT '' AS spacer;
SELECT '项目阶段实例表结果:' AS message;
SELECT project_id, stage_name AS 阶段代码, stage_display_name AS 阶段名称, stage_order AS 排序
FROM bams_project_stage
ORDER BY project_id, stage_order;

-- 完成
SELECT '阶段显示名称字段添加完成！' AS message;
SELECT 'stage_name 保存代码（0,1,2,3），stage_display_name 保存名称（立项,设计,施工,验收）' AS 说明;
