import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'fr';

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

interface LanguageProviderProps {
    children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => {
        const savedLanguage = localStorage.getItem('language') as Language;
        return savedLanguage || 'en';
    });

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const t = (key: string): string => {
        return (translations[language] as Record<string, string>)[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

const translations = {
    en: {
        // Header
        'app.title': 'Asphalt Laying Simulation',
        'app.description': 'Optimize truck fleet operations with realistic variable speeds for asphalt laying projects',

        // Tabs
        'tabs.simulation': 'Single Simulation',
        'tabs.optimization': 'Fleet Optimization',

        // Simulation Parameters
        'params.title': 'Simulation Parameters',
        'params.description': 'Configure the simulation settings',
        'params.totalTrucks': 'Total Trucks',
        'params.targetQuantity': 'Target Quantity (tons)',
        'params.truckCapacity': 'Truck Capacity (tons)',
        'params.distance': 'Distance (km)',
        'params.plantLoadingTime': 'Plant Loading Time (min)',
        'params.paverUnloadingTime': 'Paver Unloading Time (min)',
        'params.loadedSpeedMin': 'Loaded Speed Min (km/h)',
        'params.loadedSpeedMax': 'Loaded Speed Max (km/h)',
        'params.emptySpeedMin': 'Empty Speed Min (km/h)',
        'params.emptySpeedMax': 'Empty Speed Max (km/h)',
        'params.initialQueue': 'Initial Queue at Paver',

        // Buttons
        'button.runSimulation': 'Run Simulation',
        'button.runningSimulation': 'Running Simulation...',
        'button.runOptimization': 'Run Optimization Analysis',
        'button.runningOptimization': 'Running Optimization...',

        // Results
        'results.title': 'Simulation Results',
        'results.description': 'Key performance metrics',
        'results.totalTime': 'Total Time',
        'results.completionStatus': 'Completion Status',
        'results.completed': 'Completed',
        'results.notCompleted': 'Not Completed',
        'results.plantUtilization': 'Plant Utilization',
        'results.paverUtilization': 'Paver Utilization',
        'results.effectivePaverUtilization': 'Effective Paver Utilization',
        'results.totalPaverIdleTime': 'Total Paver Idle Time',
        'results.effectivePaverIdleTime': 'Effective Paver Idle Time',
        'results.effectivePaverTime': 'Effective Paver Time',
        'results.longestIdleBetweenUnloads': 'Longest Idle Between Unloads',
        'results.materialLaid': 'Material Laid',
        'results.projectCompleted': 'Project Completed',
        'results.noData': 'Run a simulation to see results',
        'results.yes': 'Yes',
        'results.no': 'No',
        'results.hours': 'hrs',
        'results.minutes': 'min',
        'results.tons': 'tons',

        // Optimization
        'optimization.title': 'Fleet Optimization',
        'optimization.description': 'Find the optimal number of trucks and initial queue size to minimize paver idle time. Tests configurations from 3 trucks up to your current setting + 5 trucks ({maxTrucks}).',
        'optimization.optimalFound': 'Optimal Configuration Found:',
        'optimization.trucks': 'Trucks',
        'optimization.initialQueue': 'Initial Queue',
        'optimization.totalPaverIdleTime': 'Total Paver Idle Time',
        'optimization.effectivePaverIdleTime': 'Effective Paver Idle Time',
        'optimization.totalTime': 'Total Time',
        'optimization.effectivePaverTime': 'Effective Paver Time',
        'optimization.longestIdleBetweenUnloads': 'Longest Idle Between Unloads',
        'optimization.paverUtilization': 'Paver Utilization',
        'optimization.effectivePaverUtilization': 'Effective Paver Utilization',

        // Charts
        'charts.totalProduced': 'Total Produced',
        'charts.totalLaid': 'Total Laid',
        'charts.avgUtilization': 'Avg Utilization',
        'charts.efficiency': 'Efficiency',
        'charts.truckDistribution': 'Truck Distribution Over Time',
        'charts.truckDistributionDesc': 'Real-time tracking of truck positions throughout the simulation',
        'charts.dataPoints': 'data points',
        'charts.equipmentUtilization': 'Equipment Utilization',
        'charts.equipmentUtilizationDesc': 'Real-time operating status of plant and paver',
        'charts.productionProgress': 'Production & Laying Progress',
        'charts.productionProgressDesc': 'Cumulative material production and laying over time',
        'charts.time': 'Time',
        'charts.timeHours': 'Time (hours)',
        'charts.numberOfTrucks': 'Number of Trucks',
        'charts.utilization': 'Utilization (%)',
        'charts.material': 'Material (tons)',
        'charts.tons': 'tons',
        'charts.plantQueue': 'Plant Queue',
        'charts.loading': 'Loading',
        'charts.travelingLoaded': 'Traveling Loaded',
        'charts.paverQueue': 'Paver Queue',
        'charts.unloading': 'Unloading',
        'charts.travelingEmpty': 'Traveling Empty',
        'charts.plantActive': 'Plant Active',
        'charts.paverActive': 'Paver Active',
        'charts.produced': 'Produced',
        'charts.laid': 'Laid',

        // Optimization Charts
        'optCharts.configuration': 'Configuration',
        'optCharts.trucks': 'trucks',
        'optCharts.queue': 'queue',
        'optCharts.idleTime': 'Idle Time:',
        'optCharts.totalTime': 'Total Time:',
        'optCharts.utilization': 'Utilization:',
        'optCharts.effIdleTime': 'Eff. Idle Time:',
        'optCharts.effUtilization': 'Eff. Utilization:',
        'optCharts.longestIdle': 'Longest Idle:',
        'optCharts.idleTimeAnalysis': 'Idle Time Analysis',
        'optCharts.idleTimeAnalysisDesc': 'Paver idle time vs truck configuration - lower is better',
        'optCharts.optimalPoint': 'Optimal Point',
        'optCharts.effIdleTimeAnalysis': 'Effective Idle Time Analysis',
        'optCharts.effIdleTimeAnalysisDesc': 'Effective paver idle time vs truck configuration (excludes initial/final idle)',
        'optCharts.utilizationAnalysis': 'Equipment Utilization Analysis',
        'optCharts.utilizationAnalysisDesc': 'Average equipment utilization across different configurations',
        'optCharts.effUtilizationAnalysis': 'Effective Utilization Analysis',
        'optCharts.effUtilizationAnalysisDesc': 'Effective equipment utilization (excludes initial/final idle periods)',
        'optCharts.configurationAnalysis': 'Configuration Analysis',
        'optCharts.configurationAnalysisDesc': 'Performance metrics for each truck and initial queue configuration',
        'optCharts.truckCount': 'Truck Count',
        'optCharts.initialQueue': 'Initial Queue Size',
        'optCharts.paverIdleHours': 'Paver Idle Time (hours)',
        'optCharts.effPaverIdleHours': 'Effective Paver Idle Time (hours)',
        'optCharts.avgUtilizationPercent': 'Average Utilization (%)',
        'optCharts.effUtilizationPercent': 'Effective Utilization (%)',
        'optCharts.totalConfigs': 'Total Configurations',
        'optCharts.bestIdleTime': 'Best Idle Time',
        'optCharts.avgIdleTime': 'Avg Idle Time',
        'optCharts.avgUtilization': 'Avg Utilization',
        'optCharts.optimalConfig': 'Optimal Config',
        'optCharts.configurations': 'configurations',
        'optCharts.numberOfTrucks': 'Number of Trucks',
        'optCharts.idleTimeHours': 'Idle Time (hours)',
        'optCharts.minimum': 'Minimum',
        'optCharts.averageRange': 'Average Range',
        'optCharts.maximumRange': 'Maximum Range',
        'optCharts.toAverage': 'To Average',
        'optCharts.toMaximum': 'To Maximum',
        'optCharts.trucksLabel': 'Trucks',
        'optCharts.idleTimeRangeAnalysis': 'Idle Time Range Analysis by Truck Count',
        'optCharts.idleTimeRangeDesc': 'Stacked view showing the range of idle times across different truck configurations',
        'optCharts.topConfigurations': 'Top 10 Configurations',
        'optCharts.topConfigurationsDesc': 'Best configurations ranked by efficiency and resource optimization',
        'optCharts.rank': 'Rank',
        'optCharts.queueCol': 'Queue',
        'optCharts.idleTimeCol': 'Idle Time',
        'optCharts.utilizationCol': 'Utilization',

        // Language
        'language.switch': 'Switch Language',
        'language.english': 'English',
        'language.french': 'Français',
    },
    fr: {
        // Header
        'app.title': 'Simulation de Pose d\'Enrobés',
        'app.description': 'Optimisez les opérations de flotte de camions avec des vitesses variables réalistes pour les projets de pose d\'enrobés',

        // Tabs
        'tabs.simulation': 'Simulation Simple',
        'tabs.optimization': 'Optimisation de Flotte',

        // Simulation Parameters
        'params.title': 'Paramètres de Simulation',
        'params.description': 'Configurez les paramètres de simulation',
        'params.totalTrucks': 'Camions Totaux',
        'params.targetQuantity': 'Quantité Cible (tonnes)',
        'params.truckCapacity': 'Capacité du Camion (tonnes)',
        'params.distance': 'Distance (km)',
        'params.plantLoadingTime': 'Temps de Chargement Usine (min)',
        'params.paverUnloadingTime': 'Temps de Déchargement Finisseur (min)',
        'params.loadedSpeedMin': 'Vitesse Min Chargé (km/h)',
        'params.loadedSpeedMax': 'Vitesse Max Chargé (km/h)',
        'params.emptySpeedMin': 'Vitesse Min Vide (km/h)',
        'params.emptySpeedMax': 'Vitesse Max Vide (km/h)',
        'params.initialQueue': 'File d\'Attente Initiale au Finisseur',

        // Buttons
        'button.runSimulation': 'Lancer la Simulation',
        'button.runningSimulation': 'Simulation en Cours...',
        'button.runOptimization': 'Lancer l\'Analyse d\'Optimisation',
        'button.runningOptimization': 'Optimisation en Cours...',

        // Results
        'results.title': 'Résultats de Simulation',
        'results.description': 'Indicateurs de performance clés',
        'results.totalTime': 'Temps Total',
        'results.completionStatus': 'Statut d\'Achèvement',
        'results.completed': 'Terminé',
        'results.notCompleted': 'Non Terminé',
        'results.plantUtilization': 'Utilisation de l\'Usine',
        'results.paverUtilization': 'Utilisation du Finisseur',
        'results.effectivePaverUtilization': 'Utilisation Effective du Finisseur',
        'results.totalPaverIdleTime': 'Temps d\'Arrêt Total du Finisseur',
        'results.effectivePaverIdleTime': 'Temps d\'Arrêt Effectif du Finisseur',
        'results.effectivePaverTime': 'Temps Effectif du Finisseur',
        'results.longestIdleBetweenUnloads': 'Plus Long Arrêt entre Déchargements',
        'results.materialLaid': 'Matériau Posé',
        'results.projectCompleted': 'Projet Terminé',
        'results.noData': 'Lancez une simulation pour voir les résultats',
        'results.yes': 'Oui',
        'results.no': 'Non',
        'results.hours': 'h',
        'results.minutes': 'min',
        'results.tons': 'tonnes',

        // Optimization
        'optimization.title': 'Optimisation de Flotte',
        'optimization.description': 'Trouvez le nombre optimal de camions et la taille de file d\'attente initiale pour minimiser le temps d\'arrêt du finisseur. Teste les configurations de 3 camions jusqu\'à votre paramètre actuel + 5 camions ({maxTrucks}).',
        'optimization.optimalFound': 'Configuration Optimale Trouvée :',
        'optimization.trucks': 'Camions',
        'optimization.initialQueue': 'File d\'Attente Initiale',
        'optimization.totalPaverIdleTime': 'Temps d\'Arrêt Total du Finisseur',
        'optimization.effectivePaverIdleTime': 'Temps d\'Arrêt Effectif du Finisseur',
        'optimization.totalTime': 'Temps Total',
        'optimization.effectivePaverTime': 'Temps Effectif du Finisseur',
        'optimization.longestIdleBetweenUnloads': 'Plus Long Arrêt entre Déchargements',
        'optimization.paverUtilization': 'Utilisation du Finisseur',
        'optimization.effectivePaverUtilization': 'Utilisation Effective du Finisseur',

        // Charts
        'charts.totalProduced': 'Total Produit',
        'charts.totalLaid': 'Total Posé',
        'charts.avgUtilization': 'Utilisation Moy.',
        'charts.efficiency': 'Efficacité',
        'charts.truckDistribution': 'Distribution des Camions dans le Temps',
        'charts.truckDistributionDesc': 'Suivi en temps réel des positions des camions tout au long de la simulation',
        'charts.dataPoints': 'points de données',
        'charts.equipmentUtilization': 'Utilisation des Équipements',
        'charts.equipmentUtilizationDesc': 'État de fonctionnement en temps réel de l\'usine et du finisseur',
        'charts.productionProgress': 'Progrès de Production et de Pose',
        'charts.productionProgressDesc': 'Production et pose cumulatives de matériaux dans le temps',
        'charts.time': 'Temps',
        'charts.timeHours': 'Temps (heures)',
        'charts.numberOfTrucks': 'Nombre de Camions',
        'charts.utilization': 'Utilisation (%)',
        'charts.material': 'Matériau (tonnes)',
        'charts.tons': 'tonnes',
        'charts.plantQueue': 'File d\'Attente Usine',
        'charts.loading': 'Chargement',
        'charts.travelingLoaded': 'Voyage Chargé',
        'charts.paverQueue': 'File d\'Attente Finisseur',
        'charts.unloading': 'Déchargement',
        'charts.travelingEmpty': 'Voyage Vide',
        'charts.plantActive': 'Usine Active',
        'charts.paverActive': 'Finisseur Actif',
        'charts.produced': 'Produit',
        'charts.laid': 'Posé',

        // Optimization Charts
        'optCharts.configuration': 'Configuration',
        'optCharts.trucks': 'camions',
        'optCharts.queue': 'file',
        'optCharts.idleTime': 'Temps d\'Arrêt :',
        'optCharts.totalTime': 'Temps Total :',
        'optCharts.utilization': 'Utilisation :',
        'optCharts.effIdleTime': 'Temps d\'Arrêt Eff. :',
        'optCharts.effUtilization': 'Utilisation Eff. :',
        'optCharts.longestIdle': 'Plus Long Arrêt :',
        'optCharts.idleTimeAnalysis': 'Analyse du Temps d\'Arrêt',
        'optCharts.idleTimeAnalysisDesc': 'Temps d\'arrêt du finisseur vs configuration des camions - plus faible est mieux',
        'optCharts.optimalPoint': 'Point Optimal',
        'optCharts.effIdleTimeAnalysis': 'Analyse du Temps d\'Arrêt Effectif',
        'optCharts.effIdleTimeAnalysisDesc': 'Temps d\'arrêt effectif du finisseur vs configuration des camions (exclut l\'arrêt initial/final)',
        'optCharts.utilizationAnalysis': 'Analyse de l\'Utilisation des Équipements',
        'optCharts.utilizationAnalysisDesc': 'Utilisation moyenne des équipements selon différentes configurations',
        'optCharts.effUtilizationAnalysis': 'Analyse de l\'Utilisation Effective',
        'optCharts.effUtilizationAnalysisDesc': 'Utilisation effective des équipements (exclut les périodes d\'arrêt initial/final)',
        'optCharts.configurationAnalysis': 'Analyse des Configurations',
        'optCharts.configurationAnalysisDesc': 'Indicateurs de performance pour chaque configuration de camions et file d\'attente initiale',
        'optCharts.truckCount': 'Nombre de Camions',
        'optCharts.initialQueue': 'Taille de File d\'Attente Initiale',
        'optCharts.paverIdleHours': 'Temps d\'Arrêt Finisseur (heures)',
        'optCharts.effPaverIdleHours': 'Temps d\'Arrêt Effectif Finisseur (heures)',
        'optCharts.avgUtilizationPercent': 'Utilisation Moyenne (%)',
        'optCharts.effUtilizationPercent': 'Utilisation Effective (%)',
        'optCharts.totalConfigs': 'Configurations Totales',
        'optCharts.bestIdleTime': 'Meilleur Temps d\'Arrêt',
        'optCharts.avgIdleTime': 'Temps d\'Arrêt Moy.',
        'optCharts.avgUtilization': 'Utilisation Moy.',
        'optCharts.optimalConfig': 'Config Optimale',
        'optCharts.configurations': 'configurations',
        'optCharts.numberOfTrucks': 'Nombre de Camions',
        'optCharts.idleTimeHours': 'Temps d\'Arrêt (heures)',
        'optCharts.minimum': 'Minimum',
        'optCharts.averageRange': 'Plage Moyenne',
        'optCharts.maximumRange': 'Plage Maximale',
        'optCharts.toAverage': 'Vers Moyenne',
        'optCharts.toMaximum': 'Vers Maximum',
        'optCharts.trucksLabel': 'Camions',
        'optCharts.idleTimeRangeAnalysis': 'Analyse des Plages de Temps d\'Arrêt par Nombre de Camions',
        'optCharts.idleTimeRangeDesc': 'Vue empilée montrant la plage des temps d\'arrêt selon différentes configurations de camions',
        'optCharts.topConfigurations': 'Top 10 des Configurations',
        'optCharts.topConfigurationsDesc': 'Meilleures configurations classées par efficacité et optimisation des ressources',
        'optCharts.rank': 'Rang',
        'optCharts.queueCol': 'File',
        'optCharts.idleTimeCol': 'Temps d\'Arrêt',
        'optCharts.utilizationCol': 'Utilisation',

        // Language
        'language.switch': 'Changer de Langue',
        'language.english': 'English',
        'language.french': 'Français',
    }
};
