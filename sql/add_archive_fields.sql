-- 添加档案表新字段
-- 执行日期: 2025-11-20

USE `ry-vue`;

-- 1. 添加文件标准字段
ALTER TABLE `bams_archive`
ADD COLUMN `file_standard` VARCHAR(100) NULL COMMENT '文件标准（字典值: bams_file_conf）' AFTER `file_date`;

-- 2. 添加档案分类字段
ALTER TABLE `bams_archive`
ADD COLUMN `archive_category` VARCHAR(100) NULL COMMENT '档案分类（字典值: bams_archives_classification）' AFTER `file_standard`;

-- 3. 添加是否有纸质材料字段
ALTER TABLE `bams_archive`
ADD COLUMN `has_paper_material` CHAR(1) NULL DEFAULT '0' COMMENT '是否有纸质材料（0=否, 1=是）' AFTER `archive_category`;

-- 4. 移除 archive_number 字段的唯一索引（如果存在）
-- 因为 archive_number 改为非必填，可能为 NULL，所以移除唯一索引
ALTER TABLE `bams_archive`
DROP INDEX IF EXISTS `uk_archive_number`;

-- 5. 为新字段添加索引（可选，根据查询需求）
-- CREATE INDEX `idx_file_standard` ON `bams_archive`(`file_standard`);
-- CREATE INDEX `idx_archive_category` ON `bams_archive`(`archive_category`);

-- 验证修改
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM
    INFORMATION_SCHEMA.COLUMNS
WHERE
    TABLE_SCHEMA = 'ry-vue'
    AND TABLE_NAME = 'bams_archive'
    AND COLUMN_NAME IN ('file_standard', 'archive_category', 'has_paper_material', 'archive_number')
ORDER BY
    ORDINAL_POSITION;
