// components/ArticleCard.tsx

'use client';

import { ZennArticle, TopicType } from '@/types/article';
import { getTopicColor } from '@/lib/topicColors';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface ArticleCardProps {
  article: ZennArticle;
  isRead: boolean;
  onClick: () => void;
  allTopicTypes: TopicType[];
}

/**
 * Article Card コンポーネント
 * 
 * 個別記事を表示するカードコンポーネント
 * 
 * 要件:
 * - 6.2: タイトル、著者、公開日、トピック、サムネイルを表示
 * - 6.3: 新しいブラウザタブで記事リンクを開く
 * - 7.4: 既読/未読の視覚的区別
 * - 12.1: 新しいタブで記事リンクを開く
 * - 12.2: target="_blank"とrel="noopener noreferrer"を設定
 * - 12.3: リンクが外部で開くことを視覚的に示す
 */
export function ArticleCard({ article, isRead, onClick, allTopicTypes }: ArticleCardProps) {
  const colors = getTopicColor(article.topic, allTopicTypes);
  
  // 日付をフォーマット
  const formattedDate = format(new Date(article.pubDate), 'yyyy年M月d日', { locale: ja });
  
  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`
        block rounded-lg border-2 ${colors.border} ${colors.background}
        transition-all duration-200 overflow-hidden
        ${isRead ? 'opacity-60' : 'opacity-100'}
        hover:shadow-lg
      `}
    >
      {/* サムネイル */}
      {article.thumbnail && (
        <div className="relative w-full h-48 bg-gray-100">
          <img
            src={article.thumbnail}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          {/* 既読バッジ */}
          {isRead && (
            <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
              既読
            </div>
          )}
        </div>
      )}
      
      {/* コンテンツ */}
      <div className="p-4">
        {/* トピックバッジ */}
        <div className="mb-2">
          <span className={`inline-block text-xs font-semibold px-2 py-1 rounded ${colors.badge}`}>
            {article.topic.toUpperCase()}
          </span>
        </div>
        
        {/* タイトル */}
        <h3 className={`text-lg font-bold mb-2 line-clamp-2 ${isRead ? 'text-gray-600' : 'text-gray-900'}`}>
          {article.title}
        </h3>
        
        {/* メタデータ */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span className="truncate">{article.author}</span>
          <span className="ml-2 whitespace-nowrap">{formattedDate}</span>
        </div>
        
        {/* 外部リンクインジケータ */}
        <div className="mt-3 flex items-center text-xs text-gray-500">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          <span>新しいタブで開く</span>
        </div>
      </div>
    </a>
  );
}
