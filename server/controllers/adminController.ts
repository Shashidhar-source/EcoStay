import { Request, Response } from 'express';
import { providerManager } from '../services/providers/providerManager';

export async function getProviderStatus(req: Request, res: Response): Promise<void> {
  try {
    const statuses = providerManager.getProviderStatus();
    
    // Overall system health
    const totalRequests = statuses.reduce((acc, p) => acc + p.totalRequests, 0);
    const totalErrors = statuses.reduce((acc, p) => acc + p.failedRequests, 0);
    const activeProviders = statuses.filter(p => p.status === 'ACTIVE').length;

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalProviders: statuses.length,
        activeProviders,
        totalRequests,
        totalErrors,
        errorRatePercent: totalRequests > 0 ? Math.round((totalErrors / totalRequests) * 100) : 0
      },
      providers: statuses
    });
  } catch (err: any) {
    console.error('getProviderStatus error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve provider telemetry'
    });
  }
}
