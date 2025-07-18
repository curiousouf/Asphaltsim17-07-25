import React, { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    ReferenceLine
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { SimulationResult } from '../types/simulation';

interface SimulationChartsProps {
    result: SimulationResult;
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border bg-background p-3 shadow-lg">
                <div className="space-y-1">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-xs font-medium text-muted-foreground">Time</span>
                        <span className="text-sm font-semibold">{label} hours</span>
                    </div>
                    <Separator className="my-1" />
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-xs text-muted-foreground">{entry.name}</span>
                            </div>
                            <span className="text-sm font-medium">
                                {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
                                {entry.name.includes('%') ? '%' : ''}
                                {entry.name.includes('tons') ? ' tons' : ''}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

// Summary Statistics Component
const SummaryStats = ({ result }: { result: SimulationResult }) => {
    const stats = useMemo(() => {
        const lastSnapshot = result.snapshots[result.snapshots.length - 1];
        const totalProduced = lastSnapshot?.plantProduced || 0;
        const totalLaid = lastSnapshot?.paverLaid || 0;
        const avgUtilization = result.snapshots.reduce((acc, s) => {
            const plantActive = s.plantIdle ? 0 : 100;
            const paverActive = s.paverIdle ? 0 : 100;
            return acc + (plantActive + paverActive) / 2;
        }, 0) / result.snapshots.length;

        return {
            totalProduced,
            totalLaid,
            avgUtilization: Math.round(avgUtilization),
            efficiency: totalProduced > 0 ? Math.round((totalLaid / totalProduced) * 100) : 0
        };
    }, [result]);

    return (
        <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Total Produced
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {stats.totalProduced.toLocaleString()}
                        <span className="ml-1 text-sm font-normal">tons</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">
                        Total Laid
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {stats.totalLaid.toLocaleString()}
                        <span className="ml-1 text-sm font-normal">tons</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                        Avg Utilization
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {stats.avgUtilization}%
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">
                        Efficiency
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                        {stats.efficiency}%
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export function SimulationCharts({ result }: SimulationChartsProps) {
    // Prepare data for charts with enhanced formatting
    const truckDistributionData = useMemo(() =>
        result.snapshots.map(snapshot => ({
            time: parseFloat((snapshot.time / 60).toFixed(1)),
            'Plant Queue': snapshot.plantQueue,
            'Loading': snapshot.loading,
            'Traveling Loaded': snapshot.travelingLoaded,
            'Paver Queue': snapshot.paverQueue,
            'Unloading': snapshot.unloading,
            'Traveling Empty': snapshot.travelingEmpty,
            total: snapshot.plantQueue + snapshot.loading + snapshot.travelingLoaded +
                snapshot.paverQueue + snapshot.unloading + snapshot.travelingEmpty
        })), [result]);

    const utilizationData = useMemo(() =>
        result.snapshots.map(snapshot => ({
            time: parseFloat((snapshot.time / 60).toFixed(1)),
            'Plant Active': snapshot.plantIdle ? 0 : 100,
            'Paver Active': snapshot.paverIdle ? 0 : 100
        })), [result]);

    const productionData = useMemo(() =>
        result.snapshots.map(snapshot => ({
            time: parseFloat((snapshot.time / 60).toFixed(1)),
            'Produced': snapshot.plantProduced,
            'Laid': snapshot.paverLaid
        })), [result]);

    // Enhanced color palette
    const colors = {
        plantQueue: '#8b5cf6',    // violet-500
        loading: '#10b981',       // emerald-500
        travelingLoaded: '#f59e0b', // amber-500
        paverQueue: '#f97316',    // orange-500
        unloading: '#06b6d4',     // cyan-500
        travelingEmpty: '#3b82f6', // blue-500
        plantActive: '#8b5cf6',   // violet-500
        paverActive: '#10b981',   // emerald-500
        produced: '#8b5cf6',      // violet-500
        laid: '#10b981'           // emerald-500
    };

    return (
        <div className="space-y-6">
            {/* Summary Statistics */}
            <SummaryStats result={result} />

            {/* Truck Distribution Over Time */}
            <Card className="overflow-hidden">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">Truck Distribution Over Time</CardTitle>
                            <CardDescription className="mt-1">
                                Real-time tracking of truck positions throughout the simulation
                            </CardDescription>
                        </div>
                        <Badge variant="secondary" className="hidden sm:flex">
                            {truckDistributionData.length} data points
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={truckDistributionData}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorPlantQueue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={colors.plantQueue} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={colors.plantQueue} stopOpacity={0.1} />
                                    </linearGradient>
                                    <linearGradient id="colorLoading" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={colors.loading} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={colors.loading} stopOpacity={0.1} />
                                    </linearGradient>
                                    <linearGradient id="colorTravelingLoaded" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={colors.travelingLoaded} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={colors.travelingLoaded} stopOpacity={0.1} />
                                    </linearGradient>
                                    <linearGradient id="colorPaverQueue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={colors.paverQueue} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={colors.paverQueue} stopOpacity={0.1} />
                                    </linearGradient>
                                    <linearGradient id="colorUnloading" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={colors.unloading} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={colors.unloading} stopOpacity={0.1} />
                                    </linearGradient>
                                    <linearGradient id="colorTravelingEmpty" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={colors.travelingEmpty} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={colors.travelingEmpty} stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.5} />
                                <XAxis
                                    dataKey="time"
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    label={{ value: 'Time (hours)', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle' } }}
                                />
                                <YAxis
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    label={{ value: 'Number of Trucks', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    wrapperStyle={{ paddingTop: '20px' }}
                                    iconType="rect"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="Plant Queue"
                                    stackId="1"
                                    stroke={colors.plantQueue}
                                    fill="url(#colorPlantQueue)"
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="Loading"
                                    stackId="1"
                                    stroke={colors.loading}
                                    fill="url(#colorLoading)"
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="Traveling Loaded"
                                    stackId="1"
                                    stroke={colors.travelingLoaded}
                                    fill="url(#colorTravelingLoaded)"
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="Paver Queue"
                                    stackId="1"
                                    stroke={colors.paverQueue}
                                    fill="url(#colorPaverQueue)"
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="Unloading"
                                    stackId="1"
                                    stroke={colors.unloading}
                                    fill="url(#colorUnloading)"
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="Traveling Empty"
                                    stackId="1"
                                    stroke={colors.travelingEmpty}
                                    fill="url(#colorTravelingEmpty)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Equipment Utilization */}
                <Card className="overflow-hidden">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl">Equipment Utilization</CardTitle>
                        <CardDescription className="mt-1">
                            Real-time operating status of plant and paver
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={utilizationData}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.5} />
                                    <XAxis
                                        dataKey="time"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        label={{ value: 'Time (hours)', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle' } }}
                                    />
                                    <YAxis
                                        domain={[0, 100]}
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        label={{ value: 'Utilization (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        wrapperStyle={{ paddingTop: '20px' }}
                                        iconType="line"
                                    />
                                    <Line
                                        type="stepAfter"
                                        dataKey="Plant Active"
                                        stroke={colors.plantActive}
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                    <Line
                                        type="stepAfter"
                                        dataKey="Paver Active"
                                        stroke={colors.paverActive}
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Production Progress */}
                <Card className="overflow-hidden">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl">Production & Laying Progress</CardTitle>
                        <CardDescription className="mt-1">
                            Cumulative material production and laying over time
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={productionData}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.5} />
                                    <XAxis
                                        dataKey="time"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        label={{ value: 'Time (hours)', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle' } }}
                                    />
                                    <YAxis
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        label={{ value: 'Material (tons)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        wrapperStyle={{ paddingTop: '20px' }}
                                        iconType="line"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="Produced"
                                        stroke={colors.produced}
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="Laid"
                                        stroke={colors.laid}
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
