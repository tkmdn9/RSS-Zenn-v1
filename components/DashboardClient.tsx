// components/DashboardClient.tsx

'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { ZennArticle, TopicType, ArticleSource } from '@/types/article';
import { FilterBar } from './FilterBar';
import { ArticleGrid } from './ArticleGrid';
import { TopicConfigPanel } from './TopicConfigPanel';
import { SourceTab } from './SourceTab';
import { useTopicStore } from '@/hooks/useTopicStore';

interface DashboardClientProps {
  initialArticles: ZennArticle[];
}

/**
 * Dashboard Client コンポーネント
 * 
 * useTopicStoreを統合し、動的トピック管理・フィルタリング・記事再取得を管理
 * ソース切り替え（Zenn / Qiita）に対応し、各ソースのフィルタ状態を保持する
 */
export function DashboardClient({ initialArticles }: DashboardClientProps) {
  const [activeSource, setActiveSource] = useState<ArticleSource>('zenn');
  const { topics, addTopic, removeTopic, isLoading: topicsLoading } = useTopicStore(activeSource);
  const [articles, setArticles] = useState<ZennArticle[]>(initialArticles);
  const [selectedTopics, setSelectedTopics] = useState<TopicType[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  // ソースごとのフィルタ状態を保持するref
  const filterStateRef = useRef<Record<ArticleSource, TopicType[]>>({
    zenn: [],
    qiita: [],
  });

  const allTopicTypes = useMemo(() => topics.map(t => t.type), [topics]);

  // ソース切り替えハンドラ: 現在のフィルタ状態を保存し、新ソースのフィルタ状態を復元
  const handleSourceChange = useCallback((newSource: ArticleSource) => {
    // 現在のソースのフィルタ状態を保存
    filterStateRef.current[activeSource] = selectedTopics;
    // 新しいソースに切り替え
    setActiveSource(newSource);
    // 新しいソースのフィルタ状態を復元
    setSelectedTopics(filterStateRef.current[newSource]);
  }, [activeSource, selectedTopics]);

  // フィルタ変更時にrefも同期
  const handleFilterChange = useCallback((newSelectedTopics: TopicType[]) => {
    setSelectedTopics(newSelectedTopics);
    filterStateRef.current[activeSource] = newSelectedTopics;
  }, [activeSource]);

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
      {/* ソース切り替えタブ */}
      <SourceTab activeSource={activeSource} onSourceChange={handleSourceChange} />

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
        onFilterChange={handleFilterChange}
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
