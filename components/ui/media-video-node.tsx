'use client';



import { useDraggable } from '@platejs/dnd';
import { parseTwitterUrl, parseVideoUrl } from '@platejs/media';
import { useMediaState } from '@platejs/media/react';
import { ResizableProvider, useResizableValue } from '@platejs/resizable';
import type { TResizableProps, TVideoElement } from 'platejs';
import type { PlateElementProps } from 'platejs/react';
import { PlateElement, useEditorMounted, withHOC } from 'platejs/react';
import * as React from 'react';
import ReactPlayer from 'react-player';

import { cn } from '@/lib/utils';

import { Caption, CaptionTextarea } from './caption';
import {
  mediaResizeHandleVariants,
  Resizable,
  ResizeHandle,
} from './resize-handle';

export const VideoElement = withHOC(
  ResizableProvider,
  function VideoElement(
    props: PlateElementProps<TVideoElement & TResizableProps>
  ) {
    const {
      align = 'center',
      embed,
      isUpload,
      isYoutube,
      readOnly,
      unsafeUrl,
    } = useMediaState({
      urlParsers: [parseTwitterUrl, parseVideoUrl],
    });
    const width = useResizableValue('width');

    const isEditorMounted = useEditorMounted();

    const isTweet = embed?.provider === 'twitter';

    const { isDragging, handleRef } = useDraggable({
      element: props.element,
    });

    return (
      <PlateElement className="py-2.5" {...props}>
        <figure className="relative m-0 cursor-default" contentEditable={false}>
          <Resizable
            className={cn(isDragging && 'opacity-50')}
            align={align}
            options={{
              align,
              maxWidth: isTweet ? 550 : '100%',
              minWidth: isTweet ? 300 : 100,
              readOnly,
            }}
          >
            <div className="group/media">
              <ResizeHandle
                className={mediaResizeHandleVariants({ direction: 'left' })}
                options={{ direction: 'left' }}
              />

              <ResizeHandle
                className={mediaResizeHandleVariants({ direction: 'right' })}
                options={{ direction: 'right' }}
              />

              {!isUpload && isYoutube && (
                <div ref={handleRef}>
                  <div className="aspect-video rounded-sm">
                    <iframe
                      className="w-full h-full rounded-sm"
                      src={`https://www.youtube.com/embed/${embed!.id!}`}
                      title="YouTube video"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {isUpload && isEditorMounted && (
                <div ref={handleRef}>
                  {(ReactPlayer as any)({
                    height: "100%",
                    url: unsafeUrl,
                    width: "100%",
                    controls: true,
                  })}
                </div>
              )}
            </div>
          </Resizable>

          <Caption style={{ width }} align={align}>
            <CaptionTextarea
              readOnly={readOnly}
              placeholder="Write a caption..."
            />
          </Caption>
        </figure>
        {props.children}
      </PlateElement>
    );
  }
);
