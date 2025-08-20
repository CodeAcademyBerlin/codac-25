'use client';



import { parseTwitterUrl, parseVideoUrl } from '@platejs/media';
import { MediaEmbedPlugin, useMediaState } from '@platejs/media/react';
import { ResizableProvider, useResizableValue } from '@platejs/resizable';
import type { TMediaEmbedElement } from 'platejs';
import type { PlateElementProps } from 'platejs/react';
import { PlateElement, withHOC } from 'platejs/react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { Caption, CaptionTextarea } from './caption';
import { MediaToolbar } from './media-toolbar';
import {
  mediaResizeHandleVariants,
  Resizable,
  ResizeHandle,
} from './resize-handle';

export const MediaEmbedElement = withHOC(
  ResizableProvider,
  function MediaEmbedElement(props: PlateElementProps<TMediaEmbedElement>) {
    const {
      align = 'center',
      embed,
      focused,
      isTweet,
      isVideo,
      isYoutube,
      readOnly,
      selected,
    } = useMediaState({
      urlParsers: [parseTwitterUrl, parseVideoUrl],
    });
    const width = useResizableValue('width');
    const provider = embed?.provider;

    return (
      <PlateElement className="py-2.5" {...props}>
        <MediaToolbar plugin={MediaEmbedPlugin}>
          <figure
            className="group relative m-0 w-full cursor-default"
            contentEditable={false}
          >
            <Resizable
              align={align}
              options={{
                align,
                maxWidth: isTweet ? 550 : '100%',
                minWidth: isTweet ? 300 : 100,
              }}
            >
              <ResizeHandle
                className={mediaResizeHandleVariants({ direction: 'left' })}
                options={{ direction: 'left' }}
              />

              {isVideo ? (
                isYoutube ? (
                  <div className="pb-[56.25%] relative">
                    <iframe
                      className={cn(
                        'absolute top-0 left-0 size-full rounded-sm border-0',
                        focused && selected && 'ring-2 ring-ring ring-offset-2'
                      )}
                      src={`https://www.youtube.com/embed/${embed!.id!}`}
                      title="YouTube video"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div
                    className={cn(
                      provider === 'vimeo' && 'pb-[75%]',
                      provider === 'youku' && 'pb-[56.25%]',
                      provider === 'dailymotion' && 'pb-[56.0417%]',
                      provider === 'coub' && 'pb-[51.25%]'
                    )}
                  >
                    <iframe
                      className={cn(
                        'absolute top-0 left-0 size-full rounded-sm',
                        isVideo && 'border-0',
                        focused && selected && 'ring-2 ring-ring ring-offset-2'
                      )}
                      title="embed"
                      src={embed!.url}
                      allowFullScreen
                    />
                  </div>
                )
              ) : null}

              {isTweet && (
                <div
                  className={cn(
                    '[&_.react-tweet-theme]:my-0',
                    !readOnly &&
                    selected &&
                    '[&_.react-tweet-theme]:ring-2 [&_.react-tweet-theme]:ring-ring [&_.react-tweet-theme]:ring-offset-2'
                  )}
                >
                  <div className={cn(
                    'border border-border rounded-lg p-4 bg-card',
                    focused && selected && 'ring-2 ring-ring ring-offset-2'
                  )}>
                    <p className="text-sm text-muted-foreground mb-2">Twitter/X Post</p>
                    <a 
                      href={`https://twitter.com/i/web/status/${embed!.id!}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View on Twitter/X
                    </a>
                  </div>
                </div>
              )}

              <ResizeHandle
                className={mediaResizeHandleVariants({ direction: 'right' })}
                options={{ direction: 'right' }}
              />
            </Resizable>

            <Caption style={{ width }} align={align}>
              <CaptionTextarea placeholder="Write a caption..." />
            </Caption>
          </figure>
        </MediaToolbar>

        {props.children}
      </PlateElement>
    );
  }
);
