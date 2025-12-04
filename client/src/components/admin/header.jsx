import { useDispatch } from "react-redux";
import { Button } from "../ui/button";
import { Menu,LogOut } from "lucide-react";
import { logout } from "@/store/auth-slice";
 
export default function AdminHeader({setOpen}) {

  const dispatch = useDispatch();
  const logoutUser = async()=>{
    try{
      const response = await dispatch(logout());
      console.log("Reponse Logout : ",response);

    }catch(error){
      console.log(error);
    }
  }
 
 
  return (
    <div className="flex ite,s-center justify-beteween px-4 py-3 bg-background border-b">
      <Button className="lg:hidden sm:block"  onClick={()=>setOpen(true)}>
        <Menu   />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      <div className="flex flex-1 justify-end ">
        <Button className="inline-flex gap-2 items-center rounded-md px-4 py-2 text-sm font-medium shadow" onClick={logoutUser}>
          <LogOut />
          Logout 
        </Button>
      </div>
    </div>
  )
}
