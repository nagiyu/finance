import SecretsManagerUtil from '@common/aws/SecretsManagerUtil';

import APIUtil from '@client-common/utils/APIUtil';

export async function GET() {
  const VAPID_PUBLIC_KEY = await SecretsManagerUtil.getSecretValue(process.env.PROJECT_SECRET!, 'VAPID_PUBLIC_KEY');

  return APIUtil.ReturnSuccessWithObject({
    VAPID_PUBLIC_KEY
  });
}
