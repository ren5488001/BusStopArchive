# 代码开发规范与最佳实践

> 本文档总结了项目开发中的代码规范和最佳实践，旨在提高代码质量、性能和可维护性。
>
> **最后更新**: 2025-11-18
> **维护人**: Rick

---

## 📋 目录

- [后端开发规范](#后端开发规范)
  - [分层架构规范](#分层架构规范)
  - [数据校验规范](#数据校验规范)
  - [缓存使用规范](#缓存使用规范)
  - [异常处理规范](#异常处理规范)
  - [并发安全规范](#并发安全规范)
  - [数据库设计规范](#数据库设计规范)
  - [事务管理规范](#事务管理规范)
- [前端开发规范](#前端开发规范)
  - [组件设计规范](#组件设计规范)
  - [性能优化规范](#性能优化规范)
  - [类型定义规范](#类型定义规范)
  - [用户体验规范](#用户体验规范)
  - [API调用规范](#api调用规范)
- [通用规范](#通用规范)
  - [代码审查检查清单](#代码审查检查清单)
  - [提交规范](#提交规范)

---

## 后端开发规范

### 分层架构规范

#### ✅ 必须遵守

1. **严格遵循三层架构**
   ```
   Controller层 → Service层 → Mapper层
   ```
   - Controller层：仅负责接收请求、参数校验、调用Service、返回响应
   - Service层：业务逻辑处理、事务控制
   - Mapper层：数据访问，仅执行SQL

2. **层级职责划分**
   ```java
   // ❌ 错误：Controller中编写业务逻辑
   @PostMapping
   public AjaxResult add(@RequestBody BamsProject project) {
       String code = generateCode(); // 业务逻辑不应在Controller
       project.setCode(code);
       return success(projectMapper.insert(project));
   }

   // ✅ 正确：Controller仅调用Service
   @PostMapping
   public AjaxResult add(@Validated @RequestBody BamsProject project) {
       project.setCreateBy(getUsername());
       return toAjax(projectService.insertProject(project));
   }
   ```

3. **实体类设计规范**
   - 所有实体类必须继承`BaseEntity`（统一审计字段）
   - 使用`serialVersionUID`标识序列化版本
   - 字段命名采用驼峰命名法

   ```java
   public class BamsProject extends BaseEntity {
       private static final long serialVersionUID = 1L;

       private Long projectId;
       private String projectName;
       // ...
   }
   ```

#### ⚠️ 禁止事项

- ❌ 禁止跨层调用（如Controller直接调用Mapper）
- ❌ 禁止在Mapper层编写业务逻辑
- ❌ 禁止在实体类中编写业务方法

---

### 数据校验规范

#### ✅ 必须遵守

1. **使用Bean Validation注解进行字段校验**
   ```java
   public class BamsProject extends BaseEntity {

       @NotBlank(message = "项目名称不能为空")
       @Size(min = 1, max = 200, message = "项目名称长度为1-200个字符")
       private String projectName;

       @DecimalMin(value = "-90", message = "纬度范围：-90~90")
       @DecimalMax(value = "90", message = "纬度范围：-90~90")
       @Digits(integer = 2, fraction = 6, message = "纬度格式不正确")
       private BigDecimal latitude;

       @Size(max = 1000, message = "项目描述不能超过1000个字符")
       private String projectDesc;
   }
   ```

2. **Controller使用`@Validated`触发校验**
   ```java
   @PostMapping
   public AjaxResult add(@Validated @RequestBody BamsProject project) {
       // 参数校验失败会自动返回错误信息
       return toAjax(projectService.insertProject(project));
   }
   ```

3. **常用校验注解**
   | 注解 | 适用场景 | 示例 |
   |-----|---------|------|
   | `@NotNull` | 不能为null | 必填字段 |
   | `@NotBlank` | 不能为null且不能为空字符串 | 文本必填 |
   | `@Size` | 字符串长度限制 | `@Size(max=200)` |
   | `@DecimalMin/Max` | 数值范围限制 | 经纬度、百分比 |
   | `@Digits` | 数值精度限制 | `@Digits(integer=3, fraction=6)` |
   | `@Pattern` | 正则表达式校验 | 手机号、邮箱 |

#### 💡 最佳实践

- 在字段上定义校验注解，不要在getter方法上定义（避免重复）
- 自定义友好的错误提示信息
- 对于复杂业务校验，在Service层补充校验逻辑

---

### 缓存使用规范

#### ✅ 必须遵守

1. **查询缓存使用`@Cacheable`**
   ```java
   @Cacheable(value = "bams:project", key = "#projectId", unless = "#result == null")
   public BamsProject selectProjectById(Long projectId) {
       return projectMapper.selectProjectById(projectId);
   }
   ```

2. **更新/删除时使用`@CacheEvict`清除缓存**
   ```java
   // 单条记录更新
   @CacheEvict(value = "bams:project", key = "#project.projectId")
   public int updateProject(BamsProject project) {
       return projectMapper.updateProject(project);
   }

   // 批量删除清除所有缓存
   @CacheEvict(value = "bams:project", allEntries = true)
   public int deleteProjectByIds(Long[] projectIds) {
       return projectMapper.deleteProjectByIds(projectIds);
   }
   ```

3. **缓存命名规范**
   - 格式：`模块:实体`，如 `bams:project`、`bams:template`
   - 使用冒号分隔，便于Redis分组管理

4. **缓存策略**
   | 场景 | 策略 | 示例 |
   |-----|------|------|
   | 查询单条记录 | `@Cacheable` | 根据ID查询 |
   | 查询列表 | 不缓存 | 列表查询条件多变 |
   | 更新单条 | `@CacheEvict(key)` | 清除指定key |
   | 批量更新/删除 | `@CacheEvict(allEntries=true)` | 清除所有 |

#### 💡 最佳实践

- 缓存时间建议：5-15分钟（在Redis配置中设置）
- 使用`unless = "#result == null"`避免缓存null值
- 频繁变化的数据不要缓存
- 大对象（>1MB）不建议缓存

#### ⚠️ 注意事项

- 缓存穿透：查询不存在的数据，应返回空对象而非null
- 缓存雪崩：设置随机过期时间，避免同时失效
- 缓存一致性：先更新数据库，再删除缓存

---

### 异常处理规范

#### ✅ 必须遵守

1. **业务异常使用`ServiceException`**
   ```java
   if (template == null) {
       throw new ServiceException("阶段模板不存在");
   }

   if ("1".equals(template.getStatus())) {
       throw new ServiceException("该模板已停用，无法应用");
   }
   ```

2. **全局异常处理器处理常见异常**
   ```java
   @RestControllerAdvice
   public class GlobalExceptionHandler {

       // 业务异常
       @ExceptionHandler(ServiceException.class)
       public AjaxResult handleServiceException(ServiceException e) {
           return AjaxResult.error(e.getMessage());
       }

       // 数据库唯一约束冲突
       @ExceptionHandler(DuplicateKeyException.class)
       public AjaxResult handleDuplicateKeyException(DuplicateKeyException e) {
           if (e.getMessage().contains("project_code")) {
               return AjaxResult.error("项目编号已存在，请重试");
           }
           return AjaxResult.error("数据已存在，请检查唯一性约束");
       }

       // 参数校验异常
       @ExceptionHandler(MethodArgumentNotValidException.class)
       public AjaxResult handleValidException(MethodArgumentNotValidException e) {
           String message = e.getBindingResult().getFieldError() != null
               ? e.getBindingResult().getFieldError().getDefaultMessage()
               : "参数校验失败";
           return AjaxResult.error(message);
       }
   }
   ```

3. **异常处理原则**
   - 可预见的业务异常：抛出`ServiceException`，友好提示
   - 不可预见的系统异常：记录日志，返回通用错误
   - 参数校验异常：自动处理，返回校验错误信息

#### 💡 最佳实践

- 异常信息要对用户友好，避免暴露技术细节
- 关键异常必须记录日志（`log.error()`）
- 根据异常类型提取关键信息，提供针对性提示

---

### 并发安全规范

#### ✅ 必须遵守

1. **自动生成唯一编号使用乐观锁重试机制**
   ```java
   private String generateProjectCode() {
       String prefix = "XMB";
       int maxRetry = 3;

       for (int retry = 0; retry < maxRetry; retry++) {
           try {
               String maxCode = projectMapper.selectMaxCode();
               int sequence = extractSequence(maxCode) + 1;
               String projectCode = prefix + String.format("%03d", sequence);

               // 验证编号可用性
               if (projectMapper.checkUnique(projectCode) == null) {
                   return projectCode;
               }

               // 添加随机延迟避免冲突
               if (retry < maxRetry - 1) {
                   Thread.sleep(50 + (long)(Math.random() * 50));
               }
           } catch (InterruptedException e) {
               Thread.currentThread().interrupt();
               throw new ServiceException("生成编号被中断");
           }
       }
       throw new ServiceException("生成编号失败，请稍后重试");
   }
   ```

2. **并发场景禁止事项**
   - ❌ 禁止直接使用递增序列号（会有并发问题）
   - ❌ 禁止使用`synchronized`（分布式场景无效）
   - ❌ 禁止无限重试（应设置最大重试次数）

3. **并发安全方案选择**
   | 场景 | 推荐方案 | 说明 |
   |-----|---------|------|
   | 唯一编号生成 | 乐观锁重试 | 本项目采用 |
   | 库存扣减 | 数据库行锁 | `SELECT FOR UPDATE` |
   | 分布式场景 | Redis分布式锁 | Redisson |
   | 数据库序列 | 原生序列 | MySQL 8.0+ |

#### 💡 最佳实践

- 重试次数：3-5次
- 重试延迟：50-100ms + 随机延迟
- 失败后返回友好提示，让用户重试

---

### 数据库设计规范

#### ✅ 必须遵守

1. **不使用外键约束，由应用层保证数据完整性**
   ```sql
   -- ❌ 错误：使用外键级联删除
   ALTER TABLE `bams_project_stage`
     ADD CONSTRAINT `fk_project_stage`
     FOREIGN KEY (`project_id`)
     REFERENCES `bams_project` (`project_id`)
     ON DELETE CASCADE;

   -- ✅ 正确：不使用外键，在代码中控制
   -- 注意：不使用外键约束，改由应用层控制数据一致性
   -- 原因：
   -- 1. 系统采用逻辑删除机制，外键级联删除与逻辑删除冲突
   -- 2. 避免误删除导致数据无法恢复
   -- 3. 提高系统灵活性和性能
   ```

2. **索引设计规范**
   ```sql
   -- 主键索引
   PRIMARY KEY (`project_id`),

   -- 唯一索引（业务唯一字段）
   UNIQUE KEY `uk_project_code` (`project_code`),

   -- 普通索引（常用查询字段）
   KEY `idx_project_name` (`project_name`),
   KEY `idx_template_id` (`template_id`),
   KEY `idx_create_time` (`create_time`),
   KEY `idx_del_flag` (`del_flag`)
   ```

3. **索引使用原则**
   - ✅ 主键、唯一约束字段必须建索引
   - ✅ 外键关联字段建议建索引
   - ✅ WHERE、ORDER BY常用字段建索引
   - ❌ 不在低选择性字段建索引（如性别）
   - ❌ 不在频繁更新的字段建索引

4. **逻辑删除规范**
   ```sql
   `del_flag` char(1) DEFAULT '0' COMMENT '删除标志（0存在 2删除）'

   -- 查询时过滤已删除数据
   WHERE del_flag = '0'

   -- 删除时标记删除
   UPDATE table SET del_flag = '2' WHERE id = ?
   ```

#### 💡 最佳实践

- 字段长度：varchar根据实际需要设置，不要一律varchar(255)
- 数值精度：金额使用decimal，百分比使用int存储（0-100）
- 时间字段：使用datetime，不使用timestamp（范围限制）
- 注释完整：每个表、每个字段都要有清晰的注释

#### ⚠️ 禁止事项

- ❌ 禁止使用SELECT * （明确指定字段）
- ❌ 禁止在生产环境使用外键约束
- ❌ 禁止使用前导模糊查询（%keyword%），考虑使用全文索引
- ❌ 禁止在大表上执行无where条件的更新/删除

---

### 事务管理规范

#### ✅ 必须遵守

1. **事务边界设计原则**
   ```java
   @Transactional
   public int updateProject(BamsProject project) {
       // 1. 先执行可能失败的操作（如参数校验、数据库更新）
       int rows = projectMapper.updateProject(project);
       if (rows == 0) {
           throw new ServiceException("项目更新失败");
       }

       // 2. 再执行后续操作（如应用模板）
       if (templateChanged) {
           applyStageTemplate(project.getProjectId(), newTemplateId);
       }

       return rows;
   }
   ```

2. **事务使用规范**
   - Service层方法添加`@Transactional`
   - 只读操作使用`@Transactional(readOnly = true)`
   - 事务方法尽量简短，避免长事务
   - 不要在事务中调用外部接口

3. **事务传播行为**
   ```java
   // 默认：加入现有事务
   @Transactional

   // 总是新建事务
   @Transactional(propagation = Propagation.REQUIRES_NEW)

   // 不使用事务
   @Transactional(propagation = Propagation.NOT_SUPPORTED)
   ```

#### ⚠️ 注意事项

- 事务方法必须是public
- 同类调用事务不生效（self-invocation问题）
- 异常必须是RuntimeException才会回滚
- 长事务会锁表，影响性能

---

## 前端开发规范

### 组件设计规范

#### ✅ 必须遵守

1. **使用函数式组件 + Hooks**
   ```tsx
   // ✅ 正确：函数式组件
   const ProjectForm = ({ project, onClose }: ProjectFormProps) => {
       const [loading, setLoading] = useState(false);
       // ...
   };

   // ❌ 错误：类组件（不推荐）
   class ProjectForm extends React.Component { }
   ```

2. **组件职责单一**
   - 表单组件：仅负责表单展示和提交
   - 列表组件：仅负责数据展示和操作
   - 不要在一个组件中混合多个业务逻辑

3. **Props类型定义**
   ```tsx
   interface ProjectFormProps {
       project: ProjectType | null;
       onClose: () => void;
   }

   const ProjectForm: React.FC<ProjectFormProps> = ({ project, onClose }) => {
       // ...
   };
   ```

#### 💡 最佳实践

- 复杂组件拆分成多个小组件
- 使用TypeScript提供类型安全
- Props使用接口定义，不使用any
- 组件文件名使用PascalCase（如`ProjectForm.tsx`）

---

### 性能优化规范

#### ✅ 必须遵守

1. **使用React.memo避免不必要渲染**
   ```tsx
   const ProjectForm = memo(({ project, onClose }: ProjectFormProps) => {
       // 组件逻辑
   });

   ProjectForm.displayName = 'ProjectForm';
   ```

2. **使用useCallback缓存事件处理函数**
   ```tsx
   const handleDelete = useCallback((record: ProjectType) => {
       Modal.confirm({
           title: '确认删除',
           onOk: async () => {
               await deleteProject([record.projectId!]);
               actionRef.current?.reload();
           },
       });
   }, []); // 依赖数组为空，函数不会重新创建

   const handleExport = useCallback(async () => {
       await exportData(searchParams);
   }, [searchParams]); // 依赖searchParams
   ```

3. **使用useMemo缓存计算结果**
   ```tsx
   // 缓存计算函数
   const getCompletenessColor = useMemo(() => {
       return (completeness: number) => {
           if (completeness >= 90) return 'success';
           if (completeness >= 70) return 'normal';
           return 'exception';
       };
   }, []);

   // 缓存复杂对象
   const columns = useMemo(() => [
       { title: '项目编号', dataIndex: 'projectCode' },
       { title: '项目名称', dataIndex: 'projectName' },
       // ...
   ], [handleEdit, handleDelete]);
   ```

4. **性能优化决策树**
   ```
   是否需要优化？
   ├─ 组件频繁渲染？ → React.memo
   ├─ 函数作为Props传递？ → useCallback
   ├─ 复杂计算结果？ → useMemo
   ├─ 大列表渲染？ → 虚拟列表(react-window)
   └─ 首屏加载慢？ → 代码分割(lazy + Suspense)
   ```

#### 💡 最佳实践

- 不要过度优化（premature optimization）
- 使用React DevTools Profiler检测性能问题
- 优先优化渲染次数多的组件
- 依赖数组要精确，避免遗漏或冗余

#### ⚠️ 注意事项

- useCallback/useMemo本身有开销，简单组件不需要
- 依赖数组不能遗漏，否则可能引用旧值（stale closure）
- memo仅做浅比较，复杂对象props需自定义比较函数

---

### 类型定义规范

#### ✅ 必须遵守

1. **统一API响应类型**
   ```typescript
   /** API统一响应类型 */
   export type ApiResponse<T = any> = {
       code: number;
       msg: string;
       data?: T;
   };

   /** 分页响应类型 */
   export type PageResult<T = any> = {
       code: number;
       msg: string;
       total: number;
       rows: T[];
   };
   ```

2. **所有API函数添加返回类型**
   ```typescript
   // ✅ 正确：明确返回类型
   export async function getProjectList(
       params: ProjectListParams
   ): Promise<PageResult<ProjectType>> {
       return request('/api/bams/project/list', { method: 'GET', params });
   }

   // ❌ 错误：没有返回类型
   export async function getProjectList(params: any) {
       return request('/api/bams/project/list', { method: 'GET', params });
   }
   ```

3. **参数类型定义**
   ```typescript
   /** 项目查询参数类型 */
   export type ProjectListParams = PageParams & {
       projectCode?: string;
       projectName?: string;
       projectManager?: string;
       params?: {
           beginTime?: string;
           endTime?: string;
       };
   };

   // 使用
   export async function getProjectList(
       params: ProjectListParams
   ): Promise<PageResult<ProjectType>> { }
   ```

4. **类型定义规范**
   - 统一响应类型：`ApiResponse<T>`、`PageResult<T>`
   - 查询参数类型：继承`PageParams`
   - 实体类型：与后端实体对应
   - 表单类型：可选字段使用`?`

#### 💡 最佳实践

- 类型定义文件与API文件分离（大型项目）
- 使用泛型提高类型复用性
- 复杂类型使用`type`，简单对象使用`interface`
- 导出类型供其他模块使用

#### ⚠️ 禁止事项

- ❌ 禁止使用`any`类型（特殊情况除外）
- ❌ 禁止忽略TypeScript错误（`@ts-ignore`）
- ❌ 禁止定义冗余类型（应复用已有类型）

---

### 用户体验规范

#### ✅ 必须遵守

1. **高风险操作必须二次确认**
   ```tsx
   // 删除确认
   const handleDelete = useCallback((record: ProjectType) => {
       Modal.confirm({
           title: '确认删除',
           content: `确定要删除项目"${record.projectName}"吗？`,
           okText: '确定',
           cancelText: '取消',
           okType: 'danger',
           onOk: async () => {
               await deleteProject([record.projectId!]);
               message.success('删除成功');
           },
       });
   }, []);

   // 模板切换确认
   const handleTemplateChange = (value: number) => {
       if (project && originalTemplateId && value !== originalTemplateId) {
           Modal.confirm({
               title: '警告',
               content: '切换模板将删除原有的阶段配置，确定要继续吗？',
               okText: '确定',
               cancelText: '取消',
               okType: 'danger',
               onOk: () => {
                   form.setFieldsValue({ templateId: value });
               },
               onCancel: () => {
                   form.setFieldsValue({ templateId: originalTemplateId });
               },
           });
       }
   };
   ```

2. **操作反馈规范**
   ```tsx
   // 成功提示
   message.success('操作成功');

   // 错误提示
   message.error('操作失败');

   // 加载状态
   const [loading, setLoading] = useState(false);
   setLoading(true);
   try {
       await saveData();
   } finally {
       setLoading(false);
   }
   ```

3. **表单校验规范**
   ```tsx
   <Form.Item
       name="projectName"
       label="项目名称"
       rules={[
           { required: true, message: '请输入项目名称' },
           { max: 200, message: '项目名称不能超过200个字符' },
       ]}
   >
       <Input placeholder="请输入项目名称" />
   </Form.Item>
   ```

#### 💡 最佳实践

- 高危操作：删除、批量操作、不可逆操作
- 确认框使用`okType: 'danger'`标识危险操作
- 操作成功后自动关闭弹窗、刷新列表
- 错误提示要清晰，帮助用户定位问题

---

### API调用规范

#### ✅ 必须遵守

1. **统一错误处理**
   ```tsx
   try {
       const response = await addProject(values);
       message.success('新增成功');
       onClose();
   } catch (error: any) {
       message.error(error.msg || '操作失败');
   }
   ```

2. **Loading状态管理**
   ```tsx
   const [loading, setLoading] = useState(false);

   const handleSubmit = async () => {
       setLoading(true);
       try {
           await saveData();
       } catch (error) {
           // 错误处理
       } finally {
           setLoading(false); // 确保loading状态重置
       }
   };
   ```

3. **避免重复请求**
   ```tsx
   // 使用防抖
   import { debounce } from 'lodash';

   const handleSearch = useMemo(
       () => debounce((value: string) => {
           fetchData(value);
       }, 300),
       []
   );
   ```

---

## 通用规范

### 代码审查检查清单

#### 后端代码审查清单

- [ ] **架构设计**
  - [ ] 是否遵循三层架构（Controller-Service-Mapper）
  - [ ] 层级职责是否明确，无跨层调用
  - [ ] 实体类是否继承BaseEntity

- [ ] **数据校验**
  - [ ] 是否使用Bean Validation注解
  - [ ] Controller是否添加@Validated
  - [ ] 校验错误提示是否友好

- [ ] **缓存策略**
  - [ ] 查询方法是否添加@Cacheable
  - [ ] 更新/删除是否添加@CacheEvict
  - [ ] 缓存key命名是否规范

- [ ] **异常处理**
  - [ ] 业务异常是否使用ServiceException
  - [ ] 关键异常是否记录日志
  - [ ] 异常信息是否用户友好

- [ ] **并发安全**
  - [ ] 唯一编号生成是否线程安全
  - [ ] 是否有并发冲突风险
  - [ ] 是否添加了重试机制

- [ ] **数据库设计**
  - [ ] 是否移除了外键约束
  - [ ] 索引是否合理
  - [ ] 是否使用逻辑删除
  - [ ] 字段注释是否完整

- [ ] **事务管理**
  - [ ] 事务边界是否合理
  - [ ] 事务方法是否简短
  - [ ] 是否避免长事务

#### 前端代码审查清单

- [ ] **组件设计**
  - [ ] 是否使用函数式组件
  - [ ] Props是否有类型定义
  - [ ] 组件职责是否单一

- [ ] **性能优化**
  - [ ] 是否使用React.memo
  - [ ] 事件处理函数是否使用useCallback
  - [ ] 复杂计算是否使用useMemo

- [ ] **类型定义**
  - [ ] API函数是否有返回类型
  - [ ] 参数类型是否明确
  - [ ] 是否避免使用any

- [ ] **用户体验**
  - [ ] 高风险操作是否二次确认
  - [ ] 是否有操作反馈（成功/失败提示）
  - [ ] 表单是否有校验规则
  - [ ] 是否有Loading状态

- [ ] **API调用**
  - [ ] 是否统一错误处理
  - [ ] 是否管理Loading状态
  - [ ] 是否避免重复请求

---

### 提交规范

#### Commit Message格式

```
<标题>

## 一、<模块名称>

### <子模块1>
- 修改内容1
- 修改内容2

### <子模块2>
- 修改内容1

## 二、<其他改进>
- 改进1
- 改进2

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

#### 标题规范

- 功能开发：`完成XXX模块开发`
- Bug修复：`修复XXX问题`
- 优化：`优化XXX性能`
- 重构：`重构XXX模块`

#### 内容规范

- 详细说明修改内容
- 分类组织（后端、前端、数据库等）
- 包含文件路径和行号（重要修改）
- 说明改进效果（性能提升、问题修复等）

---

## 附录

### 常用工具推荐

#### 后端工具
- **代码质量**: SonarQube, Alibaba Java Coding Guidelines
- **性能分析**: JProfiler, Arthas
- **API文档**: SpringDoc (Swagger 3.0)

#### 前端工具
- **代码检查**: ESLint, Prettier
- **类型检查**: TypeScript
- **性能分析**: React DevTools Profiler
- **打包分析**: webpack-bundle-analyzer

### 学习资源

#### 后端
- [Spring Boot官方文档](https://spring.io/projects/spring-boot)
- [MyBatis官方文档](https://mybatis.org/mybatis-3/)
- [Alibaba Java开发手册](https://github.com/alibaba/p3c)

#### 前端
- [React官方文档](https://react.dev/)
- [TypeScript官方文档](https://www.typescriptlang.org/)
- [Ant Design官方文档](https://ant.design/)

---

**文档维护**：本文档应随项目发展持续更新，每次重大代码审查后应补充新的规范和最佳实践。

**最后更新时间**: 2025-11-18
