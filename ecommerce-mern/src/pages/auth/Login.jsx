import { loginUser } from "@/store/auth-slice";
import CommonForm from "../../components/common/form";
import { loginFormControls } from "@/config";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function AuthLogin() {

  const { toast } = useToast();
  const initialState = {
    email: "",
    password: ""
  }
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();

  const onSubmit = async (e) => {
    try {
      e.preventDefault();
      try {
        console.log("Form Data Login :", formData);
        const data = await dispatch(loginUser(formData));
        console.log("Data for login :", data);

        if (data?.payload?.success === true) {
          toast({
            title: data?.payload?.message,
          })
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
    <div className="mx-auto w-full max-w-md space-y-6 bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-gray-500">
          Don&apos;t have an account?
          <Link className="font-bold ml-2 text-primary hover:underline transition-all" to="/auth/register">Sign Up</Link>
        </p>
      </div>
      <CommonForm
        formControls={loginFormControls}
        buttonText={"Login"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
    </div>
  )
}
