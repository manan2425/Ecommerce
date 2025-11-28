import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import account from "../../assets/account.jpg";
import Address from "@/components/shop/address";
import ShoppingOrders from "@/components/shop/orders";
import { useDispatch } from "react-redux";

export default function ShopAccount() {




  return (
    <>
      <div className="flex flex-col w-full overflow-hidden">
        <div className="relative h-[300px] w-full overflow-hidden">
          <img 
            src={account}
 
            className="h-full w-full object-cover object-center"/>
        </div>
        <div className="container px-5 mx-auto grid grid-cols-1 gap-8 py-8">
          <div className="flex flex-col rounded-lg border bg-background p-6 shadow-sm">
            <Tabs defaultValue="orders">
              <TabsList>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="address">Address</TabsTrigger>
              </TabsList>
              <TabsContent value="orders">
                <ShoppingOrders/>
              </TabsContent>
              <TabsContent value="address">
                <Address/>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  )
}
