/**
 * POST /interrupt-feature endpoint - Interrupt a running feature and save state for continuation
 */

import type { Request, Response } from 'express';
import type { AutoModeService } from '../../../services/auto-mode-service.js';
import { getErrorMessage, logError } from '../common.js';

export function createInterruptFeatureHandler(autoModeService: AutoModeService) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { featureId } = req.body as { featureId: string };

      if (!featureId) {
        res.status(400).json({ success: false, error: 'featureId is required' });
        return;
      }

      const result = await autoModeService.interruptFeature(featureId);
      res.json({
        success: result.success,
        sdkSessionId: result.sdkSessionId,
      });
    } catch (error) {
      logError(error, 'Interrupt feature failed');
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  };
}
