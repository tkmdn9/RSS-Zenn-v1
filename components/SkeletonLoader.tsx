// components/SkeletonLoader.tsx

'use client';

interface SkeletonLoaderProps {
  count?: number;
}

/**
 * Skeleton Loader コンポーネント
 * 
 * データ読み込み中に表示するプレースホルダーUIコンポーネント
 * 
 * 要件:
 * - 8.1: 記事を取得している間、DashboardはSkeleton_Loaderを表示
 * - 8.2: Article_Gridレイアウトに一致するプレースホルダーカードを表示
 * - 8.4: 視覚的フィードバックのためにTailwind CSSアニメーションを使用
 */
export function SkeletonLoader({ count = 8 }: SkeletonLoaderProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

/**
 * Skeleton Card コンポーネント
 * 
 * 個別のスケルトンカードを表示
 * ArticleCardのレイアウトに一致したプレースホルダー
 */
function SkeletonCard() {
  return (
    <div className="block rounded-lg border-2 border-gray-200 overflow-hidden animate-pulse">
      {/* サムネイルプレースホルダー */}
      <div className="w-full h-48 bg-gray-200" />
      
      {/* コンテンツプレースホルダー */}
      <div className="p-4">
        {/* トピックバッジプレースホルダー */}
        <div className="mb-2">
          <div className="inline-block h-5 w-20 bg-gray-200 rounded" />
        </div>
        
        {/* タイトルプレースホルダー */}
        <div className="mb-2 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-full" />
          <div className="h-5 bg-gray-200 rounded w-3/4" />
        </div>
        
        {/* メタデータプレースホルダー */}
        <div className="flex items-center justify-between mt-3">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-28" />
        </div>
        
        {/* 外部リンクインジケータプレースホルダー */}
        <div className="mt-3 flex items-center">
          <div className="h-3 bg-gray-200 rounded w-32" />
        </div>
      </div>
    </div>
  );
}
