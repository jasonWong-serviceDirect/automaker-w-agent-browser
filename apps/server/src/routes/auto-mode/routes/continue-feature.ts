/**
 * POST /continue-feature endpoint - Continue an interrupted feature with user input
 */

import type { Request, Response } from 'express';
import type { AutoModeService } from '../../../services/auto-mode-service.js';
import { createLogger } from '@automaker/utils';
import { getErrorMessage, logError } from '../common.js';

const logger = createLogger('AutoMode');

export function createContinueFeatureHandler(autoModeService: AutoModeService) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectPath, featureId, message, imagePaths } = req.body as {
        projectPath: string;
        featureId: string;
        message: string;
        imagePaths?: string[];
      };

      if (!projectPath || !featureId || !message) {
        res.status(400).json({
          success: false,
          error: 'projectPath, featureId, and message are required',
        });
        return;
      }

      // Start continuation in background
      autoModeService
        .continueFeature(projectPath, featureId, message, imagePaths)
        .catch((error) => {
          logger.error(`[AutoMode] Continue feature ${featureId} error:`, error);
        });

      res.json({ success: true });
    } catch (error) {
      logError(error, 'Continue feature failed');
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  };
}
