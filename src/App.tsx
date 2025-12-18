import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { EndpointRow } from './components/EndpointRow';
import type { EndpointRowRef } from './components/EndpointRow';
import endpointsData from './data/endpoints.json';
import type { Endpoint } from './types';

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [medians, setMedians] = useState<Record<string, number | null>>({});
  const [fastestId, setFastestId] = useState<string | null>(null);

  // Group endpoints
  const groupedEndpoints = endpointsData.reduce((acc, curr) => {
    const group = curr.group || 'GCP';
    if (!acc[group]) acc[group] = [];
    acc[group].push(curr);
    return acc;
  }, {} as Record<string, Endpoint[]>);

  // refs to control pingers
  const rowRefs = useRef<Record<string, EndpointRowRef | null>>({});

  const handleStart = () => {
    setIsRunning(true);
    // Start all pings
    Object.values(rowRefs.current).forEach(ref => ref?.start());

    // Auto-stop is handled by individual hooks (10 iterations),
    // but we need to track global state.
    // For simplicity, we'll just toggle the button state after a timeout or let user stop.
    // Or better: update isRunning when all are done?
    // Let's just create a global timeout for the button state for now (approx 10s is enough for 10 pings)
    setTimeout(() => setIsRunning(false), 15000);
  };

  const handleStop = () => {
    setIsRunning(false);
    Object.values(rowRefs.current).forEach(ref => ref?.stop());
  };

  const handleMedianUpdate = (id: string, median: number | null) => {
    setMedians(prev => {
      const next = { ...prev, [id]: median };
      return next;
    });
  };

  // Calculate fastest
  useEffect(() => {
    let min = Infinity;
    let id: string | null = null;
    Object.entries(medians).forEach(([k, v]) => {
      if (v !== null && v < min) {
        min = v;
        id = k;
      }
    });
    setFastestId(id);
  }, [medians]);

  // Initial start
  useEffect(() => {
    handleStart();
    return () => handleStop();
  }, []);

  // Sort groups: Custom first, then GCP
  const groups = Object.keys(groupedEndpoints).sort((a, b) => {
    if (a === 'GCP') return 1;
    if (b === 'GCP') return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      <Header isRunning={isRunning} onToggle={isRunning ? handleStop : handleStart} />

      <main className="max-w-4xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {groups.map(group => (
            <div key={group}>
              {/* Group Header */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between sticky top-16 z-10">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{group}</h3>
                <span className="text-xs text-gray-400">{groupedEndpoints[group].length} locations</span>
              </div>

              {/* Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-4 font-semibold w-1/2">Location</th>
                    <th className="py-3 px-4 font-semibold hidden md:table-cell">Region ID</th>
                    <th className="py-3 px-4 font-semibold text-right">Latency</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedEndpoints[group].sort((a, b) => {
                    // Sort by median if available, else label
                    const medA = medians[a.id] || Infinity;
                    const medB = medians[b.id] || Infinity;
                    if (medA !== medB) return medA - medB;
                    return a.label.localeCompare(b.label);
                  }).map(endpoint => (
                    <EndpointRow
                      key={endpoint.id}
                      endpoint={endpoint}
                      isFastest={endpoint.id === fastestId}
                      onMedianUpdate={handleMedianUpdate}
                      ref={el => { rowRefs.current[endpoint.id] = el; }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            This tool measures latency from your browser to Google Cloud regions.<br />
            For "Custom Sites", it uses opaque pinging to estimate connection time.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
