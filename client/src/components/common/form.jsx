import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function CommonForm({formControls,formData,setFormData,onSubmit,buttonText,isBtnDisabled}) {
  
  const [showPassword, setShowPassword] = useState({});

  const togglePasswordVisibility = (name) => {
    setShowPassword(prev => ({
        ...prev,
        [name]: !prev[name]
    }));
  };

  function renderInputsByComponentType(getControlItem){
    let element = null;
    const value = formData[getControlItem.name]  || "";


    switch(getControlItem.componentType){
        case "input":
        const isPassword = getControlItem.type === 'password';
        const isVisible = showPassword[getControlItem.name];

        element = (
        <div className="relative flex items-center">
            <Input 
                name={getControlItem.name} 
                placeholder={getControlItem.placeholder} 
                id={getControlItem.name} 
                type = {isPassword ? (isVisible ? 'text' : 'password') : getControlItem.type}
                value={value}
                className="pr-10"
                onChange={event => setFormData({
                    ...formData,
                    [getControlItem.name] : event.target.value,
                })}
            />
            {isPassword && (
                <button
                    type="button"
                    onClick={() => togglePasswordVisibility(getControlItem.name)}
                    className="absolute right-3 text-slate-400 hover:text-primary transition-colors"
                >
                    {isVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            )}
        </div>
        )
        break;
        
        case "select":
        element =  (
        <Select value={value}
            onValueChange={(value)=>setFormData({...formData, [getControlItem.name]:value})}
        >
            <SelectTrigger className="w-full">
                <SelectValue placeholder={getControlItem.label} />
            </SelectTrigger>
            <SelectContent >
                {
                    getControlItem.options && 
                    getControlItem?.options.length>0 ?
                    getControlItem.options.map(optionItem => <SelectItem key={optionItem.id} value={optionItem.id}>{optionItem.label}</SelectItem>) :null
                }
            </SelectContent>
        </Select>
        )
        break;

        case "textarea":
        element = (
            <Textarea 
                name={getControlItem.name}
                placeholder={getControlItem.placeholder}
                id = {getControlItem.id}
                value={value}
                onChange={event => setFormData({
                    ...formData,
                    [getControlItem.name] : event.target.value,
                })}
            />
        );
        break;

        default:
            element = <Input name={getControlItem.name} placeholder={getControlItem.placeholder} id={getControlItem.name} 
            type = {getControlItem.type}
            value={value}
            onChange={event => setFormData({
                ...formData,
                [getControlItem.name] : event.target.value,
            })}
        />
        break;
        
    }
    return element;
  }

  

    return (
    <form onSubmit = {onSubmit}>
        <div className="flex flex-col gap-3">
            {
                formControls.map((controlItem) => {
                    return (
                        <div className="grid w-ful gap-1.5 " key = {controlItem.name}>
                            <Label className="mb-1">{controlItem.label}</Label>
                            {
                                renderInputsByComponentType(controlItem)
                            }
                        </div>
                    );
                })

            }
        </div>
        <Button className="mt-2 w-full" type="submit" disabled={isBtnDisabled} >{buttonText || "Submit"}</Button>
    </form>
  )
}
