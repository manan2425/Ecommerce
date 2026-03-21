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
  Image, Save, X, Upload, Layers, AlertCircle, FileText, Download, Palette
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
    descriptionPdf: '',
    category: '',
    brand: '',
    price: '',
    salePrice: '',
    totalStock: '',
    redThreshold: '',
    yellowThreshold: '',
    customFields: [],
    parts: []
  });

  // PDF Upload State
  const [pdfLoading, setPdfLoading] = useState(false);
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState('');

  // Custom Fields State
  const [customFields, setCustomFields] = useState([]);

  // Product Options State (e.g., Color, Size)
  const [options, setOptions] = useState([]);
  // Product Variants State (combinations with specific price/stock)
  const [variants, setVariants] = useState([]);

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
        descriptionPdf: product.descriptionPdf || '',
        category: product.category || '',
        brand: product.brand || '',
        price: product.price || '',
        salePrice: product.salePrice || '',
        totalStock: product.totalStock || '',
        redThreshold: product.redThreshold || '',
        yellowThreshold: product.yellowThreshold || '',
        customFields: product.customFields || [],
        options: product.options || [],
        variants: product.variants || [],
        parts: product.parts || []
      });
      setParts(product.parts || []);
      setCustomFields(product.customFields || []);
      setOptions(product.options || []);
      setVariants(product.variants || []);
      setUploadedImageUrl(product.image || '');
      setUploadedPdfUrl(product.descriptionPdf || '');
    } else {
      resetForm();
    }
  }, [product, isEditMode, isOpen]);

  const resetForm = () => {
    setFormData({
      image: '',
      title: '',
      description: '',
      descriptionPdf: '',
      category: '',
      brand: '',
      price: '',
      salePrice: '',
      totalStock: '',
      redThreshold: '',
      yellowThreshold: '',
      customFields: [],
      options: [],
      variants: [],
      parts: []
    });
    setParts([]);
    setCustomFields([]);
    setOptions([]);
    setVariants([]);
    setUploadedImageUrl('');
    setUploadedPdfUrl('');
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

  // PDF upload handler
  const handlePdfUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast({ title: 'Please select a PDF file', variant: 'destructive' });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'PDF file size should be less than 10MB', variant: 'destructive' });
      return;
    }

    setPdfLoading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('my_file', file);

      const response = await api.post('/admin/products/upload-image', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setUploadedPdfUrl(response.data.result.url);
        setFormData(prev => ({ ...prev, descriptionPdf: response.data.result.url }));
        toast({ title: 'PDF uploaded successfully' });
      }
    } catch (error) {
      toast({ title: 'Error uploading PDF', variant: 'destructive' });
    } finally {
      setPdfLoading(false);
    }
  };

  // Remove PDF
  const handleRemovePdf = () => {
    setUploadedPdfUrl('');
    setFormData(prev => ({ ...prev, descriptionPdf: '' }));
  };

  // Custom Fields Handlers
  const handleAddCustomField = () => {
    const newField = { label: '', value: '' };
    const updatedFields = [...customFields, newField];
    setCustomFields(updatedFields);
    setFormData(prev => ({ ...prev, customFields: updatedFields }));
  };

  const handleUpdateCustomField = (index, field, value) => {
    const updatedFields = [...customFields];
    updatedFields[index] = { ...updatedFields[index], [field]: value };
    setCustomFields(updatedFields);
    setFormData(prev => ({ ...prev, customFields: updatedFields }));
  };

  const handleRemoveCustomField = (index) => {
    const updatedFields = customFields.filter((_, i) => i !== index);
    setCustomFields(updatedFields);
    setFormData(prev => ({ ...prev, customFields: updatedFields }));
  };

  // Product Options Handlers (e.g., Color, Size)
  const handleAddOption = () => {
    const newOption = { name: '', values: [''] };
    const updatedOptions = [...options, newOption];
    setOptions(updatedOptions);
    setFormData(prev => ({ ...prev, options: updatedOptions }));
  };

  const handleUpdateOptionName = (optionIndex, name) => {
    const updatedOptions = [...options];
    updatedOptions[optionIndex] = { ...updatedOptions[optionIndex], name };
    setOptions(updatedOptions);
    setFormData(prev => ({ ...prev, options: updatedOptions }));
  };

  const handleAddOptionValue = (optionIndex) => {
    const updatedOptions = [...options];
    updatedOptions[optionIndex] = {
      ...updatedOptions[optionIndex],
      values: [...updatedOptions[optionIndex].values, '']
    };
    setOptions(updatedOptions);
    setFormData(prev => ({ ...prev, options: updatedOptions }));
  };

  const handleUpdateOptionValue = (optionIndex, valueIndex, value) => {
    const updatedOptions = [...options];
    const newValues = [...updatedOptions[optionIndex].values];
    newValues[valueIndex] = value;
    updatedOptions[optionIndex] = { ...updatedOptions[optionIndex], values: newValues };
    setOptions(updatedOptions);
    setFormData(prev => ({ ...prev, options: updatedOptions }));
  };

  const handleRemoveOptionValue = (optionIndex, valueIndex) => {
    const updatedOptions = [...options];
    const newValues = updatedOptions[optionIndex].values.filter((_, i) => i !== valueIndex);
    updatedOptions[optionIndex] = { ...updatedOptions[optionIndex], values: newValues };
    setOptions(updatedOptions);
    setFormData(prev => ({ ...prev, options: updatedOptions }));
  };

  const handleRemoveOption = (optionIndex) => {
    const updatedOptions = options.filter((_, i) => i !== optionIndex);
    setOptions(updatedOptions);
    setFormData(prev => ({ ...prev, options: updatedOptions }));
    // Also remove variants that use this option
    setVariants([]);
    setFormData(prev => ({ ...prev, variants: [] }));
  };

  // Generate all possible variant combinations from options
  const generateVariantCombinations = () => {
    if (options.length === 0 || options.some(opt => !opt.name || opt.values.length === 0)) {
      toast({ title: "Please add at least one option with values first", variant: "destructive" });
      return;
    }

    const validOptions = options.filter(opt => opt.name && opt.values.some(v => v));
    if (validOptions.length === 0) return;

    // Generate all combinations
    const generateCombos = (opts, current = {}, index = 0) => {
      if (index === opts.length) {
        return [current];
      }
      const result = [];
      const opt = opts[index];
      for (const value of opt.values.filter(v => v)) {
        result.push(...generateCombos(opts, { ...current, [opt.name]: value }, index + 1));
      }
      return result;
    };

    const combinations = generateCombos(validOptions);
    const newVariants = combinations.map(combo => ({
      optionCombination: combo,
      price: formData.price || '',
      salePrice: formData.salePrice || '',
      stock: '',
      sku: '',
      image: ''
    }));

    setVariants(newVariants);
    setFormData(prev => ({ ...prev, variants: newVariants }));
    toast({ title: `Generated ${newVariants.length} variant combinations` });
  };

  const handleUpdateVariant = (variantIndex, field, value) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex] = { ...updatedVariants[variantIndex], [field]: value };
    setVariants(updatedVariants);
    setFormData(prev => ({ ...prev, variants: updatedVariants }));
  };

  const handleRemoveVariant = (variantIndex) => {
    const updatedVariants = variants.filter((_, i) => i !== variantIndex);
    setVariants(updatedVariants);
    setFormData(prev => ({ ...prev, variants: updatedVariants }));
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

    // Filter out empty custom fields
    const validCustomFields = customFields.filter(f => f.label.trim() && f.value.trim());
    
    // Filter out empty options and their empty values
    const validOptions = options
      .filter(opt => opt.name.trim())
      .map(opt => ({
        ...opt,
        values: opt.values.filter(v => v.trim())
      }))
      .filter(opt => opt.values.length > 0);

    // Convert variant optionCombination to object format for MongoDB
    const validVariants = variants.map(v => ({
      ...v,
      optionCombination: v.optionCombination
    }));

    const submitData = {
      ...formData,
      image: uploadedImageUrl || formData.image,
      descriptionPdf: uploadedPdfUrl || formData.descriptionPdf,
      customFields: validCustomFields,
      options: validOptions,
      variants: validVariants,
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
        className="p-0 flex flex-col"
        style={{ 
          width: '60vw', 
          height: '80vh', 
          maxWidth: '60vw', 
          maxHeight: '80vh',
          minWidth: '600px',
          minHeight: '500px'
        }}
      >
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-gray-50 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-6 mt-4 grid grid-cols-3 w-fit flex-shrink-0">
              <TabsTrigger value="details" className="gap-2">
                <Image size={16} />
                Details
              </TabsTrigger>
              <TabsTrigger value="options" className="gap-2">
                <Palette size={16} />
                Options ({options.length})
              </TabsTrigger>
              <TabsTrigger value="parts" className="gap-2">
                <Layers size={16} />
                Parts ({parts.length})
              </TabsTrigger>
            </TabsList>

            {/* Product Details Tab */}
            <TabsContent value="details" className="flex-1 overflow-y-auto p-6 pt-4 m-0" style={{ maxHeight: 'calc(80vh - 140px)' }}>
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

                {/* PDF Description Upload */}
                <div className="col-span-2">
                  <Label>Description PDF (Optional)</Label>
                  <p className="text-xs text-gray-500 mb-2">
                    Upload a PDF file with detailed product specifications or documentation
                  </p>
                  <div className="mt-2 flex items-center gap-4">
                    {(uploadedPdfUrl || formData.descriptionPdf) && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded">
                        <FileText size={20} className="text-red-600" />
                        <span className="text-sm text-red-700">PDF Uploaded</span>
                        <a 
                          href={uploadedPdfUrl || formData.descriptionPdf} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          <Download size={14} className="inline mr-1" />
                          View
                        </a>
                        <button 
                          onClick={handleRemovePdf}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handlePdfUpload}
                        className="hidden"
                        id="product-pdf"
                      />
                      <label 
                        htmlFor="product-pdf"
                        className="flex items-center gap-2 px-4 py-2 border rounded cursor-pointer hover:bg-gray-50"
                      >
                        <FileText size={16} />
                        {pdfLoading ? 'Uploading PDF...' : 'Upload PDF'}
                      </label>
                    </div>
                  </div>
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

                {/* Custom Fields Section */}
                <div className="col-span-2 mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <Label className="text-base font-semibold">Custom Fields</Label>
                      <p className="text-xs text-gray-500">Add custom attributes like specifications, dimensions, etc.</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddCustomField}
                      className="gap-1"
                    >
                      <Plus size={14} />
                      Add Field
                    </Button>
                  </div>

                  {customFields.length === 0 ? (
                    <div className="text-center py-4 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed">
                      <p className="text-sm">No custom fields added yet</p>
                      <p className="text-xs">Click "Add Field" to create custom attributes</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {customFields.map((field, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border">
                          <div className="flex-1">
                            <Input
                              value={field.label}
                              onChange={(e) => handleUpdateCustomField(index, 'label', e.target.value)}
                              placeholder="Label (e.g., Weight, Color, Material)"
                              className="mb-1 h-8 text-sm"
                            />
                          </div>
                          <div className="flex-1">
                            <Input
                              value={field.value}
                              onChange={(e) => handleUpdateCustomField(index, 'value', e.target.value)}
                              placeholder="Value (e.g., 500g, Red, Steel)"
                              className="h-8 text-sm"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCustomField(index)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Options Tab */}
            <TabsContent value="options" className="flex-1 overflow-y-auto p-6 pt-4 m-0" style={{ maxHeight: 'calc(80vh - 140px)' }}>
              <div className="space-y-6">
                {/* Add Option Button */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">Product Options</h3>
                    <p className="text-sm text-gray-500">Add options like Color, Size, Material, etc.</p>
                  </div>
                  <Button onClick={handleAddOption} variant="outline" className="gap-2">
                    <Plus size={16} />
                    Add Option
                  </Button>
                </div>

                {/* Options List */}
                {options.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed">
                    <Palette size={40} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No options added yet</p>
                    <p className="text-xs">Click "Add Option" to create options like Color, Size, etc.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {options.map((option, optionIndex) => (
                      <Card key={optionIndex} className="border-2">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Option Name */}
                            <div className="w-40">
                              <Label className="text-xs">Option Name</Label>
                              <Input
                                value={option.name}
                                onChange={(e) => handleUpdateOptionName(optionIndex, e.target.value)}
                                placeholder="e.g., Color, Size"
                                className="mt-1"
                              />
                            </div>

                            {/* Option Values */}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <Label className="text-xs">Option Values</Label>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAddOptionValue(optionIndex)}
                                  className="h-6 text-xs gap-1"
                                >
                                  <Plus size={12} />
                                  Add Value
                                </Button>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {option.values.map((value, valueIndex) => (
                                  <div key={valueIndex} className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                                    <Input
                                      value={value}
                                      onChange={(e) => handleUpdateOptionValue(optionIndex, valueIndex, e.target.value)}
                                      placeholder={option.name === 'Color' ? 'Red' : option.name === 'Size' ? 'M' : 'Value'}
                                      className="h-7 w-24 text-sm"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveOptionValue(optionIndex, valueIndex)}
                                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                    >
                                      <X size={12} />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Delete Option */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveOption(optionIndex)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Generate Variants Button */}
                {options.length > 0 && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">Product Variants</h3>
                        <p className="text-sm text-gray-500">
                          Generate all possible combinations of options with individual pricing/stock
                        </p>
                      </div>
                      <Button onClick={generateVariantCombinations} className="gap-2">
                        <Layers size={16} />
                        Generate Variants
                      </Button>
                    </div>

                    {/* Variants List */}
                    {variants.length > 0 && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-600 px-2">
                          <div className="col-span-4">Variant</div>
                          <div className="col-span-2">Price</div>
                          <div className="col-span-2">Sale Price</div>
                          <div className="col-span-2">Stock</div>
                          <div className="col-span-1">SKU</div>
                          <div className="col-span-1"></div>
                        </div>
                        {variants.map((variant, variantIndex) => (
                          <div key={variantIndex} className="grid grid-cols-12 gap-2 items-center p-2 bg-gray-50 rounded border">
                            {/* Variant Combination */}
                            <div className="col-span-4">
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(variant.optionCombination).map(([key, value]) => (
                                  <span key={key} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                    {key}: {value}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {/* Price */}
                            <div className="col-span-2">
                              <Input
                                type="number"
                                value={variant.price}
                                onChange={(e) => handleUpdateVariant(variantIndex, 'price', e.target.value)}
                                placeholder="Price"
                                className="h-8 text-sm"
                              />
                            </div>
                            {/* Sale Price */}
                            <div className="col-span-2">
                              <Input
                                type="number"
                                value={variant.salePrice}
                                onChange={(e) => handleUpdateVariant(variantIndex, 'salePrice', e.target.value)}
                                placeholder="Sale"
                                className="h-8 text-sm"
                              />
                            </div>
                            {/* Stock */}
                            <div className="col-span-2">
                              <Input
                                type="number"
                                value={variant.stock}
                                onChange={(e) => handleUpdateVariant(variantIndex, 'stock', e.target.value)}
                                placeholder="Stock"
                                className="h-8 text-sm"
                              />
                            </div>
                            {/* SKU */}
                            <div className="col-span-1">
                              <Input
                                value={variant.sku}
                                onChange={(e) => handleUpdateVariant(variantIndex, 'sku', e.target.value)}
                                placeholder="SKU"
                                className="h-8 text-sm"
                              />
                            </div>
                            {/* Delete */}
                            <div className="col-span-1 flex justify-end">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveVariant(variantIndex)}
                                className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Info */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800 flex items-start gap-2">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>How it works:</strong>
                    <ul className="list-disc ml-4 mt-1 space-y-1">
                      <li>Add options like "Color" with values "Red", "Blue", "Green"</li>
                      <li>Add another option like "Size" with values "S", "M", "L"</li>
                      <li>Click "Generate Variants" to create all combinations</li>
                      <li>Set individual price, sale price, and stock for each variant</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Parts Tab */}
            <TabsContent value="parts" className="flex-1 overflow-y-auto p-6 pt-4 m-0" style={{ maxHeight: 'calc(80vh - 140px)' }}>
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
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center flex-shrink-0">
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
      </DialogContent>
    </Dialog>
  );
}
