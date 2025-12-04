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
import PartsManagement from "@/components/admin/parts-management";
import ProductModal from "@/components/admin/product-modal";
import VisualProductBuilder from "@/components/admin/visual-product-builder";
import api from '@/lib/api';
import { Plus, Layers } from 'lucide-react';

export default function AdminProducts() {
  
  const {toast} = useToast();
  const dispatch = useDispatch();
  const {products} = useSelector(state=>state.adminProducts);
  const [categories, setCategories] = useState([]);
  
  // Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Visual Builder State
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [builderProduct, setBuilderProduct] = useState(null);

  // Fetch products
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

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/admin/categories/get-all');
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.log('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Open modal for adding new product
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  // Open modal for editing product
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // Open Visual Builder for managing parts
  const handleOpenBuilder = (product) => {
    setBuilderProduct(product);
    setIsBuilderOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setIsEditMode(false);
  };

  // Close builder
  const handleCloseBuilder = () => {
    setIsBuilderOpen(false);
    setBuilderProduct(null);
  };

  // Save product (add or edit)
  const handleSaveProduct = async (formData) => {
    try {
      if (isEditMode && selectedProduct) {
        // Edit existing product
        const data = await dispatch(editProduct({
          id: selectedProduct._id,
          formData: formData
        }));

        if (data?.payload?.success === true) {
          toast({
            title: data?.payload?.message || "Product updated successfully"
          });
          await dispatch(fetchAllProducts());
          handleCloseModal();
        } else {
          toast({
            title: data?.payload?.message || "Error updating product",
            variant: "destructive"
          });
        }
      } else {
        // Add new product
        const data = await dispatch(addProduct(formData));

        if (data?.payload?.success === true) {
          toast({
            title: data?.payload?.message || "Product added successfully"
          });
          await dispatch(fetchAllProducts());
          handleCloseModal();
        } else {
          toast({
            title: data?.payload?.message || "Error adding product",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Something went wrong",
        variant: "destructive"
      });
    }
  };

  // Save from Visual Builder
  const handleSaveFromBuilder = async (formData) => {
    try {
      if (builderProduct?._id) {
        const data = await dispatch(editProduct({
          id: builderProduct._id,
          formData: formData
        }));

        if (data?.payload?.success === true) {
          toast({ title: "Product parts updated successfully" });
          await dispatch(fetchAllProducts());
          handleCloseBuilder();
        } else {
          toast({ title: "Error updating product", variant: "destructive" });
        }
      }
    } catch (error) {
      console.log(error);
      toast({ title: "Something went wrong", variant: "destructive" });
    }
  };

  // Handle parts update from product tile
  const handlePartsSaved = async (productId, updatedParts) => {
    try {
      const updatedProduct = products.find(p => p._id === productId);
      if (updatedProduct) {
        const data = await dispatch(editProduct({
          id: productId,
          formData: { ...updatedProduct, parts: updatedParts }
        }));

        if (data?.payload?.success === true) {
          toast({
            title: "Parts updated successfully"
          });
          await dispatch(fetchAllProducts());
        } else {
          toast({
            title: "Error updating parts",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Error updating parts",
        variant: "destructive"
      });
    }
  };
  
  return (
    <>
      <div className="mb-5 w-full flex justify-end">
        <Button onClick={handleAddProduct} className="gap-2">
          <Plus className="w-4 h-4" />
          Add New Product
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {
          products.length > 0 ? (
            products.map((product, index) => {
              return (
                <ProductTile 
                  key={index} 
                  product={product} 
                  onEdit={() => handleEditProduct(product)}
                  onOpenBuilder={() => handleOpenBuilder(product)}
                  onPartsSaved={handlePartsSaved}
                /> 
              );
            })
          ) : (
            <div className="col-span-full text-center py-10 text-gray-500">
              No products found. Click "Add New Product" to create one.
            </div>
          )
        }
      </div>

      {/* Product Modal - for basic product info */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
        onSave={handleSaveProduct}
        categories={categories}
        isEditMode={isEditMode}
      />

      {/* Visual Product Builder - for managing parts with image hotspots */}
      <VisualProductBuilder
        isOpen={isBuilderOpen}
        onClose={handleCloseBuilder}
        product={builderProduct}
        onSave={handleSaveFromBuilder}
        isEditMode={true}
      />
    </>
  )
}