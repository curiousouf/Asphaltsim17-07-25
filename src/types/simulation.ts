export interface SimulationParams {
    totalTrucks: number;
    targetQuantity: number; // tons
    truckCapacity: number; // tons
    plantLoadingTime: number; // minutes
    plantCapacity: number; // tons per hour
    paverUnloadingTime: number; // minutes
    loadedTruckSpeedMin: number; // km/h minimum when loaded
    loadedTruckSpeedMax: number; // km/h maximum when loaded
    emptyTruckSpeedMin: number; // km/h minimum when empty
    emptyTruckSpeedMax: number; // km/h maximum when empty
    distance: number; // km (one way)
    truckInitialQueue: number; // trucks at paver before starting
}

export interface Truck {
    id: number;
    state: 'at_plant_queue' | 'loading' | 'traveling_loaded' | 'at_paver_queue' | 'unloading' | 'traveling_empty';
    loadAmount: number; // tons
    arrivalTime: number; // minutes from start
    departureTime?: number; // minutes from start
    currentSpeed?: number; // km/h for current trip
}

export interface QueueSnapshot {
    time: number; // minutes
    plantQueue: number;
    loading: number;
    travelingLoaded: number;
    paverQueue: number;
    unloading: number;
    travelingEmpty: number;
    plantProduced: number;
    paverLaid: number;
    plantIdle: boolean;
    paverIdle: boolean;
}

export interface SimulationResult {
    snapshots: QueueSnapshot[];
    totalTime: number;
    plantUtilization: number;
    paverUtilization: number;
    avgTrucksInSystem: number;
    completed: boolean;
    paverIdleTime: number;
    effectivePaverIdleTime: number;
    effectivePaverTime: number;
    effectivePaverUtilization: number;
    longestIdleBetweenUnloads: number;
}

export interface OptimizationResult {
    truckCount: number;
    initialQueue: number;
    paverIdleTime: number;
    simulationTime: number;
    utilization: number;
    effectivePaverIdleTime: number;
    effectivePaverTime: number;
    effectivePaverUtilization: number;
    longestIdleBetweenUnloads: number;
}
