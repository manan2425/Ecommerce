import ProductImageUpload from "@/components/admin/image-upload";
import { Input } from "@/components/ui/input";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { addProductFormElements } from "@/config";
import { addProduct, editProduct, fetchAllProducts } from "@/store/admin/product-slice";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@/hooks/use-toast";
import ProductTile from "@/components/admin/product-tile";

export default function AdminProducts() {
  
  const {toast} = useToast();
  const dispatch = useDispatch();
  const {products} = useSelector(state=>state.adminProducts);
  const [imageFile,setImageFile] = useState(null);
  const [uploadedImageUrl,setUploadedImageUrl] = useState("");
  const [imageLoad,setImageLoad] = useState(false);
  const [currentEditedId,setCurrentEditedId] = useState(null);
  const [openCreateProducts,setOpenCreateProducts] = useState(false);
 
  const initialState = {
    image :  "",
    title : "",
    description : "",
    category : "",
    brand : "",
    price : "",
    salePrice : "",
    totalStock : "",
    // model3dUrl removed — image-only hotspot workflow
    parts: [] // interactive 3D parts metadata
  };
  const [formData,setFormData] = useState(initialState);
  const [partForm, setPartForm] = useState({ name: '', nodeName: '', description: '', price: '' });
  
  const onSubmit = async(e)=>{
    try{
      e.preventDefault();
      const passData = { ...formData, image: uploadedImageUrl };
      console.log("Add or Edit Product Submission",passData);
      console.log("Edit Id : " + currentEditedId);
      if(currentEditedId!==null){
        const data = await dispatch(editProduct({id : currentEditedId,formData : passData}));

        if(data?.payload?.success===true){
          toast({
            title : data?.payload?.message || "Product Edited Successfully",
          });

          try{
            const getProducts = await dispatch(fetchAllProducts());
          }catch(error){
            console.log(error);
          }
          setOpenCreateProducts(false)
          setFormData(initialState);
          setCurrentEditedId(null);
          setImageFile(null);
        }
        else{
          console.log("Error :",data)
          toast({
            title : data?.payload?.message || "Something Went Wrong",
            variant : "destructive"
          })
        }
      }else{
        const data = await dispatch(addProduct(passData));
      
  
        if(data?.payload?.success===true){
          toast({
            title : data?.payload?.message || "Product Added Successfully",
          });
          try{
            const getProducts = await dispatch(fetchAllProducts());
          }catch(error){
            console.log(error);
          }
          setImageFile(null);
          setOpenCreateProducts(false)
          setFormData(initialState);
        }
        else{
          toast({
            title : data?.payload?.message || "Something Went Wrong",
            variant : "destructive"
          })
        }
      }  
    }catch(error){
      console.log(error)
    }
  }
 

  useEffect(()=>{
    const fetchProducts = async()=>{
      try{
        const response = await dispatch(fetchAllProducts());
      }catch(error){
        console.log(error);
      }
    }
    fetchProducts();
  },[dispatch]);

  // If the uploader created an uploadedImageUrl but formData.image hasn't been set yet,
  // copy the uploadedImageUrl into formData so validation and submission see the image.
  useEffect(() => {
    if (uploadedImageUrl && (!formData.image || `${formData.image}`.trim() === '')) {
      setFormData(prev => ({ ...prev, image: uploadedImageUrl }));
    }
  }, [uploadedImageUrl, setFormData, formData.image]);

  const isFormValid = () => {
    // Validate required product fields only (parts are optional)
    const required = ['image','title','description','category','brand','price','salePrice','totalStock'];
    return required.every(key => {
      // allow uploadedImageUrl to satisfy the `image` requirement
      if (key === 'image') {
        const hasImage = (formData.image && `${formData.image}`.trim() !== '') || (uploadedImageUrl && `${uploadedImageUrl}`.trim() !== '');
        return !!hasImage;
      }
      const v = formData[key];
      return v !== undefined && v !== null && `${v}`.trim() !== '';
    });
  };

  // helper: return list of missing required fields (friendly names)
  const missingRequiredFields = () => {
    const required = ['image','title','description','category','brand','price','salePrice','totalStock'];
    const friendly = {
      image: 'Image',
      title: 'Title',
      description: 'Description',
      category: 'Category',
      brand: 'Brand',
      price: 'Price',
      salePrice: 'Sale Price',
      totalStock: 'Total Stock'
    };
    return required.filter(k => {
      const v = formData[k];
      // prefer uploadedImageUrl when image is empty
      if (k === 'image') return !((formData.image && `${formData.image}`.trim() !== '') || (uploadedImageUrl && `${uploadedImageUrl}`.trim() !== ''));
      return v === undefined || v === null || `${v}`.trim() === '';
    }).map(k => friendly[k] || k);
  }

 
  

 

  
  return (
    <>
      <div className="mb-5 w-full flex justify-end">
        <Button onClick={()=>setOpenCreateProducts(true)}>Add New Product</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {
          products.length>0 ? (
            products.map((product,index)=>{
              return <ProductTile key={index} product={product} setFormData={setFormData} 
              setCurrentEditedId={setCurrentEditedId} setOpenCreateProducts={setOpenCreateProducts} 
              setUploadedImageUrl = {setUploadedImageUrl}
              currentEditedId = {currentEditedId}
              /> 
            })
          ) : (
            <></> 
          )
        }
      </div>



      <Sheet open={openCreateProducts} onOpenChange={(isOpen)=>{
        setOpenCreateProducts(false);
        setCurrentEditedId(null);
        setFormData(initialState);
        setImageFile(null);
        }
      }>
      
        <SheetContent side="right" className="overflow-auto"> 
          <SheetHeader>
            <SheetTitle>
              {
                currentEditedId!=null ?  "Edit Product" : "Add Product"
              }
            </SheetTitle>
          </SheetHeader>

          <ProductImageUpload 
            imageFile={imageFile} setImageFile={setImageFile} 
            uploadedImageUrl={uploadedImageUrl} 
            setUploadedImageUrl={setUploadedImageUrl} 
            imageLoad = {imageLoad}
            setImageLoad = {setImageLoad}
            isEdit= {currentEditedId!=null}
            setFormData = {setFormData}
            formData = {formData}
          />

          {/* 3D model and parts section */}
          <div className="mt-4 p-3 border rounded">
              <h3 className="font-semibold mb-2">Interactive parts (image hotspots)</h3>
              <div className="mb-2">
                <div className="text-sm text-muted-foreground">Upload the product image (above). Click on the image preview to add hotspots (parts) — each hotspot stores xPercent/yPercent coordinates and part metadata (name, price, thumbnail, description).</div>
              </div>

            <div className="mb-2">
              <h4 className="font-medium">Parts</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                <Input placeholder="Part name" value={partForm.name} onChange={e=>setPartForm({...partForm, name:e.target.value})} />
                <Input placeholder="Hotspot id (optional)" value={partForm.nodeName} onChange={e=>setPartForm({...partForm, nodeName:e.target.value})} />
                <Input placeholder="Price" value={partForm.price} onChange={e=>setPartForm({...partForm, price:e.target.value})} />
                <Input placeholder="Thumbnail URL (optional)" value={partForm.thumbnail} onChange={e=>setPartForm({...partForm, thumbnail:e.target.value})} />
              </div>
              <Textarea placeholder="Description" value={partForm.description} onChange={e=>setPartForm({...partForm, description:e.target.value})} className="mt-2" />
              <div className="flex gap-2 mt-3">
                <Button onClick={()=>{
                  if(!partForm.name || !partForm.nodeName) return;
                  const parts = formData.parts ? [...formData.parts] : [];
                  parts.push({ ...partForm, price: Number(partForm.price || 0) });
                  setFormData({ ...formData, parts });
                  setPartForm({ name: '', nodeName: '', description: '', price: '' });
                }}>Add Part</Button>
              </div>

              {formData.parts && formData.parts.length>0 && (
                <div className="mt-3">
                  <h5 className="font-medium">Existing parts</h5>
                  <ul className="list-disc pl-6 mt-2">
                    {formData.parts.map((p, idx) => (
                      <li key={idx} className="flex items-center justify-between gap-2">
                        <div>
                          <div className="font-semibold">{p.name} — {p.nodeName}</div>
                          <div className="text-sm text-muted-foreground">{p.description} {p.price ? ` — $${p.price}` : ''}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={()=>{
                            const parts = formData.parts.filter((_,i)=>i!==idx);
                            setFormData({ ...formData, parts });
                          }}>Remove</Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </div>
          
        
          <div className="py-6">
            <CommonForm 
              formControls={addProductFormElements}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId!=null ? "Edit" : "Add"}
              onSubmit={onSubmit}
                isBtnDisabled={!isFormValid()}
              />

              {/* Show missing required fields to the admin so it's clear why "Add" is disabled */}
              {!isFormValid() && (
                <div className="mt-3 text-sm text-rose-600">
                  Required fields missing: {missingRequiredFields().join(', ')}
                </div>
              )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}