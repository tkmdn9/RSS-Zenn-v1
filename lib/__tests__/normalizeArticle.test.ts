// lib/__tests__/normalizeArticle.test.ts

import { normalizeArticle } from '../normalizeArticle';
import type Parser from 'rss-parser';
import type { TopicType } from '@/types/article';

describe('normalizeArticle', () => {
  describe('要件2.1, 2.2: RSSデータをZennArticleオブジェクトに変換', () => {
    it('すべてのフィールドが存在する場合、正しく変換される', () => {
      const item: Parser.Item = {
        link: 'https://zenn.dev/example/articles/test-article',
        title: 'Test Article',
        creator: 'Test Author',
        isoDate: '2024-01-15T10:30:00.000Z',
        enclosure: {
          url: 'https://example.com/thumbnail.jpg',
        },
      };
      const topic: TopicType = 'claudecode';

      const result = normalizeArticle(item, topic);

      expect(result).toMatchObject({
        title: 'Test Article',
        link: 'https://zenn.dev/example/articles/test-article',
        pubDate: '2024-01-15T10:30:00.000Z',
        author: 'Test Author',
        topic: 'claudecode',
        thumbnail: 'https://example.com/thumbnail.jpg',
      });
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
      expect(result.id.length).toBeGreaterThan(0);
    });
  });

  describe('要件2.3: トピック割り当ての正確性', () => {
    it('指定されたトピックが正しく割り当てられる', () => {
      const item: Parser.Item = {
        link: 'https://zenn.dev/example/articles/test',
        title: 'Test',
      };

      const topics: TopicType[] = ['claudecode', 'skills', 'mcp', 'rag'];
      
      topics.forEach((topic) => {
        const result = normalizeArticle(item, topic);
        expect(result.topic).toBe(topic);
      });
    });
  });

  describe('要件2.4: 欠落フィールドのデフォルト値', () => {
    it('titleが欠落している場合、"Untitled"が設定される', () => {
      const item: Parser.Item = {
        link: 'https://zenn.dev/example/articles/test',
      };

      const result = normalizeArticle(item, 'claudecode');

      expect(result.title).toBe('Untitled');
    });

    it('linkが欠落している場合、空文字列が設定される', () => {
      const item: Parser.Item = {
        title: 'Test Article',
      };

      const result = normalizeArticle(item, 'claudecode');

      expect(result.link).toBe('');
    });

    it('creatorが欠落している場合、"Unknown"が設定される', () => {
      const item: Parser.Item = {
        link: 'https://zenn.dev/example/articles/test',
        title: 'Test Article',
      };

      const result = normalizeArticle(item, 'claudecode');

      expect(result.author).toBe('Unknown');
    });

    it('thumbnailが欠落している場合、空文字列が設定される', () => {
      const item: Parser.Item = {
        link: 'https://zenn.dev/example/articles/test',
        title: 'Test Article',
      };

      const result = normalizeArticle(item, 'claudecode');

      expect(result.thumbnail).toBe('');
    });

    it('すべてのフィールドが欠落している場合、デフォルト値が設定される', () => {
      const item: Parser.Item = {};

      const result = normalizeArticle(item, 'claudecode');

      expect(result.title).toBe('Untitled');
      expect(result.link).toBe('');
      expect(result.author).toBe('Unknown');
      expect(result.thumbnail).toBe('');
      expect(result.topic).toBe('claudecode');
      expect(result.pubDate).toBeDefined();
      expect(result.id).toBeDefined();
    });
  });

  describe('要件2.5: ISO 8601日付形式の保証', () => {
    it('isoDateが提供されている場合、そのまま使用される', () => {
      const item: Parser.Item = {
        link: 'https://zenn.dev/example/articles/test',
        title: 'Test Article',
        isoDate: '2024-01-15T10:30:00.000Z',
      };

      const result = normalizeArticle(item, 'claudecode');

      expect(result.pubDate).toBe('2024-01-15T10:30:00.000Z');
      expect(() => new Date(result.pubDate)).not.toThrow();
    });

    it('pubDateが提供されている場合、ISO 8601形式に変換される', () => {
      const item: Parser.Item = {
        link: 'https://zenn.dev/example/articles/test',
        title: 'Test Article',
        pubDate: 'Mon, 15 Jan 2024 10:30:00 GMT',
      };

      const result = normalizeArticle(item, 'claudecode');

      expect(result.pubDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(() => new Date(result.pubDate)).not.toThrow();
      expect(new Date(result.pubDate).toISOString()).toBe(result.pubDate);
    });

    it('日付が提供されていない場合、現在時刻がISO 8601形式で設定される', () => {
      const item: Parser.Item = {
        link: 'https://zenn.dev/example/articles/test',
        title: 'Test Article',
      };

      const beforeTest = new Date();
      const result = normalizeArticle(item, 'claudecode');
      const afterTest = new Date();

      expect(result.pubDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(() => new Date(result.pubDate)).not.toThrow();
      
      const resultDate = new Date(result.pubDate);
      expect(resultDate.getTime()).toBeGreaterThanOrEqual(beforeTest.getTime());
      expect(resultDate.getTime()).toBeLessThanOrEqual(afterTest.getTime());
    });

    it('無効な日付形式の場合、現在時刻がISO 8601形式で設定される', () => {
      const item: Parser.Item = {
        link: 'https://zenn.dev/example/articles/test',
        title: 'Test Article',
        pubDate: 'invalid-date-string',
      };

      const beforeTest = new Date();
      const result = normalizeArticle(item, 'claudecode');
      const afterTest = new Date();

      expect(result.pubDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(() => new Date(result.pubDate)).not.toThrow();
      
      const resultDate = new Date(result.pubDate);
      expect(resultDate.getTime()).toBeGreaterThanOrEqual(beforeTest.getTime());
      expect(resultDate.getTime()).toBeLessThanOrEqual(afterTest.getTime());
    });
  });

  describe('一意なIDの生成', () => {
    it('同じlink + pubDateの組み合わせは同じIDを生成する', () => {
      const item: Parser.Item = {
        link: 'https://zenn.dev/example/articles/test',
        title: 'Test Article',
        isoDate: '2024-01-15T10:30:00.000Z',
      };

      const result1 = normalizeArticle(item, 'claudecode');
      const result2 = normalizeArticle(item, 'claudecode');

      expect(result1.id).toBe(result2.id);
    });

    it('異なるlinkは異なるIDを生成する', () => {
      const item1: Parser.Item = {
        link: 'https://zenn.dev/example/articles/test1',
        title: 'Test Article',
        isoDate: '2024-01-15T10:30:00.000Z',
      };
      const item2: Parser.Item = {
        link: 'https://zenn.dev/example/articles/test2',
        title: 'Test Article',
        isoDate: '2024-01-15T10:30:00.000Z',
      };

      const result1 = normalizeArticle(item1, 'claudecode');
      const result2 = normalizeArticle(item2, 'claudecode');

      expect(result1.id).not.toBe(result2.id);
    });

    it('異なるpubDateは異なるIDを生成する', () => {
      const item1: Parser.Item = {
        link: 'https://zenn.dev/example/articles/test',
        title: 'Test Article',
        isoDate: '2024-01-15T10:30:00.000Z',
      };
      const item2: Parser.Item = {
        link: 'https://zenn.dev/example/articles/test',
        title: 'Test Article',
        isoDate: '2024-01-16T10:30:00.000Z',
      };

      const result1 = normalizeArticle(item1, 'claudecode');
      const result2 = normalizeArticle(item2, 'claudecode');

      expect(result1.id).not.toBe(result2.id);
    });
  });
});
