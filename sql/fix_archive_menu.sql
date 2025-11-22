-- 修复档案管理菜单配置
-- 作者: Claude
-- 日期: 2025-01-19

-- 1. 删除旧的和重复的菜单数据
DELETE FROM sys_menu WHERE menu_id IN (2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2015, 2016, 2017, 2018, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039, 2040);

-- 2. 删除顶级菜单(如果存在)
DELETE FROM sys_menu WHERE menu_id = 2029;

-- 3. 创建正确的档案管理菜单结构

-- 3.1 顶级菜单：档案管理
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, path, component, `query`, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
VALUES (2029, '档案管理', 0, 5, 'archive', NULL, '', 1, 0, 'M', '0', '0', '', 'file-text', 'admin', NOW(), 'admin', NOW(), '档案管理目录');

-- 3.2 子菜单：档案检索查询
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, path, component, `query`, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
VALUES (2030, '档案检索查询', 2029, 1, 'search', 'Archive/ArchiveSearch', '', 1, 0, 'C', '0', '0', 'archive:search:list', 'search', 'admin', NOW(), 'admin', NOW(), '档案检索查询菜单');

-- 3.3 子菜单：著录与入库
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, path, component, `query`, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
VALUES (2031, '著录与入库', 2029, 2, 'entry', 'Archive/ArchiveEntry', '', 1, 0, 'C', '0', '0', 'archive:entry:add', 'upload', 'admin', NOW(), 'admin', NOW(), '档案著录与入库菜单');

-- 4. 档案检索查询的按钮权限
INSERT INTO sys_menu (menu_name, parent_id, order_num, path, component, `query`, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
VALUES
('档案查询', 2030, 1, '#', '', '', 1, 0, 'F', '0', '0', 'archive:search:query', '#', 'admin', NOW(), 'admin', NOW(), ''),
('档案详情', 2030, 2, '#', '', '', 1, 0, 'F', '0', '0', 'archive:search:detail', '#', 'admin', NOW(), 'admin', NOW(), ''),
('档案下载', 2030, 3, '#', '', '', 1, 0, 'F', '0', '0', 'archive:search:download', '#', 'admin', NOW(), 'admin', NOW(), ''),
('档案删除', 2030, 4, '#', '', '', 1, 0, 'F', '0', '0', 'archive:search:remove', '#', 'admin', NOW(), 'admin', NOW(), ''),
('档案恢复', 2030, 5, '#', '', '', 1, 0, 'F', '0', '0', 'archive:search:restore', '#', 'admin', NOW(), 'admin', NOW(), ''),
('档案导出', 2030, 6, '#', '', '', 1, 0, 'F', '0', '0', 'archive:search:export', '#', 'admin', NOW(), 'admin', NOW(), '');

-- 5. 档案著录与入库的按钮权限
INSERT INTO sys_menu (menu_name, parent_id, order_num, path, component, `query`, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
VALUES
('档案新增', 2031, 1, '#', '', '', 1, 0, 'F', '0', '0', 'archive:entry:add', '#', 'admin', NOW(), 'admin', NOW(), ''),
('文件上传', 2031, 2, '#', '', '', 1, 0, 'F', '0', '0', 'archive:entry:upload', '#', 'admin', NOW(), 'admin', NOW(), ''),
('保存草稿', 2031, 3, '#', '', '', 1, 0, 'F', '0', '0', 'archive:entry:draft', '#', 'admin', NOW(), 'admin', NOW(), '');

-- 6. 为管理员角色分配菜单权限
-- 注意：这里假设管理员角色ID为1，如果不同请修改
-- 先删除旧的角色菜单关联
DELETE FROM sys_role_menu WHERE menu_id IN (2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2015, 2016, 2017, 2018, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039, 2040);

-- 为管理员角色分配新的菜单权限
INSERT INTO sys_role_menu (role_id, menu_id)
SELECT 1, menu_id FROM sys_menu WHERE menu_id >= 2029 AND parent_id IN (0, 2029, 2030, 2031);

-- 完成
SELECT '档案管理菜单修复完成!' AS message;
