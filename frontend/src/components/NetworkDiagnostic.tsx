import React, { useState } from 'react';
import { Card, Button, Alert, Space, Typography, Spin } from 'antd';
import { WifiOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { apiService } from '../services/api';
import { API_BASE_URL } from '../config';

const { Text } = Typography;

interface NetworkDiagnosticProps {
  onClose?: () => void;
}

const NetworkDiagnostic: React.FC<NetworkDiagnosticProps> = ({ onClose }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const runDiagnostic = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await apiService.testConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusIcon = () => {
    if (!testResult) return null;
    return testResult.success ? (
      <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '24px' }} />
    ) : (
      <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '24px' }} />
    );
  };

  const getStatusColor = () => {
    if (!testResult) return 'info';
    return testResult.success ? 'success' : 'error';
  };

  const getStatusMessage = () => {
    if (!testResult) return '点击"开始诊断"按钮测试网络连接';
    return testResult.success ? '网络连接正常' : '网络连接失败';
  };

  return (
    <Card
      title={
        <Space>
          <WifiOutlined />
          <span>网络连接诊断</span>
        </Space>
      }
      extra={onClose && <Button size="small" onClick={onClose}>关闭</Button>}
      style={{ maxWidth: 600, margin: '20px auto' }}
    >
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          当前 API 端点: <code>{API_BASE_URL}</code>
        </Text>
      </div>

      <Space direction="vertical" style={{ width: '100%' }}>
        <Button
          type="primary"
          onClick={runDiagnostic}
          loading={isTesting}
          icon={<WifiOutlined />}
          size="large"
          block
        >
          {isTesting ? '正在诊断...' : '开始诊断'}
        </Button>

        {testResult && (
          <Alert
            message={getStatusMessage()}
            type={getStatusColor() as any}
            showIcon
            icon={getStatusIcon()}
            description={
              <div>
                {testResult.success ? (
                  <div>
                    <p>✅ 连接成功</p>
                    <p>响应时间: {testResult.responseTime}ms</p>
                    <p>API 状态: {testResult.data?.status || 'unknown'}</p>
                  </div>
                ) : (
                  <div>
                    <p>❌ 连接失败</p>
                    <p>错误信息: {testResult.error}</p>
                    <p>请检查:</p>
                    <ul>
                      <li>后端服务是否正在运行</li>
                      <li>Cloudflare Tunnel 是否正常工作</li>
                      <li>防火墙设置是否允许连接</li>
                    </ul>
                  </div>
                )}
              </div>
            }
          />
        )}

        {isTesting && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>正在测试网络连接...</Text>
            </div>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default NetworkDiagnostic;
