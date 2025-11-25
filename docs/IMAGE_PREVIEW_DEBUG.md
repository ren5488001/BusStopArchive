# 图片预览问题诊断指南

## 🔍 问题描述
JPG 图片无法在预览区域显示

## 📋 诊断步骤

### 1. 打开浏览器开发者工具
- 按 F12 或右键 -> 检查
- 切换到 **Console（控制台）** 标签

### 2. 查看控制台日志
打开档案详情页面后，应该看到类似这样的日志：

```
设置预览 URL: /api/system/archive/version/preview/1
文件信息: {
  versionId: 1,
  fileName: "微信图片_20251113172802_10_56.jpg",
  fileType: "JPG",
  filePath: "/archive/4/2025/11/21/微信图片_20251113172802_10_56_20251121215920A002.jpg"
}
文件扩展名: jpg
```

### 3. 检查网络请求
- 切换到 **Network（网络）** 标签
- 刷新页面
- 查找预览 API 请求：`preview/1`

#### 检查项：
- ✅ **请求 URL**: 应该是 `http://localhost:8080/api/system/archive/version/preview/1`
- ✅ **请求方法**: GET
- ✅ **状态码**: 应该是 200
- ✅ **响应类型**: 应该是 `image/jpeg`
- ✅ **响应大小**: 应该显示图片大小（如 29.9 KB）

### 4. 常见问题排查

#### 问题 A: 404 Not Found
**原因**: API 路径不正确或文件不存在

**解决方案**:
1. 检查后端日志，确认文件路径
2. 确认文件确实存在于服务器上
3. 检查 `RuoYiConfig.getProfile()` 配置

#### 问题 B: 403 Forbidden
**原因**: 权限不足

**解决方案**:
1. 确认用户有 `system:archive:query` 权限
2. 检查 Spring Security 配置

#### 问题 C: 500 Internal Server Error
**原因**: 后端处理出错

**解决方案**:
1. 查看后端日志
2. 检查文件路径拼接是否正确
3. 确认文件读取权限

#### 问题 D: 图片请求成功但不显示
**原因**: 
- CORS 跨域问题
- Content-Type 不正确
- 认证 token 未携带

**解决方案**:
已在前端使用 `request` 方法获取图片，会自动携带 token

## 🔧 当前实现方式

### 前端
```typescript
// 1. 构建预览 URL
const previewUrl = `/api/system/archive/version/preview/${versionId}`;

// 2. 使用 request 获取图片（自动携带 token）
request(fileUrl, {
  method: 'GET',
  responseType: 'blob',
})
.then((blob: Blob) => {
  const url = URL.createObjectURL(blob);
  setImageBlobUrl(url);
})
```

### 后端
```java
@GetMapping("/preview/{versionId}")
public void preview(@PathVariable Long versionId, HttpServletResponse response) {
    // 1. 查询版本信息
    BamsArchiveVersion version = bamsArchiveVersionService.selectBamsArchiveVersionByVersionId(versionId);
    
    // 2. 拼接完整文件路径
    String filePath = RuoYiConfig.getProfile() + version.getFilePath();
    // 例如: /uploadPath + /archive/4/2025/11/21/xxx.jpg
    
    // 3. 读取文件并输出
    File file = new File(filePath);
    // ...
}
```

## 🎯 快速测试

### 测试 1: 直接访问预览 API
在浏览器地址栏输入：
```
http://localhost:8080/api/system/archive/version/preview/1
```

**预期结果**: 
- 浏览器直接显示图片
- 或提示下载（如果 Content-Disposition 设置不对）

**如果失败**:
- 检查后端日志
- 确认文件路径是否正确

### 测试 2: 检查文件路径
在后端添加日志：
```java
String filePath = RuoYiConfig.getProfile() + version.getFilePath();
logger.info("完整文件路径: {}", filePath);
logger.info("文件是否存在: {}", new File(filePath).exists());
```

## 📝 解决方案建议

### 方案 1: 后端添加 fileUrl 字段（推荐）

**后端修改**:
```java
// BamsArchiveVersion.java
private String fileUrl;  // 新增字段

// BamsArchiveVersionServiceImpl.java
public BamsArchiveVersion selectBamsArchiveVersionByVersionId(Long versionId) {
    BamsArchiveVersion version = mapper.selectBamsArchiveVersionByVersionId(versionId);
    if (version != null) {
        // 构建预览 URL
        version.setFileUrl("/api/system/archive/version/preview/" + versionId);
    }
    return version;
}
```

**前端使用**:
```typescript
if (currentVersion.fileUrl) {
    setPreviewFileUrl(currentVersion.fileUrl);
}
```

### 方案 2: 前端构建 URL（当前方案）

**优点**: 不需要改后端
**缺点**: URL 构建逻辑分散

当前已实现：
```typescript
const previewUrl = `/api/system/archive/version/preview/${currentVersion.versionId}`;
```

## 🐛 常见错误

### 错误 1: 文件路径拼接错误
```java
// ❌ 错误
String filePath = RuoYiConfig.getProfile() + version.getFilePath();
// 结果: /uploadPath/archive/4/... (少了一个斜杠)

// ✅ 正确
String filePath = RuoYiConfig.getProfile() + version.getFilePath();
// 确保 getProfile() 返回 /uploadPath 或 /uploadPath/
// 确保 filePath 以 / 开头
```

### 错误 2: Content-Type 设置错误
```java
// ❌ 错误
response.setContentType("application/octet-stream");  // 会触发下载

// ✅ 正确
response.setContentType("image/jpeg");  // 浏览器会显示图片
response.setHeader("Content-Disposition", "inline");  // 在线预览
```

## 📞 下一步操作

1. **打开浏览器控制台**
2. **进入档案详情页面**
3. **查看控制台日志**
4. **检查网络请求**
5. **提供以下信息**:
   - 控制台日志截图
   - 网络请求详情截图
   - 后端日志（如果有错误）

这样我可以帮您精准定位问题！
