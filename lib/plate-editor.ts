import { MarkdownPlugin } from '@platejs/markdown';
import { createPlateEditor } from 'platejs/react';
// import remarkGfm from 'remark-gfm';
// import remarkMath from 'remark-math';

export const serverToPlate = createPlateEditor({
  plugins: [
    // ...other Plate plugins
    MarkdownPlugin.configure({
      options: {
        // Add remark plugins for syntax extensions (GFM, Math, MDX)
        // remarkPlugins: [remarkMath, remarkGfm, remarkMdx, remarkMention],
        // Define custom rules if needed
        rules: {
          // date: { /* ... rule implementation ... */ },
        },
      },
    }),
  ],
});

