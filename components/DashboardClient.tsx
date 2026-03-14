// components/DashboardClient.tsx

'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { ZennArticle, TopicType } from '@/types/article';
import { FilterBar } from './FilterBar';
import { ArticleGrid } from './ArticleGrid';
import { TopicConfigPanel } from './TopicConfigPanel';
import { useTopicStore } from '@/hooks/useTopicStore';

interface DashboardClientProps {
  initialArticles: ZennArticle[];
}

/**
 * Dashboard Client コンポーネント
 * 
 * useTopicStoreを統合し、動的トピック管理・フィルタリング・記事再取得を管理
 */
export function DashboardClient({ initialArticles }: DashboardClientProps) {
  const { topics, addTopic, removeTopic, isLoading: topicsLoading } = useTopicStore();
  const [articles, setArticles] = useState<ZennArticle[]>(initialArticles);
  const [selectedTopics, setSelectedTopics] = useState<TopicType[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const allTopicTypes = useMemo(() => topics.map(t => t.type), [topics]);

  // トピック変更時に記事を再取得
  const fetchArticlesForTopics = useCallback(async () => {
    if (topicsLoading || topics.length === 0) return;
    setIsFetching(true);
    try {
      const topicsParam = encodeURIComponent(JSON.stringify(topics));
      const res = await fetch(`/api/articles?topics=${topicsParam}`);
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setIsFetching(false);
    }
  }, [topics, topicsLoading]);

  // トピック変更時に再取得（初回ロード後）
  useEffect(() => {
    if (!topicsLoading) {
      fetchArticlesForTopics();
    }
  }, [fetchArticlesForTopics, topicsLoading]);

  // フィルタリングされた記事
  const filteredArticles = useMemo(() => {
    if (selectedTopics.length === 0) return articles;
    return articles.filter(article => selectedTopics.includes(article.topic));
  }, [articles, selectedTopics]);

  return (
    <>
      {/* トピック管理パネル */}
      <TopicConfigPanel
        topics={topics}
        onAddTopic={addTopic}
        onRemoveTopic={removeTopic}
        allTopicTypes={allTopicTypes}
      />

      {/* Filter Bar */}
      <FilterBar
        topics={allTopicTypes}
        selectedTopics={selectedTopics}
        onFilterChange={setSelectedTopics}
        allTopicTypes={allTopicTypes}
      />

      {/* 記事数の表示 */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {isFetching ? '記事を取得中...' : `${filteredArticles.length}件の記事を表示中`}
          {selectedTopics.length > 0 && ` (${selectedTopics.length}個のトピックでフィルタ)`}
        </p>
      </div>

      {/* Article Grid */}
      <ArticleGrid articles={filteredArticles} allTopicTypes={allTopicTypes} />
    </>
  );
}
