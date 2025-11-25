# 文件上传路径问题 - 已解决

## 🐛 问题描述

上传新版本文件时出现错误：
```
文件上传失败：java.io.FileNotFoundException: 
/private/var/folders/k2/kq3wb8fj4ml6h5jk25l47xm40000gn/T/tomcat.8080.12912103210862396179/work/Tomcat/localhost/ROOT/./uploadPath/archive/4/2025/11/24/微信图片_20251122212416_13_56_1763947252207.png 
(No such file or directory)
```

## 🔍 问题原因

### 配置使用了相对路径
```yaml
# application.yml (错误配置)
ruoyi:
  profile: ./uploadPath  # ❌ 相对路径
```

### 为什么会失败？

1. **相对路径的解析**：
   - 相对路径 `./uploadPath` 会相对于**当前工作目录**解析
   - 在不同的启动方式下，工作目录可能不同

2. **Tomcat 的工作目录**：
   - 使用 `java -jar` 启动时，工作目录通常是 JAR 文件所在目录
   - 但 Tomcat 可能会将工作目录设置为临时目录
   - 导致文件被上传到 Tomcat 的临时目录：`/private/var/folders/.../tomcat.../work/...`

3. **临时目录的问题**：
   - Tomcat 重启后临时目录会被清空
   - 文件会丢失
   - 路径不可预测

## ✅ 解决方案

### 使用绝对路径

```yaml
# application.yml (正确配置)
ruoyi:
  profile: /Users/rick/Documents/GitHub/BusStopArchive/uploadPath  # ✅ 绝对路径
```

### 修改步骤

1. **恢复原始文件**：
   ```bash
   git checkout ruoyi-admin/src/main/resources/application.yml
   ```

2. **修改配置**：
   ```bash
   sed -i '' 's|profile: ./uploadPath|profile: /Users/rick/Documents/GitHub/BusStopArchive/uploadPath|' \
     ruoyi-admin/src/main/resources/application.yml
   ```

3. **创建目录**：
   ```bash
   mkdir -p uploadPath/archive
   ```

4. **重启后端**：
   ```bash
   ./backend.sh restart
   ```

## 📁 文件存储结构

```
BusStopArchive/
├── uploadPath/                    # 文件上传根目录
│   ├── archive/                   # 档案文件目录
│   │   ├── 4/                     # 档案 ID
│   │   │   └── 2025/11/24/        # 日期路径
│   │   │       └── xxx.jpg        # 实际文件
│   │   └── 5/
│   │       └── 2025/11/24/
│   └── temp/                      # 临时文件目录
│       └── 2025-11-24/
└── ...
```

## 🔧 后端代码逻辑

### 文件上传路径构建

```java
// BamsArchiveVersionServiceImpl.java

@Value("${ruoyi.profile}")
private String uploadPath;  // 从配置读取：/Users/rick/.../uploadPath

private String uploadFile(MultipartFile file, String subDir) throws IOException {
    // 1. 生成文件名
    String datePath = LocalDate.now().toString().replace("-", "/");  // 2025/11/24
    String fileName = datePath + "/" + baseName + "_" + System.currentTimeMillis() + extension;
    
    // 2. 构建完整路径
    String fullPath = uploadPath + "/" + subDir + "/" + fileName;
    // 结果：/Users/rick/.../uploadPath/archive/4/2025/11/24/xxx_timestamp.jpg
    
    // 3. 创建目录
    File destFile = new File(fullPath);
    if (!destFile.getParentFile().exists()) {
        destFile.getParentFile().mkdirs();  // 自动创建所有父目录
    }
    
    // 4. 保存文件
    file.transferTo(destFile);
    
    // 5. 返回相对路径（存入数据库）
    return "/" + subDir + "/" + fileName;
    // 结果：/archive/4/2025/11/24/xxx_timestamp.jpg
}
```

### 文件预览路径构建

```java
// BamsArchiveVersionController.java

@GetMapping("/preview/{versionId}")
public void preview(@PathVariable Long versionId, HttpServletResponse response) {
    // 1. 查询版本信息
    BamsArchiveVersion version = service.selectBamsArchiveVersionByVersionId(versionId);
    // version.getFilePath() = "/archive/4/2025/11/24/xxx.jpg"
    
    // 2. 拼接完整路径
    String filePath = RuoYiConfig.getProfile() + version.getFilePath();
    // 结果：/Users/rick/.../uploadPath/archive/4/2025/11/24/xxx.jpg
    
    // 3. 读取文件
    File file = new File(filePath);
    // ...
}
```

## 🎯 优势

### 使用绝对路径的好处

1. **路径可预测**：
   - ✅ 文件始终存储在固定位置
   - ✅ 不受启动方式影响

2. **文件持久化**：
   - ✅ Tomcat 重启后文件不会丢失
   - ✅ 便于备份和迁移

3. **易于管理**：
   - ✅ 可以直接在文件系统中查看文件
   - ✅ 便于清理和维护

## ⚠️ 注意事项

### 1. 权限问题

确保应用有权限在指定目录创建文件：
```bash
# 检查目录权限
ls -ld /Users/rick/Documents/GitHub/BusStopArchive/uploadPath

# 如果需要，修改权限
chmod 755 /Users/rick/Documents/GitHub/BusStopArchive/uploadPath
```

### 2. 磁盘空间

定期检查磁盘空间，避免文件过多导致磁盘满：
```bash
# 检查目录大小
du -sh /Users/rick/Documents/GitHub/BusStopArchive/uploadPath

# 检查磁盘使用情况
df -h
```

### 3. 备份策略

建议定期备份 `uploadPath` 目录：
```bash
# 备份示例
tar -czf uploadPath_backup_$(date +%Y%m%d).tar.gz uploadPath/
```

### 4. 不同环境配置

可以使用 Spring Profile 为不同环境配置不同的路径：

```yaml
# application-dev.yml (开发环境)
ruoyi:
  profile: /Users/rick/Documents/GitHub/BusStopArchive/uploadPath

# application-prod.yml (生产环境)
ruoyi:
  profile: /data/bams/uploadPath
```

## 🧪 测试验证

### 测试步骤

1. **上传文件**：
   - 进入档案详情页面
   - 点击"上传新版本"
   - 选择文件并上传

2. **检查文件位置**：
   ```bash
   ls -lR /Users/rick/Documents/GitHub/BusStopArchive/uploadPath/archive/
   ```

3. **验证预览**：
   - 点击文件预览
   - 确认文件正常显示

### 预期结果

- ✅ 文件成功上传
- ✅ 文件存储在正确的目录
- ✅ 文件可以正常预览
- ✅ 文件路径不包含 Tomcat 临时目录

## 📝 总结

### 问题
- ❌ 使用相对路径 `./uploadPath`
- ❌ 文件被上传到 Tomcat 临时目录
- ❌ Tomcat 重启后文件丢失

### 解决方案
- ✅ 使用绝对路径 `/Users/rick/.../uploadPath`
- ✅ 文件存储在项目目录下
- ✅ 文件持久化，不会丢失

### 修改内容
- 修改了 `application.yml` 中的 `ruoyi.profile` 配置
- 创建了 `uploadPath/archive` 目录
- 重启了后端服务

---

**问题已解决！现在可以正常上传文件了。** 🎉
