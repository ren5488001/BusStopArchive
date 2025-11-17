-- 项目阶段配置菜单和权限配置

-- 先查看现有项目管理菜单的最大ID
SELECT MAX(menu_id) FROM sys_menu WHERE menu_name LIKE '%项目%';

-- 在项目管理(menu_id=2003)下新增"项目阶段配置"菜单
INSERT INTO sys_menu VALUES(
    '2019', '项目阶段配置', '2003', '3', 'stage-template', 'project/StageTemplate', '', '', 1, 0, 'C', '0', '0', '', 'SettingOutlined', 'admin', sysdate(), '', NULL, '项目阶段配置菜单'
);

-- 新增权限按钮
-- 新增模板权限
INSERT INTO sys_menu VALUES(
    '2020', '新增模板', '2019', '1', '', '', '', '', 1, 0, 'F', '0', '0', 'bams:template:add', '#', 'admin', sysdate(), '', NULL, ''
);

-- 编辑模板权限
INSERT INTO sys_menu VALUES(
    '2021', '编辑模板', '2019', '2', '', '', '', '', 1, 0, 'F', '0', '0', 'bams:template:edit', '#', 'admin', sysdate(), '', NULL, ''
);

-- 删除模板权限
INSERT INTO sys_menu VALUES(
    '2022', '删除模板', '2019', '3', '', '', '', '', 1, 0, 'F', '0', '0', 'bams:template:remove', '#', 'admin', sysdate(), '', NULL, ''
);

-- 复制模板权限
INSERT INTO sys_menu VALUES(
    '2023', '复制模板', '2019', '4', '', '', '', '', 1, 0, 'F', '0', '0', 'bams:template:copy', '#', 'admin', sysdate(), '', NULL, ''
);
