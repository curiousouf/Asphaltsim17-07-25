import React from 'react';
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
    Cell
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import type { OptimizationResult } from '../types/simulation';

interface OptimizationChartsProps {
    results: OptimizationResult[];
    optimal: OptimizationResult | null;
}

export function OptimizationCharts({ results, optimal }: OptimizationChartsProps) {
    // Prepare scatter plot data for truck count vs idle time
    const scatterData = results.map(result => ({
        trucks: result.truckCount,
        idleTime: result.paverIdleTime / 60, // Convert to hours
        initialQueue: result.initialQueue,
        totalTime: result.simulationTime / 60,
        utilization: result.utilization * 100,
        isOptimal: optimal && result.truckCount === optimal.truckCount &&
            result.initialQueue === optimal.initialQueue
    }));

    // Group by truck count for bar chart
    interface TruckAnalysis {
        truckCount: number;
        minIdleTime: number;
        maxIdleTime: number;
        avgIdleTime: number;
        count: number;
        totalIdleTime: number;
    }

    const truckAnalysis = results.reduce((acc, result) => {
        const key = result.truckCount;
        if (!acc[key]) {
            acc[key] = {
                truckCount: key,
                minIdleTime: result.paverIdleTime / 60,
                maxIdleTime: result.paverIdleTime / 60,
                avgIdleTime: result.paverIdleTime / 60,
                count: 1,
                totalIdleTime: result.paverIdleTime / 60
            };
        } else {
            acc[key].minIdleTime = Math.min(acc[key].minIdleTime, result.paverIdleTime / 60);
            acc[key].maxIdleTime = Math.max(acc[key].maxIdleTime, result.paverIdleTime / 60);
            acc[key].totalIdleTime += result.paverIdleTime / 60;
            acc[key].count++;
            acc[key].avgIdleTime = acc[key].totalIdleTime / acc[key].count;
        }
        return acc;
    }, {} as Record<number, TruckAnalysis>);

    const barData = Object.values(truckAnalysis);

    // Custom tooltip for scatter plot
    const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border rounded shadow-lg">
                    <p className="font-semibold">{`Trucks: ${data.trucks}`}</p>
                    <p>{`Initial Queue: ${data.initialQueue}`}</p>
                    <p>{`Idle Time: ${data.idleTime.toFixed(1)} hrs`}</p>
                    <p>{`Total Time: ${data.totalTime.toFixed(1)} hrs`}</p>
                    <p>{`Utilization: ${data.utilization.toFixed(1)}%`}</p>
                    {data.isOptimal && (
                        <p className="text-green-600 font-semibold">⭐ Optimal Configuration</p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {/* Scatter Plot: Truck Count vs Idle Time */}
            <Card>
                <CardHeader>
                    <CardTitle>Truck Count vs Paver Idle Time</CardTitle>
                    <CardDescription>
                        Each point represents a different configuration. Optimal configuration is highlighted.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <ScatterChart data={scatterData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                type="number"
                                dataKey="trucks"
                                domain={['dataMin - 0.5', 'dataMax + 0.5']}
                                label={{ value: 'Number of Trucks', position: 'insideBottom', offset: -10 }}
                            />
                            <YAxis
                                type="number"
                                dataKey="idleTime"
                                label={{ value: 'Paver Idle Time (hours)', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Scatter dataKey="idleTime" fill="#8884d8">
                                {scatterData.map((entry) => (
                                    <Cell
                                        key={`truck-${entry.trucks}-queue-${entry.initialQueue}`}
                                        fill={entry.isOptimal ? "#00ff00" : "#8884d8"}
                                    />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Bar Chart: Average Idle Time by Truck Count */}
            <Card>
                <CardHeader>
                    <CardTitle>Average Paver Idle Time by Truck Count</CardTitle>
                    <CardDescription>
                        Shows minimum, average, and maximum idle times for each truck count
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="truckCount"
                                label={{ value: 'Number of Trucks', position: 'insideBottom', offset: -10 }}
                            />
                            <YAxis
                                label={{ value: 'Idle Time (hours)', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip
                                formatter={(value: number, name: string) => [
                                    `${value.toFixed(1)} hrs`,
                                    name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
                                ]}
                            />
                            <Legend />
                            <Bar dataKey="minIdleTime" fill="#82ca9d" name="Minimum" />
                            <Bar dataKey="avgIdleTime" fill="#8884d8" name="Average" />
                            <Bar dataKey="maxIdleTime" fill="#ffc658" name="Maximum" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Results Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Top 10 Configurations</CardTitle>
                    <CardDescription>
                        Best configurations ranked by paver idle time and truck count
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">Rank</th>
                                    <th className="text-left p-2">Trucks</th>
                                    <th className="text-left p-2">Initial Queue</th>
                                    <th className="text-left p-2">Idle Time (hrs)</th>
                                    <th className="text-left p-2">Total Time (hrs)</th>
                                    <th className="text-left p-2">Utilization (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results
                                    .sort((a, b) => {
                                        // Sort by idle time first, then by truck count
                                        if (Math.abs(a.paverIdleTime - b.paverIdleTime) < 60) { // 1 minute tolerance
                                            return a.truckCount - b.truckCount;
                                        }
                                        return a.paverIdleTime - b.paverIdleTime;
                                    })
                                    .slice(0, 10)
                                    .map((result, index) => {
                                        const isOptimal = optimal &&
                                            result.truckCount === optimal.truckCount &&
                                            result.initialQueue === optimal.initialQueue;

                                        return (
                                            <tr
                                                key={`${result.truckCount}-${result.initialQueue}`}
                                                className={`border-b ${isOptimal ? 'bg-green-50 font-semibold' : ''}`}
                                            >
                                                <td className="p-2">
                                                    {index + 1}
                                                    {isOptimal && " ⭐"}
                                                </td>
                                                <td className="p-2">{result.truckCount}</td>
                                                <td className="p-2">{result.initialQueue}</td>
                                                <td className="p-2">{(result.paverIdleTime / 60).toFixed(1)}</td>
                                                <td className="p-2">{(result.simulationTime / 60).toFixed(1)}</td>
                                                <td className="p-2">{(result.utilization * 100).toFixed(1)}</td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
