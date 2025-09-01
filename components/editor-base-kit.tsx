import { BaseAlignKit } from '@/components/align-base-kit';
import { BaseBasicBlocksKit } from '@/components/basic-blocks-base-kit';
import { BaseBasicMarksKit } from '@/components/basic-marks-base-kit';
import { BaseCalloutKit } from '@/components/callout-base-kit';
import { BaseCodeBlockKit } from '@/components/code-block-base-kit';
import { BaseColumnKit } from '@/components/column-base-kit';
import { BaseCommentKit } from '@/components/comment-base-kit';
import { BaseDateKit } from '@/components/date-base-kit';
import { BaseFontKit } from '@/components/font-base-kit';
import { BaseLineHeightKit } from '@/components/line-height-base-kit';
import { BaseLinkKit } from '@/components/link-base-kit';
import { BaseListKit } from '@/components/list-base-kit';
import { MarkdownKit } from '@/components/markdown-kit';
import { BaseMathKit } from '@/components/math-base-kit';
import { BaseMediaKit } from '@/components/media-base-kit';
import { BaseMentionKit } from '@/components/mention-base-kit';
import { BaseSuggestionKit } from '@/components/suggestion-base-kit';
import { BaseTableKit } from '@/components/table-base-kit';
import { BaseTocKit } from '@/components/toc-base-kit';
import { BaseToggleKit } from '@/components/toggle-base-kit';

export const BaseEditorKit = [
  ...BaseBasicBlocksKit,
  ...BaseCodeBlockKit,
  ...BaseTableKit,
  ...BaseToggleKit,
  ...BaseTocKit,
  ...BaseMediaKit,
  ...BaseCalloutKit,
  ...BaseColumnKit,
  ...BaseMathKit,
  ...BaseDateKit,
  ...BaseLinkKit,
  ...BaseMentionKit,
  ...BaseBasicMarksKit,
  ...BaseFontKit,
  ...BaseListKit,
  ...BaseAlignKit,
  ...BaseLineHeightKit,
  ...BaseCommentKit,
  ...BaseSuggestionKit,
  ...MarkdownKit,
];
