import { useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, ArrowLeft } from "lucide-react";

export default function AuthForgotPassword() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const { toast } = useToast();

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await api.post("/auth/forgot-password", { email });
            if (response.data.success) {
                setIsSent(true);
                toast({
                    title: "Check your email",
                    description: response.data.message,
                });
            } else {
                toast({
                    title: "Error",
                    description: response.data.message,
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Failed to send reset link",
                description: error.response?.data?.message || "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-md space-y-8 bg-white/70 backdrop-blur-xl p-10 md:p-12 rounded-[3rem] shadow-premium border border-white/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors"></div>
            
            <div className="text-center relative z-10">
                <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-3 leading-tight">
                    Reset <span className="text-gradient-primary">Access</span>
                </h1>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
                    Identify your identity to recover
                </p>
            </div>

            {!isSent ? (
                <form onSubmit={onSubmit} className="space-y-6 relative z-10">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                        <div className="relative flex items-center">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your registered email"
                                className="flex h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <Mail className="absolute right-4 h-5 w-5 text-slate-400" />
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        disabled={isLoading} 
                        className="w-full h-12 rounded-2xl bg-primary text-white font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg hover:shadow-primary/25"
                    >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Reset Link"}
                    </Button>
                </form>
            ) : (
                <div className="text-center space-y-6 relative z-10">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <Mail className="h-10 w-10 text-primary" />
                    </div>
                    <p className="text-slate-600 font-medium">
                        If an account exists for <span className="font-bold text-slate-900">{email}</span>, you will receive a password reset link shortly.
                    </p>
                    <p className="text-xs text-slate-400">
                        Don't forget to check your spam folder.
                    </p>
                </div>
            )}

            <div className="pt-8 border-t border-slate-100 text-center relative z-10">
                <Link 
                    to="/auth/login" 
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all underline decoration-slate-200 hover:decoration-primary underline-offset-4"
                >
                    <ArrowLeft className="h-3 w-3" />
                    Back to Sign In
                </Link>
            </div>
        </div>
    );
}
