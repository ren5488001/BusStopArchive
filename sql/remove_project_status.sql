-- 移除项目表的 status 字段
-- 该字段原用于表示项目状态（0正常/1停用），现已废弃

ALTER TABLE `bams_project` DROP COLUMN `status`;
