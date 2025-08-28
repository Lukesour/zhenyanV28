import React, { useMemo, useEffect, useCallback } from 'react';
import { Progress, Card, List, Typography, Space, Button } from 'antd';
import { CheckCircleOutlined, LoadingOutlined, ClockCircleOutlined, PlayCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import useProgressState from '../hooks/useProgressState';
import errorHandler from '../services/ErrorHandler';

const { Title, Text } = Typography;

interface ProgressDisplayProps {
  onComplete?: () => void;
  onError?: (error: string) => void;
  isActive?: boolean; // 控制进度是否激活
  onStart?: () => void; // 开始进度的回调
  onCancel?: () => void; // 取消分析回调
  onRetry?: () => void; // 重试回调
}

type StepStatus = 'pending' | 'in_progress' | 'completed' | 'error';

const ProgressDisplay: React.FC<ProgressDisplayProps> = ({ 
  onComplete, 
  onError, 
  isActive = false, 
  onStart,
  onCancel,
  onRetry
}) => {
  const [progressState, actions] = useProgressState();

  const handleStart = useCallback(() => {
    actions.start();
    onStart?.();
  }, [actions, onStart]);

  const handleCancel = useCallback(() => {
    actions.stop();
    onCancel?.();
  }, [actions, onCancel]);

  const handleRetry = useCallback(() => {
    actions.clearError();
    actions.reset();
    actions.start();
    onRetry?.();
  }, [actions, onRetry]);

  // 外部 isActive 控制开始/停止
  useEffect(() => {
    if (isActive && !progressState.isActive && !progressState.isCompleted) {
      actions.start();
    } else if (!isActive && progressState.isActive) {
      actions.stop();
    }
  }, [isActive, progressState.isActive, progressState.isCompleted, actions]);

  // 完成/错误回调
  useEffect(() => {
    if (progressState.isCompleted) {
      onComplete?.();
    }
  }, [progressState.isCompleted, onComplete]);

  useEffect(() => {
    if (progressState.hasError && progressState.errorMessage) {
      const { userMessage } = errorHandler.buildUserFacingError(progressState.errorMessage, {
        component: 'ProgressDisplay',
        action: 'progress'
      });
      onError?.(userMessage.title);
    }
  }, [progressState.hasError, progressState.errorMessage, onError]);

  const currentMessage = useMemo(() => {
    const step = progressState.steps[progressState.currentStep];
    return progressState.stepTitle || step?.message || '正在分析...';
  }, [progressState.stepTitle, progressState.steps, progressState.currentStep]);

  const getStepIcon = (step: { status: StepStatus }) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'in_progress':
        return <LoadingOutlined style={{ color: '#1890ff' }} />;
      case 'error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  const getStepDescription = (step: { message?: string; title: string }) => {
    return step.message || step.title;
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={3}>AI 分析进行中</Title>
            <Text type="secondary">{progressState.estimatedTime || '预计需要 3-5 分钟'}</Text>
          </div>

          {!progressState.isActive && !isActive && !progressState.isCompleted && !progressState.hasError && !progressState.isStopped && (
            <div style={{ textAlign: 'center' }}>
              <Button 
                type="primary" 
                size="large" 
                icon={<PlayCircleOutlined />}
                onClick={handleStart}
                disabled={progressState.isActive}
              >
                开始分析
              </Button>
            </div>
          )}

          <div>
            <Progress
              percent={progressState.percentage}
              status={progressState.hasError ? 'exception' : (progressState.isCompleted || progressState.percentage >= 100 ? 'success' : 'active')}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
              strokeWidth={10}
              showInfo
              format={(percent) => `${Math.round(percent ?? 0)}%`}
              style={{ marginBottom: 16 }}
            />
            
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <Text strong style={{ fontSize: 16 }}>
                {currentMessage}
              </Text>
            </div>
          </div>

          <Card size="small" title="分析步骤" style={{ backgroundColor: '#fafafa' }}>
            <List
              size="small"
              dataSource={progressState.steps}
              renderItem={(step) => (
                <List.Item>
                  <Space>
                    {getStepIcon(step)}
                    <div>
                      <Text strong={step.status === 'in_progress'}>
                        {step.title}
                      </Text>
                      {step.status !== 'pending' && (
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {getStepDescription(step)}
                          </Text>
                        </div>
                      )}
                    </div>
                  </Space>
                </List.Item>
              )}
            />
          </Card>

          {/* 控制区域：取消 / 重试 / 状态提示 */}
          <div style={{ textAlign: 'center' }}>
            {progressState.isActive && (
              <Space>
                <Button danger onClick={handleCancel}>取消分析</Button>
              </Space>
            )}

            {!progressState.isActive && (progressState.hasError || progressState.isStopped) && !progressState.isCompleted && (
              <Space direction="vertical">
                {progressState.hasError && (
                  <Text type="danger">{progressState.errorMessage || '分析出错，请重试'}</Text>
                )}
                {progressState.isStopped && !progressState.hasError && (
                  <Text type="secondary">已取消分析</Text>
                )}
                <Button type="primary" onClick={handleRetry}>重新开始</Button>
              </Space>
            )}

            {progressState.isCompleted && (
              <Text type="success">分析完成</Text>
            )}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {progressState.estimatedTime || '预计需要 3-5 分钟'}
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default ProgressDisplay;
