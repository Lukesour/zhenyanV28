import React, { useState } from 'react';
import { Alert, Button, Space, Typography } from 'antd';
import { ExclamationCircleOutlined, ReloadOutlined, WifiOutlined } from '@ant-design/icons';
import NetworkDiagnostic from './NetworkDiagnostic';

const { Text } = Typography;

interface ErrorDisplayProps {
  errorMessage: string;
  onRetry?: () => void;
  onBackToForm?: () => void;
  showRetry?: boolean;
  showBack?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  errorMessage,
  onRetry,
  onBackToForm,
  showRetry = true,
  showBack = true,
}) => {
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px' }}>
      <Alert
        message="分析失败"
        description={
          <div>
            <Text type="danger">{errorMessage}</Text>
            <div style={{ marginTop: 16 }}>
              <Space>
                {showRetry && onRetry && (
                  <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={onRetry}
                  >
                    重新尝试
                  </Button>
                )}
                {showBack && onBackToForm && (
                  <Button onClick={onBackToForm}>
                    返回修改
                  </Button>
                )}
                <Button
                  icon={<WifiOutlined />}
                  onClick={() => setShowDiagnostic(!showDiagnostic)}
                >
                  网络诊断
                </Button>
              </Space>
            </div>
          </div>
        }
        type="error"
        showIcon
        icon={<ExclamationCircleOutlined />}
        style={{ marginBottom: 16 }}
      />
      
      {showDiagnostic && (
        <NetworkDiagnostic />
      )}
      
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <Text type="secondary">
          如果问题持续存在，请联系客服获得帮助
        </Text>
        <div style={{ marginTop: 10 }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            💡 提示：AI分析通常需要3-5分钟，请耐心等待
          </Text>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;

