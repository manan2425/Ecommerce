import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Plus, Trash2, Edit2, ChevronRight, ChevronDown, Package, 
  Image, Save, X, Upload, Layers, AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function ProductModal({ 
  isOpen, 
  onClose, 
  product, 
  onSave, 
  categories = [],
  isEditMode = false 
}) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('details');
  const [imageFile, setImageFile] = useState(null);
  const [imageLoad, setImageLoad] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  
  // Product Form Data
  const [formData, setFormData] = useState({
    image: '',
    title: '',
    description: '',
    category: '',
    brand: '',
    price: '',
    salePrice: '',
    totalStock: '',
    redThreshold: '',
    yellowThreshold: '',
    parts: []
  });

  // Parts Management State
  const [parts, setParts] = useState([]);
  const [showPartForm, setShowPartForm] = useState(false);
  const [editingPartPath, setEditingPartPath] = useState(null);
  const [partForm, setPartForm] = useState({
    name: '',
    nodeName: '',
    description: '',
    price: '',
    quantity: '',
    thumbnail: '',
    partImage: '',
    subparts: []
  });
  const [expandedParts, setExpandedParts] = useState({});
  const [addingSubpartTo, setAddingSubpartTo] = useState(null);

  // Initialize form data when product changes
  useEffect(() => {
    if (product && isEditMode) {
      setFormData({
        image: product.image || '',
        title: product.title || '',
        description: product.description || '',
        category: product.category || '',
        brand: product.brand || '',
        price: product.price || '',
        salePrice: product.salePrice || '',
        totalStock: product.totalStock || '',
        redThreshold: product.redThreshold || '',
        yellowThreshold: product.yellowThreshold || '',
        parts: product.parts || []
      });
      setParts(product.parts || []);
      setUploadedImageUrl(product.image || '');
    } else {
      resetForm();
    }
  }, [product, isEditMode, isOpen]);

  const resetForm = () => {
    setFormData({
      image: '',
      title: '',
      description: '',
      category: '',
      brand: '',
      price: '',
      salePrice: '',
      totalStock: '',
      redThreshold: '',
      yellowThreshold: '',
      parts: []
    });
    setParts([]);
    setUploadedImageUrl('');
    setImageFile(null);
    setActiveTab('details');
    resetPartForm();
  };

  const resetPartForm = () => {
    setPartForm({
      name: '',
      nodeName: '',
      description: '',
      price: '',
      quantity: '',
      thumbnail: '',
      partImage: '',
      subparts: []
    });
    setShowPartForm(false);
    setEditingPartPath(null);
    setAddingSubpartTo(null);
  };

  // Image upload handler
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImageFile(file);
    setImageLoad(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('my_file', file);

      const response = await api.post('/admin/products/upload-image', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setUploadedImageUrl(response.data.result.url);
        setFormData(prev => ({ ...prev, image: response.data.result.url }));
        toast({ title: 'Image uploaded successfully' });
      }
    } catch (error) {
      toast({ title: 'Error uploading image', variant: 'destructive' });
    } finally {
      setImageLoad(false);
    }
  };

  // Part path helpers
  const getPartAtPath = (path) => {
    if (!path || path.length === 0) return null;
    let current = parts;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
      if (!current || !current.subparts) return null;
      current = current.subparts;
    }
    return current[path[path.length - 1]];
  };

  const setPartAtPath = (partsArray, path, newPart) => {
    if (!path || path.length === 0) return partsArray;
    const newParts = JSON.parse(JSON.stringify(partsArray));
    let current = newParts;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
      if (!current.subparts) current.subparts = [];
      current = current.subparts;
    }
    
    current[path[path.length - 1]] = newPart;
    return newParts;
  };

  const deletePartAtPath = (partsArray, path) => {
    if (!path || path.length === 0) return partsArray;
    const newParts = JSON.parse(JSON.stringify(partsArray));
    
    if (path.length === 1) {
      newParts.splice(path[0], 1);
    } else {
      let current = newParts;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
        current = current.subparts;
      }
      current.splice(path[path.length - 1], 1);
    }
    return newParts;
  };

  const addSubpartAtPath = (partsArray, path, newPart) => {
    const newParts = JSON.parse(JSON.stringify(partsArray));
    
    if (!path || path.length === 0) {
      newParts.push(newPart);
    } else {
      let current = newParts;
      for (let i = 0; i < path.length; i++) {
        current = current[path[i]];
      }
      if (!current.subparts) current.subparts = [];
      current.subparts.push(newPart);
    }
    return newParts;
  };

  // Part CRUD handlers
  const handleAddOrUpdatePart = () => {
    if (!partForm.name || !partForm.quantity) {
      toast({ title: 'Name and Quantity are required', variant: 'destructive' });
      return;
    }

    const newPart = {
      ...partForm,
      price: partForm.price ? Number(partForm.price) : 0,
      quantity: Number(partForm.quantity),
      subparts: partForm.subparts || []
    };

    let updatedParts;
    
    if (addingSubpartTo !== null) {
      // Adding subpart to existing part
      updatedParts = addSubpartAtPath(parts, addingSubpartTo, newPart);
      // Auto-expand parent
      setExpandedParts(prev => ({
        ...prev,
        [JSON.stringify(addingSubpartTo)]: true
      }));
    } else if (editingPartPath !== null) {
      // Editing existing part
      updatedParts = setPartAtPath(parts, editingPartPath, newPart);
    } else {
      // Adding new top-level part
      updatedParts = [...parts, newPart];
    }

    setParts(updatedParts);
    setFormData(prev => ({ ...prev, parts: updatedParts }));
    resetPartForm();
  };

  const handleEditPart = (path) => {
    const part = getPartAtPath(path);
    if (part) {
      setPartForm({
        name: part.name || '',
        nodeName: part.nodeName || '',
        description: part.description || '',
        price: part.price || '',
        quantity: part.quantity || '',
        thumbnail: part.thumbnail || '',
        partImage: part.partImage || '',
        subparts: part.subparts || []
      });
      setEditingPartPath(path);
      setAddingSubpartTo(null);
      setShowPartForm(true);
    }
  };

  const handleDeletePart = (path) => {
    if (window.confirm('Delete this part and all its subparts?')) {
      const updatedParts = deletePartAtPath(parts, path);
      setParts(updatedParts);
      setFormData(prev => ({ ...prev, parts: updatedParts }));
    }
  };

  const handleAddSubpart = (parentPath) => {
    resetPartForm();
    setAddingSubpartTo(parentPath);
    setShowPartForm(true);
  };

  // Toggle expand/collapse
  const toggleExpand = (path) => {
    const key = JSON.stringify(path);
    setExpandedParts(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Form validation
  const isFormValid = () => {
    const required = ['title', 'description', 'category', 'brand', 'price', 'salePrice', 'totalStock'];
    const hasImage = formData.image || uploadedImageUrl;
    return hasImage && required.every(key => formData[key] && `${formData[key]}`.trim() !== '');
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    const submitData = {
      ...formData,
      image: uploadedImageUrl || formData.image,
      parts: parts
    };

    onSave(submitData);
  };

  // Render parts tree recursively
  const renderPartsTree = (partsList, path = [], depth = 0) => {
    return partsList.map((part, idx) => {
      const currentPath = [...path, idx];
      const pathKey = JSON.stringify(currentPath);
      const isExpanded = expandedParts[pathKey];
      const hasSubparts = part.subparts && part.subparts.length > 0;

      return (
        <div key={pathKey} style={{ marginLeft: depth * 16 }}>
          <div className={`flex items-center gap-2 p-2 rounded hover:bg-gray-100 border-l-2 ${depth > 0 ? 'border-blue-300' : 'border-transparent'}`}>
            {/* Expand/Collapse button */}
            <button
              onClick={() => toggleExpand(currentPath)}
              className={`p-1 rounded hover:bg-gray-200 ${!hasSubparts && 'invisible'}`}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {/* Part info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Package size={14} className="text-blue-500" />
                <span className="font-medium text-sm">{part.name}</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  Qty: {part.quantity}
                </span>
                {part.price > 0 && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                    ₹{part.price}
                  </span>
                )}
                {hasSubparts && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                    {part.subparts.length} subparts
                  </span>
                )}
              </div>
              {part.nodeName && (
                <span className="text-xs text-gray-500 ml-6">ID: {part.nodeName}</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => handleAddSubpart(currentPath)} className="h-7 w-7 p-0">
                <Plus size={14} className="text-green-600" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleEditPart(currentPath)} className="h-7 w-7 p-0">
                <Edit2 size={14} className="text-blue-600" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleDeletePart(currentPath)} className="h-7 w-7 p-0">
                <Trash2 size={14} className="text-red-600" />
              </Button>
            </div>
          </div>

          {/* Subparts */}
          {hasSubparts && isExpanded && (
            <div className="ml-4 border-l border-gray-200">
              {renderPartsTree(part.subparts, currentPath, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="p-0 overflow-hidden"
        style={{ 
          width: '50vw', 
          height: '50vh', 
          maxWidth: '50vw', 
          maxHeight: '50vh',
          minWidth: '600px',
          minHeight: '500px'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b bg-gray-50">
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-6 mt-4 grid grid-cols-2 w-fit">
              <TabsTrigger value="details" className="gap-2">
                <Image size={16} />
                Product Details
              </TabsTrigger>
              <TabsTrigger value="parts" className="gap-2">
                <Layers size={16} />
                Parts & Subparts ({parts.length})
              </TabsTrigger>
            </TabsList>

            {/* Product Details Tab */}
            <TabsContent value="details" className="flex-1 overflow-y-auto p-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Image Upload */}
                <div className="col-span-2">
                  <Label>Product Image *</Label>
                  <div className="mt-2 flex items-center gap-4">
                    {(uploadedImageUrl || formData.image) && (
                      <img 
                        src={uploadedImageUrl || formData.image} 
                        alt="Product" 
                        className="w-20 h-20 object-cover rounded border"
                      />
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="product-image"
                      />
                      <label 
                        htmlFor="product-image"
                        className="flex items-center gap-2 px-4 py-2 border rounded cursor-pointer hover:bg-gray-50"
                      >
                        <Upload size={16} />
                        {imageLoad ? 'Uploading...' : 'Upload Image'}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div className="col-span-2">
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Product title"
                  />
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <Label>Description *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Product description"
                    rows={2}
                  />
                </div>

                {/* Category */}
                <div>
                  <Label>Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat._id} value={cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-')}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Brand */}
                <div>
                  <Label>Brand *</Label>
                  <Input
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    placeholder="Brand name"
                  />
                </div>

                {/* Price */}
                <div>
                  <Label>Price *</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0"
                  />
                </div>

                {/* Sale Price */}
                <div>
                  <Label>Sale Price *</Label>
                  <Input
                    type="number"
                    value={formData.salePrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, salePrice: e.target.value }))}
                    placeholder="0"
                  />
                </div>

                {/* Stock */}
                <div>
                  <Label>Total Stock *</Label>
                  <Input
                    type="number"
                    value={formData.totalStock}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalStock: e.target.value }))}
                    placeholder="0"
                  />
                </div>

                {/* Red Threshold */}
                <div>
                  <Label>Red Threshold</Label>
                  <Input
                    type="number"
                    value={formData.redThreshold}
                    onChange={(e) => setFormData(prev => ({ ...prev, redThreshold: e.target.value }))}
                    placeholder="Low stock alert"
                  />
                </div>

                {/* Yellow Threshold */}
                <div>
                  <Label>Yellow Threshold</Label>
                  <Input
                    type="number"
                    value={formData.yellowThreshold}
                    onChange={(e) => setFormData(prev => ({ ...prev, yellowThreshold: e.target.value }))}
                    placeholder="Medium stock alert"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Parts Tab */}
            <TabsContent value="parts" className="flex-1 overflow-hidden p-6 pt-4 flex flex-col">
              {/* Add Part Button */}
              {!showPartForm && (
                <Button 
                  onClick={() => {
                    resetPartForm();
                    setShowPartForm(true);
                  }}
                  variant="outline" 
                  className="mb-4 gap-2"
                >
                  <Plus size={16} />
                  Add Part
                </Button>
              )}

              {/* Part Form */}
              {showPartForm && (
                <Card className="mb-4 bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Package size={16} />
                      {editingPartPath ? 'Edit Part' : addingSubpartTo ? 'Add Subpart' : 'Add New Part'}
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">Name *</Label>
                        <Input
                          value={partForm.name}
                          onChange={(e) => setPartForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Part name"
                          size="sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Node ID</Label>
                        <Input
                          value={partForm.nodeName}
                          onChange={(e) => setPartForm(prev => ({ ...prev, nodeName: e.target.value }))}
                          placeholder="Unique ID"
                          size="sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Quantity *</Label>
                        <Input
                          type="number"
                          value={partForm.quantity}
                          onChange={(e) => setPartForm(prev => ({ ...prev, quantity: e.target.value }))}
                          placeholder="0"
                          size="sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Price</Label>
                        <Input
                          type="number"
                          value={partForm.price}
                          onChange={(e) => setPartForm(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="0"
                          size="sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Description</Label>
                        <Input
                          value={partForm.description}
                          onChange={(e) => setPartForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Part description"
                          size="sm"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" onClick={handleAddOrUpdatePart} className="gap-1">
                        <Save size={14} />
                        {editingPartPath ? 'Update' : 'Add'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={resetPartForm} className="gap-1">
                        <X size={14} />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Parts Tree */}
              <div className="flex-1 overflow-y-auto border rounded bg-white p-2">
                {parts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Layers size={40} className="mb-2 opacity-50" />
                    <p>No parts added yet</p>
                    <p className="text-xs">Click "Add Part" to add parts and subparts</p>
                  </div>
                ) : (
                  renderPartsTree(parts)
                )}
              </div>

              {/* Info */}
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 flex items-start gap-2">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Tip:</strong> Click the <Plus size={12} className="inline" /> button on any part to add subparts. 
                  You can create unlimited levels of nested subparts.
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {!isFormValid() && (
                <span className="text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} />
                  Please fill all required fields
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!isFormValid()} className="gap-2">
                <Save size={16} />
                {isEditMode ? 'Update Product' : 'Add Product'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
