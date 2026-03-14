// lib/normalizeArticle.ts

import type Parser from 'rss-parser';
import type { ZennArticle, TopicType } from '@/types/article';
import { createHash } from 'crypto';

/**
 * RSSアイテムをZennArticle形式に正規化する
 * 
 * 要件:
 * - 2.1: 生のRSSデータをZennArticleオブジェクトに変換
 * - 2.2: id、title、link、pubDate、author、thumbnailを抽出
 * - 2.3: ソースフィードに基づいて正しいTopic値を割り当て
 * - 2.4: 必須フィールドが欠落している場合、デフォルト値を使用
 * - 2.5: すべてのpubDate値が有効なISO 8601日付文字列であることを保証
 * 
 * @param item - rss-parserから取得したRSSアイテム
 * @param topic - 記事のトピックタイプ
 * @returns 正規化されたZennArticle
 */
export function normalizeArticle(
  item: Parser.Item,
  topic: TopicType
): ZennArticle {
  // 必須フィールドの抽出とデフォルト値の設定（要件2.2, 2.4）
  const link = item.link || '';
  const title = item.title || 'Untitled';
  const author = item.creator || 'Unknown';
  
  // 日付のISO 8601形式への変換（要件2.5）
  let pubDate: string;
  if (item.isoDate) {
    // isoDateが既にISO 8601形式で提供されている場合
    pubDate = item.isoDate;
  } else if (item.pubDate) {
    // pubDateから変換
    try {
      pubDate = new Date(item.pubDate).toISOString();
    } catch {
      // 無効な日付の場合は現在時刻を使用
      pubDate = new Date().toISOString();
    }
  } else {
    // 日付が提供されていない場合は現在時刻を使用
    pubDate = new Date().toISOString();
  }
  
  // サムネイル画像の抽出（オプションフィールド、要件2.4）
  const thumbnail = item.enclosure?.url || '';
  
  // 一意なIDの生成（要件2.2）
  // link + pubDateのハッシュを使用して一意性を保証
  const id = generateArticleId(link, pubDate);
  
  // ZennArticleオブジェクトの構築（要件2.1, 2.3）
  return {
    id,
    title,
    link,
    pubDate,
    author,
    topic, // 要件2.3: 指定されたトピックを割り当て
    thumbnail,
  };
}

/**
 * 記事の一意なIDを生成する
 * link + pubDateのSHA-256ハッシュを使用
 * 
 * @param link - 記事URL
 * @param pubDate - ISO 8601形式の公開日時
 * @returns 一意な記事ID
 */
function generateArticleId(link: string, pubDate: string): string {
  const hash = createHash('sha256');
  hash.update(`${link}${pubDate}`);
  return hash.digest('hex');
}
