import { BreakpointTest } from '../components/BreakpointTest';
import { LayoutDemo } from '../components/LayoutDemo';

export default function BreakpointTestPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            智能响应式断点系统测试
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            验证精确断点定义 (768px, 1024px, 1280px) 和三种布局模式
          </p>
        </div>

        {/* 断点系统测试 */}
        <BreakpointTest />

        {/* 布局演示 */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            布局演示
          </h2>
          <div className="h-96">
            <LayoutDemo />
          </div>
        </div>
      </div>
    </div>
  );
}