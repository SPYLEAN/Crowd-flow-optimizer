import { useState } from 'react';
import { PRESETS } from './data/presets';
import { initializeSimulationState } from './services/simulationEngine';
import { Navbar } from './components/Navbar';
import { LandingPage } from './views/LandingPage';
import { ControlRoomView } from './views/ControlRoomView';
import { ScenarioBuilderView } from './views/ScenarioBuilderView';
import { DataReadinessView } from './views/DataReadinessView';
import { JudgeDemoOverlay } from './views/JudgeDemoOverlay';

export function App() {
  const [activeTab, setActiveTab] = useState<
    'landing' | 'control_room' | 'scenario_builder' | 'data_readiness'
  >('landing');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('ipl_stadium');

  const [simulationState, setSimulationState] = useState(() =>
    initializeSimulationState(PRESETS.ipl_stadium)
  );

  const [isJudgeDemoOpen, setIsJudgeDemoOpen] = useState<boolean>(false);
  const [nlpStatus, setNlpStatus] = useState<'connected' | 'fallback' | 'unknown'>('unknown');

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const targetPreset = PRESETS[presetId] || PRESETS.ipl_stadium;
    setSimulationState(initializeSimulationState(targetPreset));
  };

  const handleResetSimulation = () => {
    const targetPreset = PRESETS[selectedPresetId] || PRESETS.ipl_stadium;
    setSimulationState(initializeSimulationState(targetPreset));
  };

  const handleStartJudgeDemo = () => {
    handleSelectPreset('ipl_stadium');
    setActiveTab('control_room');
    setIsJudgeDemoOpen(true);
  };

  const layoutClass = activeTab === 'control_room'
    ? "h-screen overflow-hidden"
    : "min-h-screen";

  return (
    <div className={`${layoutClass} bg-[#07090e] text-slate-100 control-grid-bg flex flex-col font-sans`}>
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedPresetId={selectedPresetId}
        onSelectPreset={handleSelectPreset}
        onStartJudgeDemo={handleStartJudgeDemo}
        nlpStatus={nlpStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0">
        {activeTab === 'landing' && (
          <LandingPage
            onGoToControlRoom={() => setActiveTab('control_room')}
            onSelectPreset={handleSelectPreset}
            onStartJudgeDemo={handleStartJudgeDemo}
          />
        )}

        {activeTab === 'control_room' && (
          <ControlRoomView
            simulationState={simulationState}
            setSimulationState={setSimulationState}
            onResetSimulation={handleResetSimulation}
            onNlpStatusChange={setNlpStatus}
            nlpStatus={nlpStatus}
          />
        )}

        {activeTab === 'scenario_builder' && (
          <ScenarioBuilderView
            simulationState={simulationState}
            setSimulationState={setSimulationState}
            onSelectPreset={handleSelectPreset}
          />
        )}

        {activeTab === 'data_readiness' && (
          <DataReadinessView selectedPresetId={selectedPresetId} />
        )}
      </main>

      {/* Judge Demo Auto-Pilot Presentation Overlay */}
      {isJudgeDemoOpen && (
        <JudgeDemoOverlay
          simulationState={simulationState}
          setSimulationState={setSimulationState}
          onClose={() => setIsJudgeDemoOpen(false)}
          onSelectPreset={handleSelectPreset}
        />
      )}

      {/* Footer / Safety Disclaimer */}
      <footer className="border-t border-slate-900 bg-[#07090e]/90 text-slate-400 py-4 px-6 text-center text-xs font-mono">
        <div className="max-w-[1500px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <div>
            <strong className="text-white">VenuePulse AI</strong>: Real-Time Crowd Intelligence & Rerouting Console
            &bull; Tagline: <em>"Predict bottlenecks. Reroute safely. Keep venues moving."</em>
          </div>
          <div className="text-slate-400">
            ⚠️ <span className="text-amber-400 font-bold">Safety Disclaimer:</span> Decision-support system for trained venue operators. All sensor data is simulated.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
