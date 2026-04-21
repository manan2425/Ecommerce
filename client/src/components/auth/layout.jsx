
import { Outlet } from "react-router-dom";



export default function AuthLayout() {
    return (
        <div className="flex min-h-screen w-full bg-mesh">
            {/* Cinematic Left Panel */}
            <div className="hidden lg:flex relative items-center justify-center w-1/2 overflow-hidden bg-slate-900 shadow-2xl">
                {/* Dynamic Background Elements */}
                <div className="absolute inset-0 bg-[url('/hero-industrial.png')] bg-cover bg-center mix-blend-overlay opacity-60"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/80 via-primary/40 to-transparent"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-mesh opacity-30"></div>
                
                {/* Animated Glows */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

                <div className="relative z-10 max-w-lg px-12 text-center">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-12 rounded-[3.5rem] shadow-2xl">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest mb-6">
                            Industrial Excellence
                        </div>
                        <h1 className="text-5xl font-black text-white leading-tight tracking-tighter mb-6">
                            Precision <br />
                            <span className="text-primary-foreground/80">Redefined.</span>
                        </h1>
                        <p className="text-lg text-white/70 font-medium leading-relaxed">
                            Access the world's most advanced industrial automation and control solutions.
                        </p>
                    </div>
                </div>
            </div>

            {/* Auth Form Container */}
            <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-12 relative">
                <div className="w-full max-w-md relative z-10">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}
