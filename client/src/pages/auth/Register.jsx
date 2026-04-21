import { registerUser } from "@/store/auth-slice";
import CommonForm from "../../components/common/form";
import { registerFormControls } from "@/config";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";


export default function AuthRegister() {

  const initialState = {
    userName: "",
    email: "",
    password: ""
  }

  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const onSubmit = async (e) => {
    try {
      e.preventDefault();
      const data = await dispatch(registerUser(formData));
      console.log("Data :", data);

      if (data?.payload?.success) {
        navigate("/auth/login");
        toast({
          title: data?.payload?.message
        });
      }
      else {
        toast({
          title: data?.payload?.message || "Something Went Wrong",
          variant: "destructive"
        });
      }


      console.log("Form Data : " + JSON.stringify(formData));

    } catch (error) {
      console.log(error)
    }
  }




  return (
    <div className="mx-auto w-full max-w-md space-y-8 bg-white/70 backdrop-blur-xl p-10 md:p-12 rounded-[3rem] shadow-premium border border-white/50 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors"></div>
      
      <div className="text-center relative z-10">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-3 leading-tight">
          Join <span className="text-gradient-primary">Us</span>
        </h1>
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
          Start Your Industrial Journey
        </p>
      </div>
      
      <div className="relative z-10">
        <CommonForm
          formControls={registerFormControls}
          buttonText={"Create Your Account"}
          formData={formData}
          setFormData={setFormData}
          onSubmit={onSubmit}
        />
      </div>

      <div className="pt-8 border-t border-slate-100 text-center relative z-10">
        <p className="text-sm font-medium text-slate-500">
          Already have an account?
          <Link 
            className="font-black ml-2 text-primary hover:text-slate-900 transition-all uppercase tracking-wider text-xs" 
            to="/auth/login"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
