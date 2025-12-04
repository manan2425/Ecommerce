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
    <div className="mx-auto w-full max-w-md space-y-6 bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-2">Create Account</h1>
        <p className="text-gray-500">
          Already have an account?
          <Link className="font-bold ml-2 text-primary hover:underline transition-all" to="/auth/login">Login</Link>
        </p>
      </div>
      <CommonForm
        formControls={registerFormControls}
        buttonText={"Sign Up"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
    </div>
  )
}
