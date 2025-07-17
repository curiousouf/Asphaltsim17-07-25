import { type SimulationParams, type OptimizationResult } from '../types/simulation';
import { AsphaltSimulation } from './simulation';

export interface OptimizationParams {
    baseParams: Omit<SimulationParams, 'totalTrucks' | 'truckInitialQueue'>;
    minTrucks: number;
    maxTrucks: number;
    minInitialQueue: number;
    maxInitialQueue: number;
}

export function runOptimization(params: OptimizationParams): OptimizationResult[] {
    const results: OptimizationResult[] = [];

    for (let trucks = params.minTrucks; trucks <= params.maxTrucks; trucks++) {
        for (let initialQueue = params.minInitialQueue;
            initialQueue <= Math.min(params.maxInitialQueue, trucks);
            initialQueue++) {

            const simParams: SimulationParams = {
                ...params.baseParams,
                totalTrucks: trucks,
                truckInitialQueue: initialQueue
            };

            const simulation = new AsphaltSimulation(simParams);
            const result = simulation.runSimulation();

            if (result.completed) {
                results.push({
                    truckCount: trucks,
                    initialQueue: initialQueue,
                    paverIdleTime: result.paverIdleTime,
                    simulationTime: result.totalTime,
                    utilization: result.paverUtilization,
                    effectivePaverIdleTime: result.effectivePaverIdleTime,
                    effectivePaverTime: result.effectivePaverTime,
                    effectivePaverUtilization: result.effectivePaverUtilization,
                    longestIdleBetweenUnloads: result.longestIdleBetweenUnloads
                });
            }
        }
    }

    return results;
}

export function findOptimalConfiguration(results: OptimizationResult[]): OptimizationResult | null {
    if (results.length === 0) return null;

    // Find the configuration with minimum trucks that achieves minimum paver idle time
    const minIdleTime = Math.min(...results.map(r => r.paverIdleTime));
    const minIdleConfigs = results.filter(r => r.paverIdleTime <= minIdleTime + 1); // 1 minute tolerance

    // Among those with minimum idle time, find the one with minimum trucks
    return minIdleConfigs.reduce((best, current) =>
        current.truckCount < best.truckCount ? current : best
    );
}
