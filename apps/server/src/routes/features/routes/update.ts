/**
 * POST /update endpoint - Update a feature
 */

import path from 'path';
import type { Request, Response } from 'express';
import { FeatureLoader } from '../../../services/feature-loader.js';
import type { AutoModeService } from '../../../services/auto-mode-service.js';
import type { Feature } from '@automaker/types';
import { createLogger } from '@automaker/utils';
import { getErrorMessage, logError } from '../common.js';

const logger = createLogger('FeatureUpdate');

export function createUpdateHandler(
  featureLoader: FeatureLoader,
  autoModeService?: AutoModeService
) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectPath, featureId, updates } = req.body as {
        projectPath: string;
        featureId: string;
        updates: Partial<Feature>;
      };

      if (!projectPath || !featureId || !updates) {
        res.status(400).json({
          success: false,
          error: 'projectPath, featureId, and updates are required',
        });
        return;
      }

      // Get current feature to check status change
      const currentFeature = await featureLoader.get(projectPath, featureId);
      const previousStatus = currentFeature?.status;

      const updated = await featureLoader.update(projectPath, featureId, updates);

      // Auto-commit when status changes to 'verified'
      if (autoModeService && updates.status === 'verified' && previousStatus !== 'verified') {
        logger.info(`Auto-committing feature ${featureId} on UI status change to verified`);
        const worktreePath = path.join(projectPath, '.worktrees', featureId);
        // Run commit in background - don't block the response
        autoModeService.commitFeature(projectPath, featureId, worktreePath).catch((err) => {
          logger.error(`Auto-commit failed for feature ${featureId}:`, err);
        });
      }

      res.json({ success: true, feature: updated });
    } catch (error) {
      logError(error, 'Update feature failed');
      res.status(500).json({ success: false, error: getErrorMessage(error) });
    }
  };
}
