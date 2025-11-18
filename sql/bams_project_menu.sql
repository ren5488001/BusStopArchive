-- 项目管理菜单权限配置
-- 注意：菜单2000和2001已存在，这里只添加权限按钮和更新主菜单

-- 1. 更新项目信息菜单的权限标识
UPDATE sys_menu SET perms = 'bams:project:list', component = 'project/ProjectInfo' WHERE menu_id = 2001;

-- 2. 添加项目管理按钮权限（使用2024开始的ID）
INSERT INTO sys_menu VALUES(
    '2024', '项目查询', '2001', '1', '', '', '', '', 1, 0, 'F', '0', '0', 'bams:project:query', '#', 'admin', sysdate(), '', NULL, ''
);

INSERT INTO sys_menu VALUES(
    '2025', '项目新增', '2001', '2', '', '', '', '', 1, 0, 'F', '0', '0', 'bams:project:add', '#', 'admin', sysdate(), '', NULL, ''
);

INSERT INTO sys_menu VALUES(
    '2026', '项目修改', '2001', '3', '', '', '', '', 1, 0, 'F', '0', '0', 'bams:project:edit', '#', 'admin', sysdate(), '', NULL, ''
);

INSERT INTO sys_menu VALUES(
    '2027', '项目删除', '2001', '4', '', '', '', '', 1, 0, 'F', '0', '0', 'bams:project:remove', '#', 'admin', sysdate(), '', NULL, ''
);

INSERT INTO sys_menu VALUES(
    '2028', '项目导出', '2001', '5', '', '', '', '', 1, 0, 'F', '0', '0', 'bams:project:export', '#', 'admin', sysdate(), '', NULL, ''
);
