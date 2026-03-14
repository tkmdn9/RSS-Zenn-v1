// app/loading.tsx

import { SkeletonLoader } from '@/components/SkeletonLoader';

/**
 * ローディング状態コンポーネント
 * 
 * ダッシュボードページの初期読み込み中に表示されるUI
 * 
 * 要件:
 * - 8.1: 記事を取得している間、DashboardはSkeleton_Loaderを表示
 */
export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Barのスケルトン */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-40" />
            <div className="flex gap-2">
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded-lg w-32" />
            ))}
          </div>
        </div>

        {/* 記事数表示のスケルトン */}
        <div className="mb-4">
          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
        </div>

        {/* Article Gridのスケルトン */}
        <SkeletonLoader count={8} />
      </div>
    </main>
  );
}
