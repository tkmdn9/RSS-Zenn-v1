// components/__tests__/ArticleCard.test.tsx

/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { ArticleCard } from '../ArticleCard';
import { ZennArticle } from '@/types/article';

describe('ArticleCard', () => {
  const mockArticle: ZennArticle = {
    id: 'test-1',
    title: 'Test Article Title',
    link: 'https://zenn.dev/test-article',
    pubDate: '2024-01-15T10:00:00Z',
    author: 'Test Author',
    topic: 'claudecode',
    thumbnail: 'https://example.com/thumbnail.jpg'
  };

  const mockOnClick = jest.fn();
  const allTopicTypes = ['claudecode', 'skills', 'mcp', 'rag'];

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('記事情報を表示する（要件6.2）', () => {
    render(<ArticleCard article={mockArticle} isRead={false} onClick={mockOnClick} allTopicTypes={allTopicTypes} />);
    
    // タイトル、著者、トピックが表示されることを確認
    expect(screen.getByText('Test Article Title')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
    expect(screen.getByText('CLAUDECODE')).toBeInTheDocument();
  });

  it('サムネイルを表示する（要件6.2）', () => {
    render(<ArticleCard article={mockArticle} isRead={false} onClick={mockOnClick} allTopicTypes={allTopicTypes} />);
    
    const img = screen.getByAltText('Test Article Title');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/thumbnail.jpg');
  });

  it('外部リンク属性を設定する（要件12.2）', () => {
    const { container } = render(
      <ArticleCard article={mockArticle} isRead={false} onClick={mockOnClick} allTopicTypes={allTopicTypes} />
    );
    
    const link = container.querySelector('a');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAttribute('href', 'https://zenn.dev/test-article');
  });

  it('既読記事を視覚的に区別する（要件7.4）', () => {
    const { container } = render(
      <ArticleCard article={mockArticle} isRead={true} onClick={mockOnClick} allTopicTypes={allTopicTypes} />
    );
    
    const link = container.querySelector('a');
    expect(link?.className).toContain('opacity-60');
    expect(screen.getByText('既読')).toBeInTheDocument();
  });

  it('未読記事は通常の透明度で表示する（要件7.4）', () => {
    const { container } = render(
      <ArticleCard article={mockArticle} isRead={false} onClick={mockOnClick} allTopicTypes={allTopicTypes} />
    );
    
    const link = container.querySelector('a');
    expect(link?.className).toContain('opacity-100');
    expect(screen.queryByText('既読')).not.toBeInTheDocument();
  });

  it('外部リンクインジケータを表示する（要件12.3）', () => {
    render(<ArticleCard article={mockArticle} isRead={false} onClick={mockOnClick} allTopicTypes={allTopicTypes} />);
    
    expect(screen.getByText('新しいタブで開く')).toBeInTheDocument();
  });

  it('トピック別カラーコーディングを適用する', () => {
    const { container } = render(
      <ArticleCard article={mockArticle} isRead={false} onClick={mockOnClick} allTopicTypes={allTopicTypes} />
    );
    
    const link = container.querySelector('a');
    // claudecodeトピックは紫色
    expect(link?.className).toContain('border-purple-200');
    expect(link?.className).toContain('hover:bg-purple-50');
  });

  it('サムネイルがない場合でも正常に表示する', () => {
    const articleWithoutThumbnail = { ...mockArticle, thumbnail: '' };
    render(
      <ArticleCard article={articleWithoutThumbnail} isRead={false} onClick={mockOnClick} allTopicTypes={allTopicTypes} />
    );
    
    expect(screen.getByText('Test Article Title')).toBeInTheDocument();
    expect(screen.queryByAltText('Test Article Title')).not.toBeInTheDocument();
  });
});
