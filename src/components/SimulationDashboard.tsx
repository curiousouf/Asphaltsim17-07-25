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
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '../contexts/LanguageContext';

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
    const { t } = useLanguage();
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
            <div className="flex justify-between items-start">
                <div className="text-center flex-1">
                    <h1 className="text-4xl font-bold tracking-tight">{t('app.title')}</h1>
                    <p className="text-muted-foreground mt-2">
                        {t('app.description')}
                    </p>
                </div>
                <div className="flex-shrink-0 ml-4">
                    <LanguageSwitcher />
                </div>
            </div>

            <Tabs defaultValue="simulation" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="simulation">{t('tabs.simulation')}</TabsTrigger>
                    <TabsTrigger value="optimization">{t('tabs.optimization')}</TabsTrigger>
                </TabsList>

                <TabsContent value="simulation" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Parameters Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('params.title')}</CardTitle>
                                <CardDescription>
                                    {t('params.description')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="totalTrucks">{t('params.totalTrucks')}</Label>
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
                                        <Label htmlFor="targetQuantity">{t('params.targetQuantity')}</Label>
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
                                        <Label htmlFor="truckCapacity">{t('params.truckCapacity')}</Label>
                                        <Input
                                            id="truckCapacity"
                                            type="number"
                                            value={params.truckCapacity}
                                            onChange={(e) => updateParam('truckCapacity', Number(e.target.value))}
                                            min="1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="distance">{t('params.distance')}</Label>
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
                                        <Label htmlFor="plantLoadingTime">{t('params.plantLoadingTime')}</Label>
                                        <Input
                                            id="plantLoadingTime"
                                            type="number"
                                            value={params.plantLoadingTime}
                                            onChange={(e) => updateParam('plantLoadingTime', Number(e.target.value))}
                                            min="1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="paverUnloadingTime">{t('params.paverUnloadingTime')}</Label>
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
                                        <Label htmlFor="loadedTruckSpeedMin">{t('params.loadedSpeedMin')}</Label>
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
                                        <Label htmlFor="loadedTruckSpeedMax">{t('params.loadedSpeedMax')}</Label>
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
                                        <Label htmlFor="emptyTruckSpeedMin">{t('params.emptySpeedMin')}</Label>
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
                                        <Label htmlFor="emptyTruckSpeedMax">{t('params.emptySpeedMax')}</Label>
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
                                    <Label htmlFor="truckInitialQueue">{t('params.initialQueue')}</Label>
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
                                    {isRunning ? t('button.runningSimulation') : t('button.runSimulation')}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Results Summary Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('results.title')}</CardTitle>
                                <CardDescription>
                                    {t('results.description')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {result ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-medium">{t('results.totalTime')}</Label>
                                                <div className="text-2xl font-bold">
                                                    {(result.totalTime / 60).toFixed(1)} {t('results.hours')}
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium">{t('results.completionStatus')}</Label>
                                                <div>
                                                    <Badge variant={result.completed ? 'default' : 'destructive'}>
                                                        {result.completed ? t('results.completed') : t('results.notCompleted')}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <Label className="text-sm font-medium">{t('results.plantUtilization')}</Label>
                                                <Progress value={result.plantUtilization * 100} className="mt-1" />
                                                <div className="text-sm text-muted-foreground">
                                                    {(result.plantUtilization * 100).toFixed(1)}%
                                                </div>
                                            </div>

                                            <div>
                                                <Label className="text-sm font-medium">{t('results.paverUtilization')}</Label>
                                                <Progress value={result.paverUtilization * 100} className="mt-1" />
                                                <div className="text-sm text-muted-foreground">
                                                    {(result.paverUtilization * 100).toFixed(1)}%
                                                </div>
                                            </div>

                                            <div>
                                                <Label className="text-sm font-medium">{t('results.effectivePaverUtilization')}</Label>
                                                <Progress value={result.effectivePaverUtilization * 100} className="mt-1" />
                                                <div className="text-sm text-muted-foreground">
                                                    {(result.effectivePaverUtilization * 100).toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">
                                                    {t('results.totalPaverIdleTime')}
                                                </Label>
                                                <div className="font-semibold">
                                                    {(result.paverIdleTime / 60).toFixed(1)} {t('results.hours')}
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">
                                                    {t('results.effectivePaverIdleTime')}
                                                </Label>
                                                <div className="font-semibold">
                                                    {(result.effectivePaverIdleTime / 60).toFixed(1)} {t('results.hours')}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">
                                                    {t('results.effectivePaverTime')}
                                                </Label>
                                                <div className="font-semibold">
                                                    {(result.effectivePaverTime / 60).toFixed(1)} {t('results.hours')}
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">
                                                    {t('results.longestIdleBetweenUnloads')}
                                                </Label>
                                                <div className="font-semibold">
                                                    {result.longestIdleBetweenUnloads.toFixed(1)} {t('results.minutes')}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">
                                                    {t('results.materialLaid')}
                                                </Label>
                                                <div className="font-semibold">
                                                    {result.snapshots[result.snapshots.length - 1]?.paverLaid || 0} {t('results.tons')}
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">
                                                    {t('results.projectCompleted')}
                                                </Label>
                                                <div className="font-semibold">
                                                    <Badge variant={result.completed ? "default" : "secondary"}>
                                                        {result.completed ? t('results.yes') : t('results.no')}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground py-8">
                                        {t('results.noData')}
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
                            <CardTitle>{t('optimization.title')}</CardTitle>
                            <CardDescription>
                                {t('optimization.description').replace('{maxTrucks}', (params.totalTrucks + 5).toString())}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Button
                                    onClick={runOptimizationAnalysis}
                                    disabled={isOptimizing}
                                    className="w-full"
                                >
                                    {isOptimizing ? t('button.runningOptimization') : t('button.runOptimization')}
                                </Button>

                                {optimal && (
                                    <div className="bg-muted p-4 rounded-lg">
                                        <h3 className="font-semibold mb-2">{t('optimization.optimalFound')}</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">
                                                    {t('optimization.trucks')}
                                                </Label>
                                                <div className="font-bold text-lg">{optimal.truckCount}</div>
                                            </div>
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">
                                                    {t('optimization.initialQueue')}
                                                </Label>
                                                <div className="font-bold text-lg">{optimal.initialQueue}</div>
                                            </div>
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">
                                                    {t('optimization.totalPaverIdleTime')}
                                                </Label>
                                                <div className="font-bold text-lg">
                                                    {(optimal.paverIdleTime / 60).toFixed(1)}{t('results.hours')}
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">
                                                    {t('optimization.effectivePaverIdleTime')}
                                                </Label>
                                                <div className="font-bold text-lg">
                                                    {(optimal.effectivePaverIdleTime / 60).toFixed(1)}{t('results.hours')}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">
                                                    {t('optimization.totalTime')}
                                                </Label>
                                                <div className="font-bold text-lg">
                                                    {(optimal.simulationTime / 60).toFixed(1)}{t('results.hours')}
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">
                                                    {t('optimization.effectivePaverTime')}
                                                </Label>
                                                <div className="font-bold text-lg">
                                                    {(optimal.effectivePaverTime / 60).toFixed(1)}{t('results.hours')}
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">
                                                    {t('optimization.longestIdleBetweenUnloads')}
                                                </Label>
                                                <div className="font-bold text-lg">
                                                    {optimal.longestIdleBetweenUnloads.toFixed(1)}{t('results.minutes')}
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">
                                                    {t('optimization.paverUtilization')}
                                                </Label>
                                                <div className="font-bold text-lg">
                                                    {(optimal.utilization * 100).toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">
                                                    {t('optimization.effectivePaverUtilization')}
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
