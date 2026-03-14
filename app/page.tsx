// app/page.tsx

import { fetchArticles } from '@/lib/fetchArticles';
import { DashboardClient } from '@/components/DashboardClient';
import { Suspense } from 'react';
import { SkeletonLoader } from '@/components/SkeletonLoader';

/**
 * ダッシュボードページ（Server Component）
 * 
 * 要件:
 * - 1.3: Next.js Server Componentsを使用してサーバーサイドで実行
 * - 4.2: ユーザーがトピックフィルタを選択した場合、そのトピックに一致する記事のみを表示
 * - 4.3: フィルタが選択されていない場合、すべてのトピックの記事を表示
 * - 6.3: ユーザーが記事をクリックした場合、記事リンクを新しいブラウザタブで開く
 * - 8.3: 記事データが利用可能になった場合、Skeleton_LoaderをArticle_Gridに置き換える
 */
export default async function DashboardPage() {
  // サーバーサイドで記事を取得（要件1.3）
  const result = await fetchArticles();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* エラー表示 */}
        {result.errors.length > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-yellow-800 mb-2">
              一部のフィードの取得に失敗しました
            </h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              {result.errors.map((error, index) => (
                <li key={index}>
                  <span className="font-medium">{error.topic}:</span> {error.error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* クライアントコンポーネントに記事データを渡す */}
        <DashboardClient initialArticles={result.articles} />
      </div>
    </main>
  );
}
