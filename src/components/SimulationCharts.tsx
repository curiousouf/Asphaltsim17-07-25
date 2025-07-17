import React from 'react';
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
    Bar
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { SimulationResult } from '../types/simulation';

interface SimulationChartsProps {
    result: SimulationResult;
}

export function SimulationCharts({ result }: SimulationChartsProps) {
    // Prepare data for truck distribution chart
    const truckDistributionData = result.snapshots.map(snapshot => ({
        time: (snapshot.time / 60).toFixed(1), // Convert to hours
        'Plant Queue': snapshot.plantQueue,
        'Loading': snapshot.loading,
        'Traveling Loaded': snapshot.travelingLoaded,
        'Paver Queue': snapshot.paverQueue,
        'Unloading': snapshot.unloading,
        'Traveling Empty': snapshot.travelingEmpty,
        total: snapshot.plantQueue + snapshot.loading + snapshot.travelingLoaded +
            snapshot.paverQueue + snapshot.unloading + snapshot.travelingEmpty
    }));

    // Prepare data for utilization chart
    const utilizationData = result.snapshots.map(snapshot => ({
        time: (snapshot.time / 60).toFixed(1),
        'Plant Active': snapshot.plantIdle ? 0 : 100,
        'Paver Active': snapshot.paverIdle ? 0 : 100
    }));

    // Prepare data for production chart
    const productionData = result.snapshots.map(snapshot => ({
        time: (snapshot.time / 60).toFixed(1),
        'Produced': snapshot.plantProduced,
        'Laid': snapshot.paverLaid
    }));

    return (
        <div className="space-y-6">
            {/* Truck Distribution Over Time */}
            <Card>
                <CardHeader>
                    <CardTitle>Truck Distribution Over Time</CardTitle>
                    <CardDescription>
                        Number of trucks at each location throughout the simulation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={truckDistributionData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="time"
                                label={{ value: 'Time (hours)', position: 'insideBottom', offset: -10 }}
                            />
                            <YAxis
                                label={{ value: 'Number of Trucks', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip
                                formatter={(value, name) => [value, name]}
                                labelFormatter={(value) => `Time: ${value} hours`}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Area
                                type="monotone"
                                dataKey="Plant Queue"
                                stackId="1"
                                stroke="#8884d8"
                                fill="#8884d8"
                            />
                            <Area
                                type="monotone"
                                dataKey="Loading"
                                stackId="1"
                                stroke="#82ca9d"
                                fill="#82ca9d"
                            />
                            <Area
                                type="monotone"
                                dataKey="Traveling Loaded"
                                stackId="1"
                                stroke="#ffc658"
                                fill="#ffc658"
                            />
                            <Area
                                type="monotone"
                                dataKey="Paver Queue"
                                stackId="1"
                                stroke="#ff7300"
                                fill="#ff7300"
                            />
                            <Area
                                type="monotone"
                                dataKey="Unloading"
                                stackId="1"
                                stroke="#00ff00"
                                fill="#00ff00"
                            />
                            <Area
                                type="monotone"
                                dataKey="Traveling Empty"
                                stackId="1"
                                stroke="#0088fe"
                                fill="#0088fe"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Plant and Paver Utilization */}
            <Card>
                <CardHeader>
                    <CardTitle>Equipment Utilization Over Time</CardTitle>
                    <CardDescription>
                        Operating status of plant and paver (100% = active, 0% = idle)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={utilizationData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="time"
                                label={{ value: 'Time (hours)', position: 'insideBottom', offset: -10 }}
                            />
                            <YAxis
                                domain={[0, 100]}
                                label={{ value: 'Utilization (%)', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip
                                formatter={(value, name) => [`${value}%`, name]}
                                labelFormatter={(value) => `Time: ${value} hours`}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Line
                                type="stepAfter"
                                dataKey="Plant Active"
                                stroke="#8884d8"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                type="stepAfter"
                                dataKey="Paver Active"
                                stroke="#82ca9d"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Production and Laying Progress */}
            <Card>
                <CardHeader>
                    <CardTitle>Material Production and Laying Progress</CardTitle>
                    <CardDescription>
                        Cumulative tons produced by plant and laid by paver
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={productionData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="time"
                                label={{ value: 'Time (hours)', position: 'insideBottom', offset: -10 }}
                            />
                            <YAxis
                                label={{ value: 'Material (tons)', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip
                                formatter={(value, name) => [`${value} tons`, name]}
                                labelFormatter={(value) => `Time: ${value} hours`}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Line
                                type="monotone"
                                dataKey="Produced"
                                stroke="#8884d8"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="Laid"
                                stroke="#82ca9d"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
