// types/article.ts

/**
 * デフォルトトピックの識別用リテラル型（要件6.2）
 */
export type DefaultTopicType = 'claudecode' | 'skills' | 'mcp' | 'rag';

/**
 * トピックタイプの定義（動的トピック対応）
 * 任意のトピック名を受け入れるstring型（要件6.1）
 */
export type TopicType = string;

/**
 * デフォルトトピック一覧
 */
export const DEFAULT_TOPICS: DefaultTopicType[] = ['claudecode', 'skills', 'mcp', 'rag'];

/**
 * デフォルトトピック判定ヘルパー
 */
export function isDefaultTopic(topic: string): topic is DefaultTopicType {
  return DEFAULT_TOPICS.includes(topic as DefaultTopicType);
}

/**
 * 正規化されたZenn記事データ
 * RSSフィードから取得した記事を統一フォーマットで表現
 */
export interface ZennArticle {
  /** 一意な識別子（link + pubDateのハッシュ） */
  id: string;
  /** 記事タイトル */
  title: string;
  /** 記事URL */
  link: string;
  /** ISO 8601形式の公開日時 */
  pubDate: string;
  /** 著者名 */
  author: string;
  /** トピック分類 */
  topic: TopicType;
  /** サムネイル画像URL（空文字列可） */
  thumbnail: string;
}

/**
 * トピック設定
 * 環境変数から読み込まれるRSSフィード設定
 */
export interface TopicConfig {
  /** トピック表示名 */
  name: string;
  /** RSSフィードURL */
  url: string;
  /** トピックタイプ */
  type: TopicType;
}

/**
 * トピック別カラー設定
 * UIコンポーネントで使用するTailwind CSSクラス
 */
export interface TopicColorConfig {
  /** バッジのカラークラス */
  badge: string;
  /** ボーダーのカラークラス */
  border: string;
  /** 背景のカラークラス */
  background: string;
}
