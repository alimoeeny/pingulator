interface Props {
    isRunning: boolean;
    onToggle: () => void;
}

export const Header: React.FC<Props> = ({ isRunning, onToggle }) => {
    return (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/60 supports-[backdrop-filter]:bg-white/60">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 rounded-full animate-pulse"></div>
                        <img src="/favicon.svg" alt="Logo" className="w-8 h-8 relative z-10" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">DNS Spray</h1>
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Latency Test</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 bg-slate-100/50 px-3 py-1.5 rounded-full border border-slate-200/50">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="font-medium">Online</span>
                    </div>

                    <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

                    <button
                        onClick={onToggle}
                        className={`
                            group relative flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300
                            shadow-sm active:scale-95 ring-offset-2 focus:ring-2
                            ${isRunning
                                ? 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 hover:border-rose-300 focus:ring-rose-200'
                                : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg focus:ring-slate-400 border border-transparent'}
                        `}
                    >
                        {isRunning ? (
                            <>
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                </span>
                                Stop Test
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                Start Test
                            </>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
};
