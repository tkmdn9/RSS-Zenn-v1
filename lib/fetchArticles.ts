// lib/fetchArticles.ts

import Parser from 'rss-parser';
import type { ZennArticle, TopicConfig, TopicType } from '@/types/article';
import { normalizeArticle } from './normalizeArticle';
import { sortArticlesByDate } from './sortArticles';

/**
 * 記事取得結果
 */
export interface FetchArticlesResult {
  /** 取得・正規化・ソート済みの記事配列 */
  articles: ZennArticle[];
  /** 取得中に発生したエラーのリスト */
  errors: Array<{ topic: string; error: string }>;
}

/**
 * 複数のZenn RSSフィードから記事を取得し、正規化・ソートする
 * 
 * 要件:
 * - 1.1: NEXT_PUBLIC_TOPICS環境変数で指定されたRSSフィードから記事を取得
 * - 1.2: RSSフィードが利用できない場合、エラーをログに記録し、他のフィードからの取得を継続
 * - 1.3: Next.js Server Componentsを使用してサーバーサイドで実行
 * - 1.4: 取得が完了した場合、生の記事データをArticle_Normalizerに返す
 * - 1.5: rss-parserライブラリを使用してRSSフィードのXMLを解析
 * - 10.1: NEXT_PUBLIC_TOPICS環境変数からトピック設定を読み取る
 * - 10.2: NEXT_PUBLIC_TOPICS変数はname、url、typeプロパティを持つトピックオブジェクトのJSON配列を含む
 * - 10.4: 各トピックが有効なTopicType値を持つことを検証
 * - 10.5: 無効なトピック設定が検出された場合、警告をログに記録し、そのトピックをスキップ
 * 
 * @returns 記事配列とエラーリストを含む結果オブジェクト
 * @throws 環境変数が未定義または無効な場合
 */
export async function fetchArticles(topicConfigs?: TopicConfig[]): Promise<FetchArticlesResult> {
  let topics: TopicConfig[];

  if (topicConfigs) {
    // 引数が渡された場合はそれを使用
    topics = topicConfigs;
  } else {
    // 環境変数からトピック設定を読み取る（要件10.1）
    const topicsEnv = process.env.NEXT_PUBLIC_TOPICS;
    
    if (!topicsEnv) {
      throw new Error('NEXT_PUBLIC_TOPICS environment variable is not defined');
    }
    
    // JSON形式のトピック設定をパース（要件10.2）
    try {
      topics = JSON.parse(topicsEnv);
    } catch (error) {
      throw new Error('Invalid NEXT_PUBLIC_TOPICS format: must be valid JSON');
    }
    
    // トピック設定の検証
    if (!Array.isArray(topics)) {
      throw new Error('NEXT_PUBLIC_TOPICS must be an array');
    }
  }
  
  // rss-parserのインスタンスを作成（要件1.5）
  const parser = new Parser();
  
  // エラーリストを初期化
  const errors: Array<{ topic: string; error: string }> = [];
  
  // すべての記事を格納する配列
  const allArticles: ZennArticle[] = [];
  
  // 各トピックのRSSフィードから記事を取得（要件1.1）
  for (const topicConfig of topics) {
    // トピック設定の検証（要件10.4, 10.5）
    if (!isValidTopicConfig(topicConfig)) {
      const warningMsg = `Invalid topic configuration: ${JSON.stringify(topicConfig)}. Skipping.`;
      console.warn(warningMsg);
      const topicName = (topicConfig as any)?.name || 'unknown';
      errors.push({ topic: topicName, error: warningMsg });
      continue;
    }
    
    try {
      // RSSフィードを取得してパース（要件1.5）
      const feed = await parser.parseURL(topicConfig.url);
      
      // 各RSSアイテムを正規化（要件1.4）
      const articles = feed.items.map((item) =>
        normalizeArticle(item, topicConfig.type)
      );
      
      allArticles.push(...articles);
      
      console.log(`Successfully fetched ${articles.length} articles from ${topicConfig.name}`);
    } catch (error) {
      // エラーをログに記録し、他のフィードの取得を継続（要件1.2）
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to fetch RSS feed for ${topicConfig.name}:`, errorMsg);
      errors.push({ topic: topicConfig.name, error: errorMsg });
    }
  }
  
  // 記事の重複排除（同じlinkの記事は最初に取得されたものを優先）
  const seenLinks = new Set<string>();
  const uniqueArticles = allArticles.filter(article => {
    if (seenLinks.has(article.link)) return false;
    seenLinks.add(article.link);
    return true;
  });

  // 記事を公開日時の降順でソート
  const sortedArticles = sortArticlesByDate(uniqueArticles);
  
  return {
    articles: sortedArticles,
    errors,
  };
}

/**
 * トピック設定が有効かどうかを検証する
 * 
 * @param config - 検証対象のトピック設定
 * @returns 有効な場合true、無効な場合false
 */
function isValidTopicConfig(config: any): config is TopicConfig {
  if (!config || typeof config !== 'object') {
    return false;
  }
  
  // 必須フィールドの存在確認
  if (typeof config.name !== 'string' || !config.name) {
    return false;
  }
  
  if (typeof config.url !== 'string' || !config.url) {
    return false;
  }
  
  if (typeof config.type !== 'string' || !config.type) {
    return false;
  }
  
  return true;
}
