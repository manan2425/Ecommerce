import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import account from "../../assets/account_industrial.png";
import Address from "@/components/shop/address";
import ShoppingOrders from "@/components/shop/orders";
import { useDispatch, useSelector } from "react-redux";
import { User, Package, MapPin, Mail, ShieldCheck, Phone } from "lucide-react";

export default function ShopAccount() {
  const { user } = useSelector(state => state.auth);

  return (
    <div className="flex flex-col w-full min-h-screen bg-mesh">
      {/* Cinematic Account Hero */}
      <div className="relative h-[250px] w-full overflow-hidden shadow-2xl">
        <img 
          src={account}
          alt="Account Banner"
          className="h-full w-full object-cover object-center scale-105 hover:scale-100 transition-transform duration-1000 opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
            <div className="container mx-auto">
                <div className="flex items-center gap-4 mb-2">
                    <div className="h-1 w-12 bg-primary rounded-full"></div>
                    <span className="text-white/60 text-xs font-black uppercase tracking-[0.3em]">User Profile</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                    Account <span className="text-primary font-light">Settings</span>
                </h1>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Sidebar Profile Card */}
            <div className="lg:col-span-4">
                <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-premium border border-white/50 p-8 sticky top-24 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
                    
                    <div className="text-center mb-8 relative z-10">
                        <div className="w-24 h-24 bg-primary rounded-[2rem] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                            <span className="text-3xl font-black text-white uppercase italic">
                                {user?.userName?.charAt(0) || <User className="h-10 w-10" />}
                            </span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">{user?.userName}</h2>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                            <ShieldCheck className="h-3 w-3" />
                            {user?.role === 'admin' ? 'System Administrator' : 'Verified Partner'}
                        </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-slate-100 relative z-10">
                        <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Email Address</p>
                                <p className="text-sm font-bold text-slate-700">{user?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                <Phone className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Phone Number</p>
                                <p className="text-sm font-bold text-slate-700">{user?.phone || 'Not provided'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-8">
                <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] shadow-premium border border-white/50 overflow-hidden min-h-[500px]">
                    <Tabs defaultValue="orders" className="w-full">
                        <div className="bg-slate-50/50 p-2 border-b border-slate-100">
                            <TabsList className="grid w-full grid-cols-2 bg-transparent gap-2 h-auto">
                                <TabsTrigger 
                                    value="orders" 
                                    className="data-[state=active]:bg-white data-[state=active]:shadow-premium rounded-2xl py-4 flex items-center gap-2 font-black uppercase tracking-widest text-[10px] transition-all"
                                >
                                    <Package className="h-4 w-4" />
                                    Order History
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="address" 
                                    className="data-[state=active]:bg-white data-[state=active]:shadow-premium rounded-2xl py-4 flex items-center gap-2 font-black uppercase tracking-widest text-[10px] transition-all"
                                >
                                    <MapPin className="h-4 w-4" />
                                    Saved Addresses
                                </TabsTrigger>
                            </TabsList>
                        </div>
                        <div className="p-8">
                            <TabsContent value="orders" className="mt-0 focus-visible:outline-none">
                                <ShoppingOrders />
                            </TabsContent>
                            <TabsContent value="address" className="mt-0 focus-visible:outline-none">
                                <Address />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>

        </div>
      </div>
    </div>
  )
}
