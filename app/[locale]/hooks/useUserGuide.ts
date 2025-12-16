'use client';

import { useState, useEffect } from 'react';
import { useUserPreferences } from './useUserPreferences';

interface GuideStep {
  id: string;
  title: string;
  content: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

interface GuideConfig {
  id: string;
  name: string;
  steps: GuideStep[];
  triggerCondition?: () => boolean;
}

const GUIDE_CONFIGS: GuideConfig[] = [
  {
    id: 'first-visit',
    name: '首次访问引导',
    steps: [
      {
        id: 'welcome',
        title: '欢迎使用 QR Master',
        content: '这是一个功能强大的二维码生成工具，支持多种类型的二维码生成。让我们快速了解一下主要功能。'
      },
      {
        id: 'feature-cards',
        title: '选择二维码类型',
        content: '这里有三种不同类型的二维码：静态二维码适合网址和文本，动态验证码用于双因素认证，加密二维码保护敏感数据。',
        target: '.feature-grid'
      },
      {
        id: 'quick-generate',
        title: '快速生成',
        content: '在这里可以快速生成静态二维码，只需输入网址即可立即生成和下载。',
        target: '#quick-generate'
      },
      {
        id: 'recent-configs',
        title: '最近配置',
        content: '这里会显示您最近使用的二维码配置，方便快速重复使用。',
        target: '.recent-configs'
      }
    ],
    triggerCondition: () => {
      return !localStorage.getItem('qr-master-visited');
    }
  },
  {
    id: 'advanced-features',
    name: '高级功能引导',
    steps: [
      {
        id: 'customization',
        title: '自定义样式',
        content: '点击"更多选项"可以自定义二维码的颜色、尺寸和样式，让您的二维码更加个性化。',
        target: 'button:contains("更多选项")'
      },
      {
        id: 'keyboard-shortcuts',
        title: '键盘快捷键',
        content: '使用 Ctrl+D 快速下载，Ctrl+G 生成二维码，Shift+? 查看所有快捷键。桌面端操作更高效！'
      },
      {
        id: 'preferences',
        title: '偏好设置',
        content: '在设置中可以配置默认样式、主题模式、语言等，还可以导入导出配置。',
        target: 'button[title="偏好设置"]'
      }
    ]
  }
];

export function useUserGuide() {
  const { preferences } = useUserPreferences();
  const [activeGuide, setActiveGuide] = useState<GuideConfig | null>(null);
  const [isGuideVisible, setIsGuideVisible] = useState(false);
  const [completedGuides, setCompletedGuides] = useState<string[]>([]);

  // 加载已完成的引导
  useEffect(() => {
    const completed = localStorage.getItem('qr-master-completed-guides');
    if (completed) {
      setCompletedGuides(JSON.parse(completed));
    }
  }, []);

  // 检查是否需要显示引导
  useEffect(() => {
    if (!preferences.showTips) return;

    const checkGuides = () => {
      for (const guide of GUIDE_CONFIGS) {
        if (completedGuides.includes(guide.id)) continue;
        
        if (guide.triggerCondition && guide.triggerCondition()) {
          setActiveGuide(guide);
          setIsGuideVisible(true);
          break;
        }
      }
    };

    // 延迟检查，确保页面完全加载
    const timer = setTimeout(checkGuides, 1000);
    return () => clearTimeout(timer);
  }, [preferences.showTips, completedGuides]);

  const startGuide = (guideId: string) => {
    const guide = GUIDE_CONFIGS.find(g => g.id === guideId);
    if (guide) {
      setActiveGuide(guide);
      setIsGuideVisible(true);
    }
  };

  const completeGuide = () => {
    if (activeGuide) {
      const newCompleted = [...completedGuides, activeGuide.id];
      setCompletedGuides(newCompleted);
      localStorage.setItem('qr-master-completed-guides', JSON.stringify(newCompleted));
      
      // 标记首次访问
      if (activeGuide.id === 'first-visit') {
        localStorage.setItem('qr-master-visited', 'true');
      }
    }
    
    setIsGuideVisible(false);
    setActiveGuide(null);
  };

  const skipGuide = () => {
    setIsGuideVisible(false);
    setActiveGuide(null);
  };

  const resetGuides = () => {
    setCompletedGuides([]);
    localStorage.removeItem('qr-master-completed-guides');
    localStorage.removeItem('qr-master-visited');
  };

  return {
    activeGuide,
    isGuideVisible,
    completedGuides,
    availableGuides: GUIDE_CONFIGS,
    startGuide,
    completeGuide,
    skipGuide,
    resetGuides
  };
}

// 上下文提示管理
export function useContextualTips() {
  const [activeTips, setActiveTips] = useState<Array<{
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    duration?: number;
  }>>([]);

  const showTip = (
    message: string, 
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    duration: number = 5000
  ) => {
    const id = Date.now().toString();
    const tip = { id, message, type, duration };
    
    setActiveTips(prev => [...prev, tip]);
    
    if (duration > 0) {
      setTimeout(() => {
        dismissTip(id);
      }, duration);
    }
    
    return id;
  };

  const dismissTip = (id: string) => {
    setActiveTips(prev => prev.filter(tip => tip.id !== id));
  };

  const clearAllTips = () => {
    setActiveTips([]);
  };

  return {
    activeTips,
    showTip,
    dismissTip,
    clearAllTips
  };
}

// 功能发现提示
export function useFeatureDiscovery() {
  const [discoveredFeatures, setDiscoveredFeatures] = useState<string[]>([]);

  useEffect(() => {
    const discovered = localStorage.getItem('qr-master-discovered-features');
    if (discovered) {
      setDiscoveredFeatures(JSON.parse(discovered));
    }
  }, []);

  const markFeatureDiscovered = (featureId: string) => {
    if (!discoveredFeatures.includes(featureId)) {
      const newDiscovered = [...discoveredFeatures, featureId];
      setDiscoveredFeatures(newDiscovered);
      localStorage.setItem('qr-master-discovered-features', JSON.stringify(newDiscovered));
    }
  };

  const isFeatureDiscovered = (featureId: string) => {
    return discoveredFeatures.includes(featureId);
  };

  const resetDiscovery = () => {
    setDiscoveredFeatures([]);
    localStorage.removeItem('qr-master-discovered-features');
  };

  return {
    discoveredFeatures,
    markFeatureDiscovered,
    isFeatureDiscovered,
    resetDiscovery
  };
}