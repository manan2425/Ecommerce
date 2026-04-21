import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function AuthResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            return toast({
                title: "Passwords do not match",
                variant: "destructive",
            });
        }

        if (password.length < 6) {
            return toast({
                title: "Weak password",
                description: "Password must be at least 6 characters long",
                variant: "destructive",
            });
        }

        setIsLoading(true);
        try {
            const response = await api.post("/auth/reset-password", { 
                token, 
                password 
            });
            
            if (response.data.success) {
                toast({
                    title: "Success",
                    description: "Password reset successful! Redirecting to login...",
                });
                setTimeout(() => navigate("/auth/login"), 2000);
            } else {
                toast({
                    title: "Reset Failed",
                    description: response.data.message,
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to reset password",
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
                    New <span className="text-gradient-primary">Password</span>
                </h1>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
                    Set a secure credential for your account
                </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6 relative z-10">
                {/* Password field */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">New Password</label>
                    <div className="relative flex items-center">
                        <input
                            type={showPass ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min. 6 characters"
                            className="flex h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="absolute right-3 text-slate-400 hover:text-primary"
                        >
                            {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Confirm Password field */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Confirm Password</label>
                    <div className="relative flex items-center">
                        <input
                            type={showConfirm ? "text" : "password"}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repeat new password"
                            className="flex h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 text-slate-400 hover:text-primary"
                        >
                            {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full h-12 rounded-2xl bg-primary text-white font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg hover:shadow-primary/25"
                >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Update Password"}
                </Button>
            </form>

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
