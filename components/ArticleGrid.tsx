// components/ArticleGrid.tsx

'use client';

import { ZennArticle, TopicType } from '@/types/article';
import { ArticleCard } from './ArticleCard';
import { useReadStatus } from '@/hooks/useReadStatus';

interface ArticleGridProps {
  articles: ZennArticle[];
  allTopicTypes?: TopicType[];
}

/**
 * Article Grid コンポーネント
 * 
 * 記事をレスポンシブなグリッドレイアウトで表示するコンポーネント
 * 
 * 要件:
 * - 6.1: レスポンシブなグリッドレイアウトで記事を表示
 * - 6.2: 各記事のタイトル、著者、公開日、トピック、サムネイルを表示
 * - 6.4: Tailwind CSSを使用したスタイリング
 * - 6.5: ビューポート幅に基づいて列数を調整
 * - 7.4: 既読/未読の視覚的区別
 */
export function ArticleGrid({ articles, allTopicTypes = [] }: ArticleGridProps) {
  const { markAsRead, isRead } = useReadStatus();

  // 記事がない場合のメッセージ
  if (articles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500 text-lg">記事が見つかりませんでした</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          isRead={isRead(article.id)}
          onClick={() => markAsRead(article.id)}
          allTopicTypes={allTopicTypes}
        />
      ))}
    </div>
  );
}
