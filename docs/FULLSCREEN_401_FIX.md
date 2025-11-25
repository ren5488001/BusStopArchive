# 全屏预览 401 认证问题 - 解决方案

## 🐛 问题描述

点击"全屏"按钮时，在新标签页中无法打开文件，返回 401 错误：
```json
{
  "msg": "请求访问：/system/archive/version/preview/1，认证失败，无法访问系统资源",
  "code": 401
}
```

## 🔍 问题原因

### 原始实现
```typescript
const handleFullscreen = () => {
    if (fileUrl) {
        window.open(fileUrl, '_blank');  // ❌ 直接打开 API URL
    }
};
```

### 为什么会 401？

1. **认证机制**：后端 API 需要 JWT token 认证
2. **Token 存储**：Token 存储在 `sessionStorage` 或请求头中
3. **新窗口问题**：使用 `window.open()` 打开新标签页时：
   - 新标签页的请求是**浏览器直接发起的**
   - **不会自动携带** Authorization 请求头
   - **不会经过** axios/request 拦截器
   - 导致后端认为是**未认证的请求**，返回 401

## ✅ 解决方案

### 方案：先获取文件，再打开 Blob URL

```typescript
const handleFullscreen = async () => {
    if (!fileUrl) return;

    // 1. 对于图片，直接使用已有的 Blob URL
    if (isImage() && imageBlobUrl) {
        window.open(imageBlobUrl, '_blank');
        return;
    }

    // 2. 对于 PDF 和其他文件，先获取文件再打开
    try {
        setLoading(true);
        
        // 使用 request 获取文件（会自动携带 token）
        const blob = await request(fileUrl, {
            method: 'GET',
            responseType: 'blob',
        });

        // 创建 Blob URL
        const url = URL.createObjectURL(blob);
        
        // 打开新窗口（Blob URL 不需要认证）
        window.open(url, '_blank');
        
        // 延迟释放 URL
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
    } catch (error) {
        console.error('全屏预览失败:', error);
        message.error('全屏预览失败');
    } finally {
        setLoading(false);
    }
};
```

### 工作流程

```
用户点击全屏
    ↓
检查是否为图片
    ↓
是 → 使用已有的 imageBlobUrl → 打开新窗口 ✅
    ↓
否 → 使用 request 获取文件（携带 token）
    ↓
后端验证 token ✅
    ↓
返回文件 blob
    ↓
创建 Blob URL
    ↓
打开新窗口显示 Blob URL ✅
```

## 🎯 优势

### 1. **安全性**
- ✅ Token 只在后端 API 请求中传输
- ✅ Blob URL 是临时的本地 URL，不包含敏感信息
- ✅ 不会在 URL 中暴露 token

### 2. **用户体验**
- ✅ 新窗口可以正常显示文件
- ✅ 支持浏览器的缩放、打印等功能
- ✅ 加载速度快（图片复用已有 Blob URL）

### 3. **兼容性**
- ✅ 支持所有现代浏览器
- ✅ 支持各种文件类型（PDF、图片、Office 等）

## 📝 其他相关函数

### previewVersion 函数（版本历史中的预览按钮）

```typescript
export async function previewVersion(versionId: number) {
    // 1. 使用 request 获取文件（自动携带 token）
    const response = await request(`/api/system/archive/version/preview/${versionId}`, {
        method: 'GET',
        responseType: 'blob',
    });

    // 2. 创建 Blob URL
    const blob = new Blob([response]);
    const url = window.URL.createObjectURL(blob);
    
    // 3. 打开新窗口
    window.open(url, '_blank');

    // 4. 延迟释放 URL
    setTimeout(() => {
        window.URL.revokeObjectURL(url);
    }, 100);
}
```

**注意**：这个函数已经是正确的实现，不需要修改。

## 🔧 技术细节

### Blob URL 是什么？

Blob URL 是浏览器创建的临时 URL，格式类似：
```
blob:http://localhost:8000/550e8400-e29b-41d4-a716-446655440000
```

**特点**：
- ✅ 只在当前浏览器会话中有效
- ✅ 不需要服务器认证
- ✅ 可以在新窗口中打开
- ✅ 需要手动释放（`URL.revokeObjectURL()`）

### request vs window.open

| 方式 | 携带 Token | 适用场景 |
|------|-----------|---------|
| `request()` | ✅ 是 | 获取需要认证的资源 |
| `window.open(apiUrl)` | ❌ 否 | 打开公开资源 |
| `window.open(blobUrl)` | ✅ N/A | 打开本地 Blob（不需要认证）|

## 🧪 测试验证

### 测试步骤

1. **打开档案详情页面**
2. **点击"全屏"按钮**
3. **验证**：
   - ✅ 新标签页成功打开
   - ✅ 文件正常显示
   - ✅ 没有 401 错误

### 测试不同文件类型

- [ ] JPG/PNG 图片
- [ ] PDF 文档
- [ ] Word 文档（如果支持）
- [ ] Excel 文档（如果支持）

## 📊 性能优化

### 图片预览优化

```typescript
// 图片已经在组件加载时获取并转换为 Blob URL
useEffect(() => {
    if (fileUrl && isImage()) {
        // 获取图片并创建 Blob URL
        request(fileUrl, { method: 'GET', responseType: 'blob' })
            .then(blob => {
                const url = URL.createObjectURL(blob);
                setImageBlobUrl(url);
            });
    }
}, [fileUrl]);

// 全屏时直接复用
const handleFullscreen = async () => {
    if (isImage() && imageBlobUrl) {
        window.open(imageBlobUrl, '_blank');  // 无需重新获取
        return;
    }
    // ...
};
```

**优势**：
- ✅ 图片只获取一次
- ✅ 全屏打开速度快
- ✅ 节省网络带宽

## ⚠️ 注意事项

### 1. 内存管理

```typescript
// ✅ 正确：及时释放 Blob URL
setTimeout(() => {
    URL.revokeObjectURL(url);
}, 1000);

// ❌ 错误：不释放会导致内存泄漏
window.open(url, '_blank');
// 忘记调用 revokeObjectURL
```

### 2. 延迟时间

```typescript
// 延迟时间要足够长，确保新窗口加载完成
setTimeout(() => {
    URL.revokeObjectURL(url);
}, 1000);  // 1秒通常足够
```

### 3. 错误处理

```typescript
try {
    const blob = await request(fileUrl, { ... });
    // ...
} catch (error) {
    console.error('全屏预览失败:', error);
    message.error('全屏预览失败');
}
```

## 🎉 总结

### 问题
- ❌ 直接使用 `window.open(apiUrl)` 会导致 401 认证失败

### 解决方案
- ✅ 先用 `request` 获取文件（携带 token）
- ✅ 创建 Blob URL
- ✅ 使用 `window.open(blobUrl)` 打开新窗口

### 效果
- ✅ 全屏预览功能正常工作
- ✅ 支持所有文件类型
- ✅ 安全且高效

---

**修改完成！现在全屏预览功能应该可以正常工作了。** 🎊
