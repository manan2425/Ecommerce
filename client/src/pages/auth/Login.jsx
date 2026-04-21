import { loginUser } from "@/store/auth-slice";
import CommonForm from "../../components/common/form";
import { loginFormControls } from "@/config";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { logUserLogin } from "@/lib/activityTracker";

export default function AuthLogin() {

  const { toast } = useToast();
  const initialState = {
    email: "",
    password: ""
  }
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const onSubmit = async (e) => {
    try {
      e.preventDefault();
      try {
        console.log("Form Data Login :", formData);
        const data = await dispatch(loginUser(formData));
        console.log("Data for login :", data);

        if (data?.payload?.success === true) {
          // Log user login activity
          logUserLogin();
          toast({
            title: data?.payload?.message,
          })
          // Navigate based on user role
          if (data.payload.user.role === "admin") {
            navigate("/admin/dashboard");
          } else {
            navigate("/shop/home");
          }
        }
        else {

          toast({
            title: data?.payload?.message || "Something Went Wrong",
            variant: "destructive"
          })
        }

      } catch (error) {
        console.log(error);
      }

    } catch (error) {
      console.log(error);
    }
  }


  return (
    <div className="mx-auto w-full max-w-md space-y-8 bg-white/70 backdrop-blur-xl p-10 md:p-12 rounded-[3rem] shadow-premium border border-white/50 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors"></div>
      
      <div className="text-center relative z-10">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-3 leading-tight">
          Welcome <span className="text-gradient-primary">Back</span>
        </h1>
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
          The Future of Industrial Excellence
        </p>
      </div>
      
      <div className="relative z-10">
        <CommonForm
          formControls={loginFormControls}
          buttonText={"Login to Dashboard"}
          formData={formData}
          setFormData={setFormData}
          onSubmit={onSubmit}
        />
        
        <div className="mt-6 flex justify-center">
            <Link 
                to="/auth/forgot-password" 
                className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors duration-300"
            >
                Forgot your password?
            </Link>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-100 text-center relative z-10">
        <p className="text-sm font-medium text-slate-500">
          Don&apos;t have an account?
          <Link 
            className="font-black ml-2 text-primary hover:text-slate-900 transition-all uppercase tracking-wider text-xs" 
            to="/auth/register"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  )
}
