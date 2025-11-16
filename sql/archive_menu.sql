-- ----------------------------
-- 档案管理菜单 SQL
-- ----------------------------

-- 一级菜单：档案管理
INSERT INTO sys_menu VALUES(
    '2005',                          -- 菜单ID
    '档案管理',                      -- 菜单名称
    '0',                             -- 父菜单ID (0表示一级菜单)
    '5',                             -- 显示顺序
    'archive',                       -- 路由地址
    NULL,                            -- 组件路径 (目录类型为NULL)
    '',                              -- 路由参数
    '',                              -- 路由名称
    1,                               -- 是否为外链 (0是 1否)
    0,                               -- 是否缓存 (0缓存 1不缓存)
    'M',                             -- 菜单类型 (M目录 C菜单 F按钮)
    '0',                             -- 显示状态 (0显示 1隐藏)
    '0',                             -- 菜单状态 (0正常 1停用)
    '',                              -- 权限标识
    'FileTextOutlined',              -- 菜单图标
    'admin',                         -- 创建者
    sysdate(),                       -- 创建时间
    '',                              -- 更新者
    NULL,                            -- 更新时间
    '档案管理目录'                   -- 备注
);

-- 二级菜单：档案检索查询
INSERT INTO sys_menu VALUES(
    '2006',                          -- 菜单ID
    '档案检索查询',                  -- 菜单名称
    '2005',                          -- 父菜单ID
    '1',                             -- 显示顺序
    'search',                        -- 路由地址
    'Archive/ArchiveSearch',         -- 组件路径
    '',                              -- 路由参数
    '',                              -- 路由名称
    1,                               -- 是否为外链
    0,                               -- 是否缓存
    'C',                             -- 菜单类型 (C菜单)
    '0',                             -- 显示状态
    '0',                             -- 菜单状态
    'archive:search:list',           -- 权限标识
    'SearchOutlined',                -- 菜单图标
    'admin',                         -- 创建者
    sysdate(),                       -- 创建时间
    '',                              -- 更新者
    NULL,                            -- 更新时间
    '档案检索查询菜单'               -- 备注
);

-- 二级菜单：著录与入库
INSERT INTO sys_menu VALUES(
    '2007',                          -- 菜单ID
    '著录与入库',                    -- 菜单名称
    '2005',                          -- 父菜单ID
    '2',                             -- 显示顺序
    'entry',                         -- 路由地址
    'Archive/ArchiveEntry',          -- 组件路径
    '',                              -- 路由参数
    '',                              -- 路由名称
    1,                               -- 是否为外链
    0,                               -- 是否缓存
    'C',                             -- 菜单类型
    '0',                             -- 显示状态
    '0',                             -- 菜单状态
    'archive:entry:list',            -- 权限标识
    'UploadOutlined',                -- 菜单图标
    'admin',                         -- 创建者
    sysdate(),                       -- 创建时间
    '',                              -- 更新者
    NULL,                            -- 更新时间
    '著录与入库菜单'                 -- 备注
);

-- ----------------------------
-- 档案检索查询按钮权限
-- ----------------------------
INSERT INTO sys_menu VALUES('2008', '档案查询', '2006', '1', '', '', '', '', 1, 0, 'F', '0', '0', 'archive:search:query',  '#', 'admin', sysdate(), '', NULL, '');
INSERT INTO sys_menu VALUES('2009', '档案详情', '2006', '2', '', '', '', '', 1, 0, 'F', '0', '0', 'archive:search:detail', '#', 'admin', sysdate(), '', NULL, '');
INSERT INTO sys_menu VALUES('2010', '档案下载', '2006', '3', '', '', '', '', 1, 0, 'F', '0', '0', 'archive:search:download', '#', 'admin', sysdate(), '', NULL, '');
INSERT INTO sys_menu VALUES('2011', '档案编辑', '2006', '4', '', '', '', '', 1, 0, 'F', '0', '0', 'archive:search:edit',   '#', 'admin', sysdate(), '', NULL, '');
INSERT INTO sys_menu VALUES('2012', '档案删除', '2006', '5', '', '', '', '', 1, 0, 'F', '0', '0', 'archive:search:remove', '#', 'admin', sysdate(), '', NULL, '');
INSERT INTO sys_menu VALUES('2013', '档案恢复', '2006', '6', '', '', '', '', 1, 0, 'F', '0', '0', 'archive:search:restore', '#', 'admin', sysdate(), '', NULL, '');
INSERT INTO sys_menu VALUES('2014', '批量导出', '2006', '7', '', '', '', '', 1, 0, 'F', '0', '0', 'archive:search:export', '#', 'admin', sysdate(), '', NULL, '');

-- ----------------------------
-- 著录与入库按钮权限
-- ----------------------------
INSERT INTO sys_menu VALUES('2015', '档案录入', '2007', '1', '', '', '', '', 1, 0, 'F', '0', '0', 'archive:entry:add',    '#', 'admin', sysdate(), '', NULL, '');
INSERT INTO sys_menu VALUES('2016', '文件上传', '2007', '2', '', '', '', '', 1, 0, 'F', '0', '0', 'archive:entry:upload', '#', 'admin', sysdate(), '', NULL, '');
INSERT INTO sys_menu VALUES('2017', '保存草稿', '2007', '3', '', '', '', '', 1, 0, 'F', '0', '0', 'archive:entry:draft',  '#', 'admin', sysdate(), '', NULL, '');
INSERT INTO sys_menu VALUES('2018', '确认入库', '2007', '4', '', '', '', '', 1, 0, 'F', '0', '0', 'archive:entry:submit', '#', 'admin', sysdate(), '', NULL, '');
