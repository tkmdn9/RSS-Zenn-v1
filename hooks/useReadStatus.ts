'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * localStorageのキー
 */
const STORAGE_KEY = 'zenn-dashboard-read-articles';

/**
 * 既読状態管理フックの戻り値
 */
export interface UseReadStatusReturn {
  /** 既読記事IDのセット */
  readArticles: Set<string>;
  /** 記事を既読としてマークする関数 */
  markAsRead: (articleId: string) => void;
  /** 記事が既読かどうかを確認する関数 */
  isRead: (articleId: string) => boolean;
}

/**
 * localStorageから既読状態を読み込む
 * エラーが発生した場合は空のSetを返す
 */
function loadReadArticles(): Set<string> {
  try {
    if (typeof window === 'undefined') {
      return new Set();
    }
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return new Set();
    }
    
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      console.warn('Invalid read articles data in localStorage');
      return new Set();
    }
    
    return new Set(parsed);
  } catch (error) {
    console.warn('Failed to load read status from localStorage:', error);
    return new Set();
  }
}

/**
 * localStorageに既読状態を保存する
 * エラーが発生した場合はログに記録するのみ
 */
function saveReadArticles(readArticles: Set<string>): void {
  try {
    if (typeof window === 'undefined') {
      return;
    }
    
    const array = Array.from(readArticles);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(array));
  } catch (error) {
    console.warn('Failed to save read status to localStorage:', error);
  }
}

/**
 * 既読状態管理フック
 * 
 * localStorageを使用して記事の既読状態を管理します。
 * - 初回レンダリング時にlocalStorageから既読状態を読み込み
 * - 記事をクリックした際に既読としてマーク
 * - 既読状態はブラウザセッションをまたいで永続化
 * 
 * @returns {UseReadStatusReturn} 既読状態と操作関数
 * 
 * @example
 * ```tsx
 * function ArticleList() {
 *   const { readArticles, markAsRead, isRead } = useReadStatus();
 *   
 *   return (
 *     <div>
 *       {articles.map(article => (
 *         <div 
 *           key={article.id}
 *           onClick={() => markAsRead(article.id)}
 *           style={{ opacity: isRead(article.id) ? 0.6 : 1 }}
 *         >
 *           {article.title}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useReadStatus(): UseReadStatusReturn {
  const [readArticles, setReadArticles] = useState<Set<string>>(new Set());

  // 初回マウント時にlocalStorageから既読状態を読み込む
  useEffect(() => {
    const loaded = loadReadArticles();
    setReadArticles(loaded);
  }, []);

  /**
   * 記事を既読としてマークする
   * localStorageに保存し、状態を更新する
   */
  const markAsRead = useCallback((articleId: string) => {
    setReadArticles(prev => {
      // 既に既読の場合は何もしない
      if (prev.has(articleId)) {
        return prev;
      }
      
      // 新しいSetを作成して既読IDを追加
      const updated = new Set(prev);
      updated.add(articleId);
      
      // localStorageに保存
      saveReadArticles(updated);
      
      return updated;
    });
  }, []);

  /**
   * 記事が既読かどうかを確認する
   */
  const isRead = useCallback((articleId: string): boolean => {
    return readArticles.has(articleId);
  }, [readArticles]);

  return {
    readArticles,
    markAsRead,
    isRead,
  };
}
