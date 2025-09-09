import SecretsManagerUtil from '@common/aws/SecretsManagerUtil';

export interface AdsenseConfig {
    publisherId: string;
    enableAutoAds?: boolean;
}

export default class AdSenseUtil {
  /**
   * Fetches the AdSense configuration from AWS Secrets Manager
   * @param enableAutoAds Whether to enable auto ads (default: true)
   * @returns AdSense configuration or null if not available
   */
  public static async getAdSenseConfig(enableAutoAds: boolean = true): Promise<AdsenseConfig | null> {
    try {
      const publisherId = await SecretsManagerUtil.getSecretValue('GoogleAdSense', 'PUBLISHER_ID', true);
      
      return {
        publisherId,
        enableAutoAds
      };
    } catch (error) {
      console.warn('AdSense Publisher ID not available:', error);
      return null;
    }
  }
}
