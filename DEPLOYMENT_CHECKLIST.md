# 部署检查清单

## 问题描述
前端部署到 Cloudflare Pages 后，无法连接到本地运行的后端服务，显示"分析失败 Network Error"。

## 解决方案

### 1. 确保 Cloudflare Tunnel 正确运行

```bash
# 检查 tunnel 状态
cloudflared tunnel list

# 运行 tunnel
cloudflared tunnel run zhenyanasia

# 检查 tunnel 配置
cat cloudflared_config.yml
```

**预期输出**: Tunnel 应该显示为 "Active" 状态，并且有连接建立。

### 2. 验证域名解析

确保以下域名正确解析到你的 tunnel：
- `zhenyan.asia` → 前端
- `api.zhenyan.asia` → 后端

```bash
# 测试域名解析
nslookup api.zhenyan.asia
curl -I https://api.zhenyan.asia/health
```

### 3. 检查后端服务状态

```bash
# 检查后端是否正在运行
ps aux | grep uvicorn

# 检查端口是否被监听
netstat -tlnp | grep :8000

# 测试本地 API
curl http://127.0.0.1:8000/health
```

### 4. 验证 CORS 配置

后端 CORS 配置应该包含：
- `https://zhenyan.asia`
- `https://www.zhenyan.asia`
- `https://*.pages.dev` (Cloudflare Pages 开发域名)

### 5. 前端配置检查

确保 `frontend/src/config.ts` 中的 API 配置正确：

```typescript
// 生产环境应该使用
return 'https://api.zhenyan.asia';
```

### 6. 网络诊断

使用前端新添加的网络诊断功能：
1. 在错误页面点击"网络诊断"按钮
2. 运行诊断测试
3. 检查连接结果和错误信息

### 7. 常见问题排查

#### 问题 1: Tunnel 连接失败
**症状**: `cloudflared tunnel run` 显示连接错误
**解决**: 检查网络连接，确保可以访问 Cloudflare 服务

#### 问题 2: 域名无法访问
**症状**: `nslookup` 或 `curl` 失败
**解决**: 检查 DNS 配置，确保域名指向正确的 tunnel

#### 问题 3: CORS 错误
**症状**: 浏览器控制台显示 CORS 错误
**解决**: 检查后端 CORS 配置，确保包含前端域名

#### 问题 4: 超时错误
**症状**: 请求超时或长时间无响应
**解决**: 检查后端服务性能，可能需要增加超时时间

### 8. 测试步骤

1. **本地测试**: 确保本地前后端可以正常通信
2. **Tunnel 测试**: 通过 tunnel 访问后端 API
3. **前端测试**: 部署前端并测试完整流程
4. **监控日志**: 观察后端和 tunnel 的日志输出

### 9. 联系支持

如果问题持续存在：
1. 收集错误日志和网络诊断结果
2. 检查 Cloudflare 控制台中的 tunnel 状态
3. 联系技术支持并提供详细信息

## 预防措施

1. **定期检查**: 定期验证 tunnel 和域名配置
2. **监控日志**: 设置日志监控，及时发现连接问题
3. **备份配置**: 保存所有配置文件，便于快速恢复
4. **测试流程**: 建立完整的测试流程，确保部署质量
