import React, { useMemo } from 'react';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend,
    Cell,
    ReferenceLine
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, Truck, Clock, Target } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { OptimizationResult } from '../types/simulation';

interface OptimizationChartsProps {
    results: OptimizationResult[];
    optimal: OptimizationResult | null;
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    const { t } = useLanguage();

    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="rounded-lg border bg-background p-3 shadow-lg">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">{t('optCharts.configuration')}</span>
                        <Badge variant="outline">{data.trucks} {t('optCharts.trucks')}, {data.initialQueue} {t('optCharts.queue')}</Badge>
                    </div>
                    <Separator className="my-1" />
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('optCharts.idleTime')}</span>
                            <span className="font-medium">{data.idleTime.toFixed(1)} {t('results.hours')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('optCharts.totalTime')}</span>
                            <span className="font-medium">{data.totalTime.toFixed(1)} {t('results.hours')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('optCharts.utilization')}</span>
                            <span className="font-medium">{data.utilization.toFixed(1)}%</span>
                        </div>
                        {data.isOptimal && (
                            <div className="flex items-center gap-1 text-green-600">
                                <Target className="h-3 w-3" />
                                <span className="text-xs font-semibold">{t('optCharts.optimalPoint')}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

// Summary Statistics Component
const OptimizationStats = ({ results, optimal }: { results: OptimizationResult[]; optimal: OptimizationResult | null }) => {
    const { t } = useLanguage();

    const stats = useMemo(() => {
        if (!results.length) return null;

        const bestResult = results.reduce((best, current) =>
            current.paverIdleTime < best.paverIdleTime ? current : best
        );

        const avgIdleTime = results.reduce((sum, r) => sum + r.paverIdleTime, 0) / results.length / 60;
        const avgUtilization = results.reduce((sum, r) => sum + r.utilization, 0) / results.length * 100;

        return {
            totalConfigs: results.length,
            bestIdleTime: bestResult.paverIdleTime / 60,
            avgIdleTime,
            avgUtilization,
            optimalTrucks: optimal?.truckCount || 0,
            optimalQueue: optimal?.initialQueue || 0
        };
    }, [results, optimal]);

    if (!stats) return null;

    return (
        <div className="grid gap-4 md:grid-cols-5">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        {t('optCharts.totalConfigs')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {stats.totalConfigs}
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {t('optCharts.bestIdleTime')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {stats.bestIdleTime.toFixed(1)}
                        <span className="ml-1 text-sm font-normal">{t('results.hours')}</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        {t('optCharts.avgIdleTime')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {stats.avgIdleTime.toFixed(1)}
                        <span className="ml-1 text-sm font-normal">{t('results.hours')}</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100 flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        {t('optCharts.avgUtilization')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                        {stats.avgUtilization.toFixed(1)}%
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        {t('optCharts.optimalConfig')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                        {stats.optimalTrucks}T, {stats.optimalQueue}Q
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export function OptimizationCharts({ results, optimal }: OptimizationChartsProps) {
    const { t } = useLanguage();

    // Enhanced data preparation
    const scatterData = useMemo(() =>
        results.map(result => ({
            trucks: result.truckCount,
            idleTime: result.paverIdleTime / 60,
            initialQueue: result.initialQueue,
            totalTime: result.simulationTime / 60,
            utilization: result.utilization * 100,
            isOptimal: optimal && result.truckCount === optimal.truckCount &&
                result.initialQueue === optimal.initialQueue
        })), [results, optimal]);

    const truckAnalysis = useMemo(() => {
        const analysis = results.reduce((acc, result) => {
            const key = result.truckCount;
            if (!acc[key]) {
                acc[key] = {
                    truckCount: key,
                    minIdleTime: result.paverIdleTime / 60,
                    maxIdleTime: result.paverIdleTime / 60,
                    avgIdleTime: result.paverIdleTime / 60,
                    count: 1,
                    totalIdleTime: result.paverIdleTime / 60,
                    avgUtilization: result.utilization * 100
                };
            } else {
                acc[key].minIdleTime = Math.min(acc[key].minIdleTime, result.paverIdleTime / 60);
                acc[key].maxIdleTime = Math.max(acc[key].maxIdleTime, result.paverIdleTime / 60);
                acc[key].totalIdleTime += result.paverIdleTime / 60;
                acc[key].count++;
                acc[key].avgIdleTime = acc[key].totalIdleTime / acc[key].count;
                acc[key].avgUtilization = (acc[key].avgUtilization + result.utilization * 100) / 2;
            }
            return acc;
        }, {} as Record<number, any>);

        return Object.values(analysis).map((item: any) => ({
            ...item,
            // For stacked chart: base (min), middle range (avg - min), upper range (max - avg)
            baseIdleTime: item.minIdleTime,
            midRangeIdleTime: item.avgIdleTime - item.minIdleTime,
            upperRangeIdleTime: item.maxIdleTime - item.avgIdleTime
        })).sort((a, b) => a.truckCount - b.truckCount);
    }, [results]);

    const topConfigs = useMemo(() =>
        results
            .sort((a, b) => {
                if (Math.abs(a.paverIdleTime - b.paverIdleTime) < 60) {
                    return a.truckCount - b.truckCount;
                }
                return a.paverIdleTime - b.paverIdleTime;
            })
            .slice(0, 10), [results]);

    // Enhanced color palette
    const colors = {
        primary: '#8b5cf6',      // violet-500
        secondary: '#10b981',    // emerald-500
        accent: '#f59e0b',       // amber-500
        optimal: '#22c55e',      // green-500
        warning: '#f97316',      // orange-500
        min: '#06b6d4',          // cyan-500
        avg: '#8b5cf6',          // violet-500
        max: '#f59e0b'           // amber-500
    };

    return (
        <div className="space-y-6">
            {/* Summary Statistics */}
            <OptimizationStats results={results} optimal={optimal} />

            {/* Scatter Plot: Truck Count vs Idle Time */}
            <Card className="overflow-hidden">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">{t('optCharts.configurationAnalysis')}</CardTitle>
                            <CardDescription className="mt-1">
                                {t('optCharts.configurationAnalysisDesc')}
                            </CardDescription>
                        </div>
                        <Badge variant="secondary" className="hidden sm:flex">
                            {scatterData.length} {t('optCharts.configurations')}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart data={scatterData} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.5} />
                                <XAxis
                                    type="number"
                                    dataKey="trucks"
                                    name={t('optCharts.truckCount')}
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    label={{ value: t('optCharts.numberOfTrucks'), position: 'insideBottom', offset: -10, style: { textAnchor: 'middle' } }}
                                />
                                <YAxis
                                    type="number"
                                    dataKey="idleTime"
                                    name={t('optCharts.idleTimeCol')}
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    label={{ value: t('optCharts.paverIdleHours'), angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                                <Scatter
                                    dataKey="idleTime"
                                    fill={colors.primary}
                                    strokeWidth={0}
                                >
                                    {scatterData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.isOptimal ? colors.optimal : colors.primary}
                                            stroke={entry.isOptimal ? colors.optimal : 'none'}
                                            strokeWidth={entry.isOptimal ? 2 : 0}
                                            r={entry.isOptimal ? 8 : 6}
                                        />
                                    ))}
                                </Scatter>
                                {optimal && (
                                    <ReferenceLine
                                        x={optimal.truckCount}
                                        stroke={colors.optimal}
                                        strokeDasharray="5 5"
                                        strokeWidth={2}
                                    />
                                )}
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Bar Chart: Average Idle Time by Truck Count */}
                <Card className="overflow-hidden">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl">{t('optCharts.idleTimeRangeAnalysis')}</CardTitle>
                        <CardDescription className="mt-1">
                            {t('optCharts.idleTimeRangeDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={truckAnalysis} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.5} />
                                    <XAxis
                                        dataKey="truckCount"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        label={{ value: t('optCharts.numberOfTrucks'), position: 'insideBottom', offset: -10, style: { textAnchor: 'middle' } }}
                                    />
                                    <YAxis
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        label={{ value: t('optCharts.idleTimeHours'), angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                                    />
                                    <Tooltip
                                        formatter={(value: number, name: string) => {
                                            if (name === t('optCharts.minimum')) return [`${value.toFixed(1)} ${t('results.hours')}`, t('optCharts.minimum')];
                                            if (name === t('optCharts.averageRange')) return [`${(value).toFixed(1)} ${t('results.hours')}`, t('optCharts.toAverage')];
                                            if (name === t('optCharts.maximumRange')) return [`${(value).toFixed(1)} ${t('results.hours')}`, t('optCharts.toMaximum')];
                                            return [`${value.toFixed(1)} ${t('results.hours')}`, name];
                                        }}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                        labelFormatter={(label) => `${label} ${t('optCharts.trucksLabel')}`}
                                    />
                                    <Legend
                                        wrapperStyle={{ paddingTop: '20px' }}
                                        iconType="rect"
                                    />
                                    <Bar dataKey="baseIdleTime" stackId="a" fill={colors.min} name={t('optCharts.minimum')} radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="midRangeIdleTime" stackId="a" fill={colors.avg} name={t('optCharts.averageRange')} radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="upperRangeIdleTime" stackId="a" fill={colors.max} name={t('optCharts.maximumRange')} radius={[2, 2, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Configurations */}
                <Card className="overflow-hidden">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl">{t('optCharts.topConfigurations')}</CardTitle>
                        <CardDescription className="mt-1">
                            {t('optCharts.topConfigurationsDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left p-3 font-medium text-muted-foreground">{t('optCharts.rank')}</th>
                                        <th className="text-left p-3 font-medium text-muted-foreground">{t('optCharts.trucks')}</th>
                                        <th className="text-left p-3 font-medium text-muted-foreground">{t('optCharts.queueCol')}</th>
                                        <th className="text-left p-3 font-medium text-muted-foreground">{t('optCharts.idleTimeCol')}</th>
                                        <th className="text-left p-3 font-medium text-muted-foreground">{t('optCharts.utilizationCol')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topConfigs.map((result, index) => {
                                        const isOptimal = optimal &&
                                            result.truckCount === optimal.truckCount &&
                                            result.initialQueue === optimal.initialQueue;

                                        return (
                                            <tr
                                                key={`${result.truckCount}-${result.initialQueue}`}
                                                className={`border-b border-border/50 transition-colors hover:bg-muted/50 ${isOptimal ? 'bg-emerald-50/50 dark:bg-emerald-950/20 font-semibold' : ''
                                                    }`}
                                            >
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        {index + 1}
                                                        {isOptimal && <Target className="h-4 w-4 text-emerald-500" />}
                                                    </div>
                                                </td>
                                                <td className="p-3">{result.truckCount}</td>
                                                <td className="p-3">{result.initialQueue}</td>
                                                <td className="p-3">{(result.paverIdleTime / 60).toFixed(1)} {t('results.hours')}</td>
                                                <td className="p-3">{(result.utilization * 100).toFixed(1)}%</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
