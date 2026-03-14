// lib/__tests__/sortArticles.test.ts

import { sortArticlesByDate } from '../sortArticles';
import type { ZennArticle } from '@/types/article';

describe('sortArticlesByDate', () => {
  // テスト用のヘルパー関数：記事を作成
  const createArticle = (id: string, pubDate: string): ZennArticle => ({
    id,
    title: `Article ${id}`,
    link: `https://example.com/${id}`,
    pubDate,
    author: 'Test Author',
    topic: 'claudecode',
    thumbnail: '',
  });

  test('記事を公開日時の降順（新しい順）でソートする', () => {
    const articles: ZennArticle[] = [
      createArticle('1', '2024-01-01T00:00:00.000Z'),
      createArticle('2', '2024-01-03T00:00:00.000Z'),
      createArticle('3', '2024-01-02T00:00:00.000Z'),
    ];

    const sorted = sortArticlesByDate(articles);

    expect(sorted[0].id).toBe('2'); // 2024-01-03（最新）
    expect(sorted[1].id).toBe('3'); // 2024-01-02
    expect(sorted[2].id).toBe('1'); // 2024-01-01（最古）
  });

  test('同じ日付の記事は元の順序を維持する（安定ソート）', () => {
    const articles: ZennArticle[] = [
      createArticle('1', '2024-01-01T00:00:00.000Z'),
      createArticle('2', '2024-01-01T00:00:00.000Z'),
      createArticle('3', '2024-01-01T00:00:00.000Z'),
    ];

    const sorted = sortArticlesByDate(articles);

    // 同じ日付なので、元の順序が維持される
    expect(sorted[0].id).toBe('1');
    expect(sorted[1].id).toBe('2');
    expect(sorted[2].id).toBe('3');
  });

  test('空の配列を渡すと空の配列を返す', () => {
    const sorted = sortArticlesByDate([]);
    expect(sorted).toEqual([]);
  });

  test('単一の記事を渡すとそのまま返す', () => {
    const articles: ZennArticle[] = [
      createArticle('1', '2024-01-01T00:00:00.000Z'),
    ];

    const sorted = sortArticlesByDate(articles);

    expect(sorted).toHaveLength(1);
    expect(sorted[0].id).toBe('1');
  });

  test('元の配列を変更しない', () => {
    const articles: ZennArticle[] = [
      createArticle('1', '2024-01-01T00:00:00.000Z'),
      createArticle('2', '2024-01-03T00:00:00.000Z'),
      createArticle('3', '2024-01-02T00:00:00.000Z'),
    ];

    const originalOrder = articles.map(a => a.id);
    sortArticlesByDate(articles);

    // 元の配列は変更されていない
    expect(articles.map(a => a.id)).toEqual(originalOrder);
  });

  test('異なる時刻を持つ同じ日付の記事を正しくソートする', () => {
    const articles: ZennArticle[] = [
      createArticle('1', '2024-01-01T10:00:00.000Z'),
      createArticle('2', '2024-01-01T15:00:00.000Z'),
      createArticle('3', '2024-01-01T05:00:00.000Z'),
    ];

    const sorted = sortArticlesByDate(articles);

    expect(sorted[0].id).toBe('2'); // 15:00（最新）
    expect(sorted[1].id).toBe('1'); // 10:00
    expect(sorted[2].id).toBe('3'); // 05:00（最古）
  });
});
