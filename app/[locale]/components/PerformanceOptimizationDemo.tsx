import { useState, useEffect } from 'react';
import { RealTimeQRPreview } from './RealTimeQRPreview';
import { PerformanceDashboard } from './PerformanceDashboard';
import { useRealTimePreview } from '../hooks/useRealTimePreview';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

export function PerformanceOptimizationDemo() {
  const [testContent, setTestContent] = useState('');
  const [showDashboard, setShowDashboard] = useState(false);
  
  const {
    config,
    previewData,
    isGenerating,
    progress,
    generationTime,
    updateContent,
    getPerformanceStats,
    clearCache
  } = useRealTimePreview();
  
  const [stats, setStats] = useState<any>(null);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getPerformanceStats());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [getPerformanceStats]);
  
  const runPerformanceTest = () => {
    const testStrings = [
      'https://example.com',
      'Hello World',
      'Performance Test 1',
      'Performance Test 2',
      'Performance Test 3',
      'https://github.com',
      'Test QR Code Generation',
      'Optimized Performance',
      'Cache Test',
      'Final Test'
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < testStrings.length) {
        updateContent(testStrings[index]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 500);
  };
  
  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>实时生成性能优化演示</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={testContent}
              onChange={(e) => {
                setTestContent(e.target.value);
                updateContent(e.target.value);
              }}
              placeholder="输入内容测试实时生成..."
              className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Button onClick={runPerformanceTest}>
              运行性能测试
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowDashboard(!showDashboard)}
            >
              {showDashboard ? '隐藏' : '显示'}性能面板
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">实时预览</h3>
              <RealTimeQRPreview
                config={config}
                showProgress={true}
                showPerformanceStats={true}
                className="w-full max-w-[300px] aspect-square"
              />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">性能指标</h3>
              <div className="space-y-3">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    生成状态
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>状态:</span>
                      <span className={isGenerating ? 'text-yellow-600' : 'text-green-600'}>
                        {isGenerating ? '生成中' : '完成'}
                      </span>
                    </div>
                    {progress && (
                      <>
                        <div className="flex justify-between">
                          <span>阶段:</span>
                          <span>{progress.message}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>进度:</span>
                          <span>{progress.progress}%</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span>最近生成时间:</span>
                      <span>{generationTime ? `${Math.round(generationTime)}ms` : '-'}</span>
                    </div>
                  </div>
                </div>
                
                {stats && (
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      累计统计
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>总生成次数:</span>
                        <span>{stats.generationCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>缓存大小:</span>
                        <span>{stats.cacheSize}</span>
                      </div>
                      {stats.stats && (
                        <>
                          <div className="flex justify-between">
                            <span>平均时间:</span>
                            <span>{stats.stats.average}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span>P95时间:</span>
                            <span>{stats.stats.p95}ms</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearCache}
                  className="w-full"
                >
                  清理缓存
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {showDashboard && (
        <PerformanceDashboard 
          showMemory={true}
          showCache={true}
          refreshInterval={1000}
        />
      )}
    </div>
  );
}