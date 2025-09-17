import { useMediaQuery, useTheme } from '@mui/material';

/**
 * Responsive utility class for mobile detection and responsive utilities
 */
export class ResponsiveUtil {
  /**
   * Default mobile breakpoint
   */
  static readonly MOBILE_BREAKPOINT = 'md';

  /**
   * Hook for mobile detection using Material-UI breakpoints
   * @returns boolean indicating if the current screen is mobile
   */
  static useMobileDetection(): boolean {
    const theme = useTheme();
    return useMediaQuery(theme.breakpoints.down(ResponsiveUtil.MOBILE_BREAKPOINT));
  }
}