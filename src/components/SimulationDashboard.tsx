import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { SimulationParams, SimulationResult, OptimizationResult } from '../types/simulation';
import { AsphaltSimulation } from '../lib/simulation';
import { runOptimization, findOptimalConfiguration, type OptimizationParams } from '../lib/optimizer';
import { SimulationCharts } from './SimulationCharts';
import { OptimizationCharts } from './OptimizationCharts';

const defaultParams: SimulationParams = {
    totalTrucks: 8,
    targetQuantity: 500,
    truckCapacity: 40,
    plantLoadingTime: 15,
    plantCapacity: 160,
    paverUnloadingTime: 10,
    loadedTruckSpeedMin: 20,
    loadedTruckSpeedMax: 30,
    emptyTruckSpeedMin: 40,
    emptyTruckSpeedMax: 50,
    distance: 5,
    truckInitialQueue: 3
};

export function SimulationDashboard() {
    const [params, setParams] = useState<SimulationParams>(defaultParams);
    const [result, setResult] = useState<SimulationResult | null>(null);
    const [optimizationResults, setOptimizationResults] = useState<OptimizationResult[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);

    const updateParam = useCallback((key: keyof SimulationParams, value: number) => {
        setParams(prev => ({ ...prev, [key]: value }));
    }, []);

    const runSingleSimulation = useCallback(async () => {
        setIsRunning(true);
        try {
            // Small delay to show loading state
            await new Promise(resolve => setTimeout(resolve, 100));

            const simulation = new AsphaltSimulation(params);
            const simResult = simulation.runSimulation();
            setResult(simResult);
        } catch (error) {
            console.error('Simulation error:', error);
        } finally {
            setIsRunning(false);
        }
    }, [params]);

    const runOptimizationAnalysis = useCallback(async () => {
        setIsOptimizing(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 100));

            const optimizationParams: OptimizationParams = {
                baseParams: {
                    targetQuantity: params.targetQuantity,
                    truckCapacity: params.truckCapacity,
                    plantLoadingTime: params.plantLoadingTime,
                    plantCapacity: params.plantCapacity,
                    paverUnloadingTime: params.paverUnloadingTime,
                    loadedTruckSpeedMin: params.loadedTruckSpeedMin,
                    loadedTruckSpeedMax: params.loadedTruckSpeedMax,
                    emptyTruckSpeedMin: params.emptyTruckSpeedMin,
                    emptyTruckSpeedMax: params.emptyTruckSpeedMax,
                    distance: params.distance
                },
                minTrucks: 3,
                maxTrucks: params.totalTrucks + 5,
                minInitialQueue: 1,
                maxInitialQueue: 8
            };

            const results = runOptimization(optimizationParams);
            setOptimizationResults(results);
        } catch (error) {
            console.error('Optimization error:', error);
        } finally {
            setIsOptimizing(false);
        }
    }, [params]);

    const optimal = findOptimalConfiguration(optimizationResults);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight">Asphalt Laying Simulation</h1>
                <p className="text-muted-foreground mt-2">
                    Optimize truck fleet operations with realistic variable speeds for asphalt laying projects
                </p>
            </div>

            <Tabs defaultValue="simulation" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="simulation">Single Simulation</TabsTrigger>
                    <TabsTrigger value="optimization">Fleet Optimization</TabsTrigger>
                </TabsList>

                <TabsContent value="simulation" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Parameters Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Simulation Parameters</CardTitle>
                                <CardDescription>
                                    Configure the simulation settings
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="totalTrucks">Total Trucks</Label>
                                        <Input
                                            id="totalTrucks"
                                            type="number"
                                            value={params.totalTrucks}
                                            onChange={(e) => updateParam('totalTrucks', Number(e.target.value))}
                                            min="1"
                                            max="50"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="targetQuantity">Target Quantity (tons)</Label>
                                        <Input
                                            id="targetQuantity"
                                            type="number"
                                            value={params.targetQuantity}
                                            onChange={(e) => updateParam('targetQuantity', Number(e.target.value))}
                                            min="1"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="truckCapacity">Truck Capacity (tons)</Label>
                                        <Input
                                            id="truckCapacity"
                                            type="number"
                                            value={params.truckCapacity}
                                            onChange={(e) => updateParam('truckCapacity', Number(e.target.value))}
                                            min="1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="distance">Distance (km)</Label>
                                        <Input
                                            id="distance"
                                            type="number"
                                            value={params.distance}
                                            onChange={(e) => updateParam('distance', Number(e.target.value))}
                                            min="0.1"
                                            step="0.1"
                                        />
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="plantLoadingTime">Plant Loading Time (min)</Label>
                                        <Input
                                            id="plantLoadingTime"
                                            type="number"
                                            value={params.plantLoadingTime}
                                            onChange={(e) => updateParam('plantLoadingTime', Number(e.target.value))}
                                            min="1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="paverUnloadingTime">Paver Unloading Time (min)</Label>
                                        <Input
                                            id="paverUnloadingTime"
                                            type="number"
                                            value={params.paverUnloadingTime}
                                            onChange={(e) => updateParam('paverUnloadingTime', Number(e.target.value))}
                                            min="1"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="loadedTruckSpeedMin">Loaded Speed Min (km/h)</Label>
                                        <Input
                                            id="loadedTruckSpeedMin"
                                            type="number"
                                            value={params.loadedTruckSpeedMin}
                                            onChange={(e) => updateParam('loadedTruckSpeedMin', Number(e.target.value))}
                                            min="10"
                                            max={params.loadedTruckSpeedMax}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="loadedTruckSpeedMax">Loaded Speed Max (km/h)</Label>
                                        <Input
                                            id="loadedTruckSpeedMax"
                                            type="number"
                                            value={params.loadedTruckSpeedMax}
                                            onChange={(e) => updateParam('loadedTruckSpeedMax', Number(e.target.value))}
                                            min={params.loadedTruckSpeedMin}
                                            max="60"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="emptyTruckSpeedMin">Empty Speed Min (km/h)</Label>
                                        <Input
                                            id="emptyTruckSpeedMin"
                                            type="number"
                                            value={params.emptyTruckSpeedMin}
                                            onChange={(e) => updateParam('emptyTruckSpeedMin', Number(e.target.value))}
                                            min="10"
                                            max={params.emptyTruckSpeedMax}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="emptyTruckSpeedMax">Empty Speed Max (km/h)</Label>
                                        <Input
                                            id="emptyTruckSpeedMax"
                                            type="number"
                                            value={params.emptyTruckSpeedMax}
                                            onChange={(e) => updateParam('emptyTruckSpeedMax', Number(e.target.value))}
                                            min={params.emptyTruckSpeedMin}
                                            max="80"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="truckInitialQueue">Initial Queue at Paver</Label>
                                    <Input
                                        id="truckInitialQueue"
                                        type="number"
                                        value={params.truckInitialQueue}
                                        onChange={(e) => updateParam('truckInitialQueue', Number(e.target.value))}
                                        min="1"
                                        max={params.totalTrucks}
                                    />
                                </div>

                                <Button
                                    onClick={runSingleSimulation}
                                    disabled={isRunning}
                                    className="w-full"
                                >
                                    {isRunning ? 'Running Simulation...' : 'Run Simulation'}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Results Summary Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Simulation Results</CardTitle>
                                <CardDescription>
                                    Key performance metrics
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {result ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-medium">Total Time</Label>
                                                <div className="text-2xl font-bold">
                                                    {(result.totalTime / 60).toFixed(1)} hrs
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium">Completion Status</Label>
                                                <div>
                                                    <Badge variant={result.completed ? 'default' : 'destructive'}>
                                                        {result.completed ? 'Completed' : 'Not Completed'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <Label className="text-sm font-medium">Plant Utilization</Label>
                                                <Progress value={result.plantUtilization * 100} className="mt-1" />
                                                <div className="text-sm text-muted-foreground">
                                                    {(result.plantUtilization * 100).toFixed(1)}%
                                                </div>
                                            </div>

                                            <div>
                                                <Label className="text-sm font-medium">Paver Utilization</Label>
                                                <Progress value={result.paverUtilization * 100} className="mt-1" />
                                                <div className="text-sm text-muted-foreground">
                                                    {(result.paverUtilization * 100).toFixed(1)}%
                                                </div>
                                            </div>

                                            <div>
                                                <Label className="text-sm font-medium">Effective Paver Utilization</Label>
                                                <Progress value={result.effectivePaverUtilization * 100} className="mt-1" />
                                                <div className="text-sm text-muted-foreground">
                                                    {(result.effectivePaverUtilization * 100).toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">
                                                    Total Paver Idle Time
                                                </Label>
                                                <div className="font-semibold">
                                                    {(result.paverIdleTime / 60).toFixed(1)} hrs
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">
                                                    Effective Paver Idle Time
                                                </Label>
                                                <div className="font-semibold">
                                                    {(result.effectivePaverIdleTime / 60).toFixed(1)} hrs
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">
                                                    Effective Paver Time
                                                </Label>
                                                <div className="font-semibold">
                                                    {(result.effectivePaverTime / 60).toFixed(1)} hrs
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">
                                                    Longest Idle Between Unloads
                                                </Label>
                                                <div className="font-semibold">
                                                    {result.longestIdleBetweenUnloads.toFixed(1)} min
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">
                                                    Material Laid
                                                </Label>
                                                <div className="font-semibold">
                                                    {result.snapshots[result.snapshots.length - 1]?.paverLaid || 0} tons
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">
                                                    Project Completed
                                                </Label>
                                                <div className="font-semibold">
                                                    <Badge variant={result.completed ? "default" : "secondary"}>
                                                        {result.completed ? "Yes" : "No"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground py-8">
                                        Run a simulation to see results
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts */}
                    {result && <SimulationCharts result={result} />}
                </TabsContent>

                <TabsContent value="optimization" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Fleet Optimization</CardTitle>
                            <CardDescription>
                                Find the optimal number of trucks and initial queue size to minimize paver idle time.
                                Tests configurations from 3 trucks up to your current setting + 5 trucks ({params.totalTrucks + 5}).
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Button
                                    onClick={runOptimizationAnalysis}
                                    disabled={isOptimizing}
                                    className="w-full"
                                >
                                    {isOptimizing ? 'Running Optimization...' : 'Run Optimization Analysis'}
                                </Button>

                                {optimal && (
                                    <div className="bg-muted p-4 rounded-lg">
                                        <h3 className="font-semibold mb-2">Optimal Configuration Found:</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">
                                                    Trucks
                                                </Label>
                                                <div className="font-bold text-lg">{optimal.truckCount}</div>
                                            </div>
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">
                                                    Initial Queue
                                                </Label>
                                                <div className="font-bold text-lg">{optimal.initialQueue}</div>
                                            </div>
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">
                                                    Total Paver Idle Time
                                                </Label>
                                                <div className="font-bold text-lg">
                                                    {(optimal.paverIdleTime / 60).toFixed(1)}h
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">
                                                    Effective Paver Idle Time
                                                </Label>
                                                <div className="font-bold text-lg">
                                                    {(optimal.effectivePaverIdleTime / 60).toFixed(1)}h
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">
                                                    Total Time
                                                </Label>
                                                <div className="font-bold text-lg">
                                                    {(optimal.simulationTime / 60).toFixed(1)}h
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">
                                                    Effective Paver Time
                                                </Label>
                                                <div className="font-bold text-lg">
                                                    {(optimal.effectivePaverTime / 60).toFixed(1)}h
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">
                                                    Longest Idle Between Unloads
                                                </Label>
                                                <div className="font-bold text-lg">
                                                    {optimal.longestIdleBetweenUnloads.toFixed(1)}min
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">
                                                    Paver Utilization
                                                </Label>
                                                <div className="font-bold text-lg">
                                                    {(optimal.utilization * 100).toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">
                                                    Effective Paver Utilization
                                                </Label>
                                                <div className="font-bold text-lg">
                                                    {(optimal.effectivePaverUtilization * 100).toFixed(1)}%
                                                </div>
                                            </div>
                                            <div></div>
                                            <div></div>
                                            <div></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {optimizationResults.length > 0 && (
                        <OptimizationCharts results={optimizationResults} optimal={optimal} />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
