import { SimulationDashboard } from './components/SimulationDashboard';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
    return (
        <LanguageProvider>
            <SimulationDashboard />
        </LanguageProvider>
    );
}

export default App;
