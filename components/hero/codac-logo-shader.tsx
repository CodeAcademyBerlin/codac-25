import { processLogoSSR } from '@/components/hero/process-logo-ssr';

import { CodacLogoCanvas } from './codac-logo-canva';

export const CodacLogoShader = async () => {
  const imageData = await processLogoSSR('public/codac.svg');
  return <CodacLogoCanvas imageData={imageData} />;
};
