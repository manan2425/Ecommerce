import React from 'react';
import { Settings, Cpu, ShieldCheck } from 'lucide-react';

const FullPageLoader = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white overflow-hidden">
      {/* Animated Mesh Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/5 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo/Icon Container */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-ping opacity-20"></div>
          <div className="relative bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-100 flex items-center justify-center">
            <div className="relative">
              <Settings className="h-16 w-16 text-primary animate-[spin_4s_linear_infinite]" />
              <Cpu className="h-8 w-8 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
          </div>
          
          {/* Orbits */}
          <div className="absolute -top-4 -right-4 h-8 w-8 bg-white rounded-full shadow-md border border-slate-50 flex items-center justify-center animate-bounce delay-100">
             <ShieldCheck className="h-4 w-4 text-green-500" />
          </div>
        </div>

        {/* Text Section */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            SHREE MARUTI <span className="text-primary">TRADERS</span>
          </h2>
          <div className="flex flex-col items-center space-y-2">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-slate-400 animate-pulse">
              Initializing Solutions
            </p>
            <div className="h-1 w-48 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-1/3 rounded-full animate-industrial-loading"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="absolute bottom-12 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
          Industrial Automation & Control Systems
        </p>
      </div>
    </div>
  );
};

export default FullPageLoader;
