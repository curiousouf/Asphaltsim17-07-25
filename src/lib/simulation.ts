import { type SimulationParams, type Truck, type QueueSnapshot, type SimulationResult } from '../types/simulation';

interface Event {
    time: number;
    type: 'truck_arrive_plant' | 'truck_finish_loading' | 'truck_arrive_paver' | 'truck_finish_unloading' | 'snapshot';
    truckId?: number;
}

export class AsphaltSimulation {
    private params: SimulationParams;
    private trucks: Map<number, Truck>;
    private events: Event[];
    private currentTime: number;
    private plantQueue: number[];
    private paverQueue: number[];
    private loadingTruck: number | null;
    private unloadingTruck: number | null;
    private totalProduced: number;
    private totalLaid: number;
    private snapshots: QueueSnapshot[];
    private plantIdleTime: number;
    private paverIdleTime: number;
    private plantLastActiveTime: number;
    private paverLastActiveTime: number;
    private paverStarted: boolean;
    private paverStartTime: number;
    private paverEndTime: number;
    private lastUnloadTime: number;
    private longestIdleBetweenUnloads: number;

    constructor(params: SimulationParams) {
        this.params = params;
        this.trucks = new Map();
        this.events = [];
        this.currentTime = 0;
        this.plantQueue = [];
        this.paverQueue = [];
        this.loadingTruck = null;
        this.unloadingTruck = null;
        this.totalProduced = 0;
        this.totalLaid = 0;
        this.snapshots = [];
        this.plantIdleTime = 0;
        this.paverIdleTime = 0;
        this.plantLastActiveTime = 0;
        this.paverLastActiveTime = 0;
        this.paverStarted = false;
        this.paverStartTime = 0;
        this.paverEndTime = 0;
        this.lastUnloadTime = 0;
        this.longestIdleBetweenUnloads = 0;
    }

    // Helper function to generate random speed within a range
    private getRandomSpeed(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    public runSimulation(): SimulationResult {
        this.initialize();

        while (this.events.length > 0 && this.totalLaid < this.params.targetQuantity) {
            const event = this.events.shift()!;
            this.currentTime = event.time;

            this.processEvent(event);

            // Take snapshot every 5 minutes
            if (event.type === 'snapshot') {
                this.takeSnapshot();
                // Schedule next snapshot
                this.scheduleEvent({ time: this.currentTime + 5, type: 'snapshot' });
            }
        }

        // Final snapshot
        this.takeSnapshot();

        // Set paver end time when simulation ends
        this.paverEndTime = this.currentTime;

        const totalTime = this.currentTime;
        const plantUtilization = Math.max(0, (totalTime - this.plantIdleTime) / totalTime);
        const paverUtilization = Math.max(0, (totalTime - this.paverIdleTime) / totalTime);

        // Calculate effective paver idle time (from start to end of paving)
        const effectivePaverTime = this.paverStarted ? this.paverEndTime - this.paverStartTime : 0;
        const effectivePaverUtilization = effectivePaverTime > 0 ?
            Math.max(0, (effectivePaverTime - this.paverIdleTime) / effectivePaverTime) : 0;

        return {
            snapshots: this.snapshots,
            totalTime,
            plantUtilization,
            paverUtilization,
            avgTrucksInSystem: this.params.totalTrucks,
            completed: this.totalLaid >= this.params.targetQuantity,
            paverIdleTime: this.paverIdleTime,
            effectivePaverIdleTime: this.paverIdleTime,
            effectivePaverTime,
            effectivePaverUtilization,
            longestIdleBetweenUnloads: this.longestIdleBetweenUnloads
        };
    }

    private initialize(): void {
        // Create trucks
        for (let i = 0; i < this.params.totalTrucks; i++) {
            this.trucks.set(i, {
                id: i,
                state: 'at_plant_queue',
                loadAmount: 0,
                arrivalTime: 0
            });
            this.plantQueue.push(i);
        }

        // Schedule first snapshot
        this.scheduleEvent({ time: 0, type: 'snapshot' });

        // Start loading first truck if available
        this.tryStartLoading();
    }

    private processEvent(event: Event): void {
        switch (event.type) {
            case 'truck_arrive_plant':
                this.handleTruckArriveAtPlant(event.truckId!);
                break;
            case 'truck_finish_loading':
                this.handleTruckFinishLoading(event.truckId!);
                break;
            case 'truck_arrive_paver':
                this.handleTruckArriveAtPaver(event.truckId!);
                break;
            case 'truck_finish_unloading':
                this.handleTruckFinishUnloading(event.truckId!);
                break;
            case 'snapshot':
                // Handled in main loop
                break;
        }
    }

    private handleTruckArriveAtPlant(truckId: number): void {
        const truck = this.trucks.get(truckId)!;
        truck.state = 'at_plant_queue';
        truck.arrivalTime = this.currentTime;
        truck.currentSpeed = undefined; // Clear speed after trip
        this.plantQueue.push(truckId);

        this.tryStartLoading();
    }

    private handleTruckFinishLoading(truckId: number): void {
        const truck = this.trucks.get(truckId)!;
        truck.state = 'traveling_loaded';

        // Only load the amount needed to reach the target
        const remainingToProduce = this.params.targetQuantity - this.totalProduced;
        const loadAmount = Math.min(this.params.truckCapacity, remainingToProduce);
        truck.loadAmount = loadAmount;
        truck.departureTime = this.currentTime;

        this.totalProduced += loadAmount;
        this.loadingTruck = null;

        // Generate random speed for loaded truck (20-30 km/h range)
        truck.currentSpeed = this.getRandomSpeed(
            this.params.loadedTruckSpeedMin,
            this.params.loadedTruckSpeedMax
        );

        // Calculate travel time using the random speed
        const travelTime = (this.params.distance / truck.currentSpeed) * 60; // convert to minutes
        this.scheduleEvent({
            time: this.currentTime + travelTime,
            type: 'truck_arrive_paver',
            truckId
        });

        // Try to start loading next truck
        this.tryStartLoading();
    }

    private handleTruckArriveAtPaver(truckId: number): void {
        const truck = this.trucks.get(truckId)!;
        truck.state = 'at_paver_queue';
        truck.arrivalTime = this.currentTime;
        truck.currentSpeed = undefined; // Clear speed after trip
        this.paverQueue.push(truckId);

        // Check if paver should start
        if (!this.paverStarted && this.paverQueue.length >= this.params.truckInitialQueue) {
            this.paverStarted = true;
            this.paverStartTime = this.currentTime;
            this.paverLastActiveTime = this.currentTime;
        }

        this.tryStartUnloading();
    }

    private handleTruckFinishUnloading(truckId: number): void {
        const truck = this.trucks.get(truckId)!;
        truck.state = 'traveling_empty';

        // Only lay the amount needed to reach target, not more
        const remainingTarget = this.params.targetQuantity - this.totalLaid;
        const amountToLay = Math.min(truck.loadAmount, remainingTarget);

        this.totalLaid += amountToLay;
        truck.loadAmount = 0;
        this.unloadingTruck = null;

        // Track idle time between consecutive unloads
        if (this.paverStarted && this.lastUnloadTime > 0) {
            const idleTimeBetweenUnloads = this.currentTime - this.lastUnloadTime;
            this.longestIdleBetweenUnloads = Math.max(this.longestIdleBetweenUnloads, idleTimeBetweenUnloads);
        }
        this.lastUnloadTime = this.currentTime;

        // Only schedule return to plant if we haven't reached the target yet
        if (this.totalLaid < this.params.targetQuantity) {
            // Generate random speed for empty truck (40-50 km/h range)
            truck.currentSpeed = this.getRandomSpeed(
                this.params.emptyTruckSpeedMin,
                this.params.emptyTruckSpeedMax
            );

            // Calculate travel time using the random speed
            const travelTime = (this.params.distance / truck.currentSpeed) * 60; // convert to minutes
            this.scheduleEvent({
                time: this.currentTime + travelTime,
                type: 'truck_arrive_plant',
                truckId
            });
        }

        // Try to start unloading next truck
        this.tryStartUnloading();
    }

    private tryStartLoading(): void {
        // Don't start loading if we've already produced enough to meet the target
        const remainingToProduce = this.params.targetQuantity - this.totalProduced;

        if (this.loadingTruck === null && this.plantQueue.length > 0 && remainingToProduce > 0) {
            const truckId = this.plantQueue.shift()!;
            const truck = this.trucks.get(truckId)!;

            truck.state = 'loading';
            this.loadingTruck = truckId;
            this.plantLastActiveTime = this.currentTime;

            this.scheduleEvent({
                time: this.currentTime + this.params.plantLoadingTime,
                type: 'truck_finish_loading',
                truckId
            });
        } else if (this.loadingTruck === null) {
            // Plant is idle
            this.updatePlantIdleTime();
        }
    }

    private tryStartUnloading(): void {
        if (this.paverStarted && this.unloadingTruck === null && this.paverQueue.length > 0) {
            const truckId = this.paverQueue.shift()!;
            const truck = this.trucks.get(truckId)!;

            truck.state = 'unloading';
            this.unloadingTruck = truckId;
            this.paverLastActiveTime = this.currentTime;

            this.scheduleEvent({
                time: this.currentTime + this.params.paverUnloadingTime,
                type: 'truck_finish_unloading',
                truckId
            });
        } else if (this.paverStarted && this.unloadingTruck === null) {
            // Paver is idle
            this.updatePaverIdleTime();
        }
    }

    private updatePlantIdleTime(): void {
        if (this.plantLastActiveTime < this.currentTime) {
            this.plantIdleTime += this.currentTime - this.plantLastActiveTime;
            this.plantLastActiveTime = this.currentTime;
        }
    }

    private updatePaverIdleTime(): void {
        if (this.paverStarted && this.paverLastActiveTime < this.currentTime) {
            this.paverIdleTime += this.currentTime - this.paverLastActiveTime;
            this.paverLastActiveTime = this.currentTime;
        }
    }

    private scheduleEvent(event: Event): void {
        // Insert event in chronological order
        let inserted = false;
        for (let i = 0; i < this.events.length; i++) {
            if (this.events[i].time > event.time) {
                this.events.splice(i, 0, event);
                inserted = true;
                break;
            }
        }
        if (!inserted) {
            this.events.push(event);
        }
    }

    private takeSnapshot(): void {
        const truckStates = Array.from(this.trucks.values());

        const snapshot: QueueSnapshot = {
            time: this.currentTime,
            plantQueue: truckStates.filter(t => t.state === 'at_plant_queue').length,
            loading: truckStates.filter(t => t.state === 'loading').length,
            travelingLoaded: truckStates.filter(t => t.state === 'traveling_loaded').length,
            paverQueue: truckStates.filter(t => t.state === 'at_paver_queue').length,
            unloading: truckStates.filter(t => t.state === 'unloading').length,
            travelingEmpty: truckStates.filter(t => t.state === 'traveling_empty').length,
            plantProduced: this.totalProduced,
            paverLaid: this.totalLaid,
            plantIdle: this.loadingTruck === null,
            paverIdle: this.paverStarted && this.unloadingTruck === null
        };

        this.snapshots.push(snapshot);
    }
}
