// lib/sortArticles.ts

import { compareDesc } from 'date-fns';
import type { ZennArticle } from '@/types/article';

/**
 * 記事を公開日時の降順（新しい順）でソートする
 * 
 * 要件:
 * - 3.1: 記事をpubDateの降順（新しい順）でソート
 * - 3.2: 日付比較にdate-fnsライブラリを使用
 * - 3.3: 2つの記事が同じpubDateを持つ場合、ソースフィードからの相対的な順序を維持（安定ソート）
 * 
 * @param articles - ソート対象の記事配列
 * @returns 公開日時の降順でソートされた記事配列
 */
export function sortArticlesByDate(articles: ZennArticle[]): ZennArticle[] {
  // 元の配列を変更しないように、新しい配列を作成してソート
  // Array.prototype.sort()は安定ソートを保証（ES2019以降）
  return [...articles].sort((a, b) => {
    // date-fnsのcompareDescを使用して降順比較（要件3.2）
    // compareDesc: 第一引数が新しい場合は負の値、古い場合は正の値を返す
    // これにより新しい記事が前に来る（降順）（要件3.1）
    return compareDesc(new Date(a.pubDate), new Date(b.pubDate));
  });
  // 注: Array.prototype.sort()はES2019以降、安定ソートを保証しているため、
  // 同じpubDateを持つ記事の相対的な順序は維持される（要件3.3）
}
