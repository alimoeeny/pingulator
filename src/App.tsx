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
    Object.values(rowRefs.current).forEach(ref => ref?.start());

    // Simulating the "global" stop after ~12s (10 pings * 1s + buffer)
    // Ideally this should be data driven but simple timeout works for UX
    setTimeout(() => setIsRunning(false), 12000);
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

  // Calculate fastest (only count legitimate values)
  useEffect(() => {
    let min = Infinity;
    let id: string | null = null;
    Object.entries(medians).forEach(([k, v]) => {
      if (v !== null && v > 0 && v < min) {
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
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 pb-24 selection:bg-indigo-100 selection:text-indigo-900">
      <Header isRunning={isRunning} onToggle={isRunning ? handleStop : handleStart} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Hero / Info Section */}
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
            Global Latency Check
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Measure your connection latency to Google Cloud regions and other popular services directly from your browser.
          </p>
        </div>

        <div className="space-y-8 mx-4 sm:mx-0">
          {groups.map(group => (
            <div key={group} className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 overflow-hidden transition-all hover:shadow-md">
              {/* Group Header */}
              <div className="bg-slate-50/80 backdrop-blur-sm px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-16 z-10 supports-[backdrop-filter]:bg-slate-50/60">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{group}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    {groupedEndpoints[group].length}
                  </span>
                </div>
              </div>

              {/* Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6 w-1/2">Location</th>
                    <th className="py-4 px-6 hidden md:table-cell">Region ID</th>
                    <th className="py-4 px-6 text-right">Latency</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedEndpoints[group].sort((a, b) => {
                    // Sort by median if available, else label
                    const medA = medians[a.id] || Infinity;
                    const medB = medians[b.id] || Infinity;
                    // Push non-started/null to bottom but keep alphabetical
                    if (medA === Infinity && medB === Infinity) return a.label.localeCompare(b.label);
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

        <div className="mt-12 text-center text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
          <p>
            For "Custom Sites", we use opaque network requests to estimate connection time.
            Precise values may vary due to network conditions and CORS policies.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
