import { createRouteHandler } from 'uploadthing/next';

import { ourFileRouter } from '@/lib/editor/uploadthing';

export const { GET, POST } = createRouteHandler({ router: ourFileRouter });
