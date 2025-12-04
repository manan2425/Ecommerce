import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { 
  ArrowLeft, Save, X, Upload, 
  Package, Eye, ChevronRight, Home, Trash2, Edit2
} from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function VisualProductBuilder({ 
  isOpen, 
  onClose, 
  product, 
  onSave 
}) {
  const { toast } = useToast();
  const imageRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [navigationStack, setNavigationStack] = useState([]);
  const [productData, setProductData] = useState(null);
  const [showPartForm, setShowPartForm] = useState(false);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const [imageLoading, setImageLoading] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  
  // Edit mode: null = adding new, number = editing index
  const [editingIndex, setEditingIndex] = useState(null);
  
  // Separate state for each form field
  const [formName, setFormName] = useState('');
  const [formNodeName, setFormNodeName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formQuantity, setFormQuantity] = useState('1');
  const [formImage, setFormImage] = useState('');
  const [formX, setFormX] = useState(0);
  const [formY, setFormY] = useState(0);

  // Initialize
  useEffect(() => {
    if (product && isOpen) {
      setProductData({
        ...product,
        parts: product.parts || []
      });
      setNavigationStack([]);
      setShowPartForm(false);
    }
  }, [product, isOpen]);

  if (!isOpen || !productData) return null;

  // Get current parts
  const getCurrentParts = () => {
    if (navigationStack.length === 0) {
      return productData.parts || [];
    }
    let parts = productData.parts;
    for (const index of navigationStack) {
      if (parts[index]?.subparts) {
        parts = parts[index].subparts;
      }
    }
    return parts || [];
  };

  // Get current image
  const getCurrentImage = () => {
    if (navigationStack.length === 0) {
      return productData.image;
    }
    let current = productData.parts;
    let lastPart = null;
    for (const index of navigationStack) {
      if (current[index]) {
        lastPart = current[index];
        current = current[index].subparts || [];
      }
    }
    // Support both 'partImage' (database) and 'image' (legacy)
    return lastPart?.partImage || lastPart?.image || productData.image;
  };

  // Get breadcrumbs
  const getBreadcrumbs = () => {
    const crumbs = [{ name: productData.title || 'Product', index: -1 }];
    let current = productData.parts;
    for (let i = 0; i < navigationStack.length; i++) {
      const index = navigationStack[i];
      if (current[index]) {
        crumbs.push({ name: current[index].name, index: i });
        current = current[index].subparts || [];
      }
    }
    return crumbs;
  };

  // Reset form
  const resetForm = () => {
    setFormName('');
    setFormNodeName('');
    setFormDescription('');
    setFormPrice('');
    setFormQuantity('1');
    setFormImage('');
    setEditingIndex(null);
  };

  // Open form for editing an existing part
  const handleEditPart = (index) => {
    const parts = getCurrentParts();
    const part = parts[index];
    if (!part) return;
    
    setFormName(part.name || '');
    setFormNodeName(part.nodeName || '');
    setFormDescription(part.description || '');
    setFormPrice(part.price?.toString() || '');
    setFormQuantity(part.quantity?.toString() || '1');
    setFormImage(part.partImage || part.image || '');
    setFormX(part.xPercent ?? part.x ?? 0);
    setFormY(part.yPercent ?? part.y ?? 0);
    setClickPosition({ x: part.xPercent ?? part.x ?? 0, y: part.yPercent ?? part.y ?? 0 });
    setEditingIndex(index);
    setShowPartForm(true);
  };

  // Handle image click
  const handleImageClick = (e) => {
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    console.log('CLICKED AT:', x.toFixed(2), y.toFixed(2));
    
    setClickPosition({ x, y });
    setFormX(x);
    setFormY(y);
    resetForm();
    setShowPartForm(true);
  };

  // Upload image
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImageLoading(true);
    try {
      const formData = new FormData();
      formData.append('my_file', file);
      
      const response = await api.post('/admin/products/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        setFormImage(response.data.result.url);
        toast({ title: 'Image uploaded!' });
      }
    } catch (error) {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setImageLoading(false);
    }
  };

  // Save part (add new or update existing)
  const handleSavePart = () => {
    if (!formName.trim()) {
      toast({ title: 'Part name required', variant: 'destructive' });
      return;
    }
    
    // Use correct database field names
    const partData = {
      name: formName.trim(),
      nodeName: formNodeName.trim(),
      description: formDescription.trim(),
      price: formPrice ? Number(formPrice) : 0,
      quantity: Number(formQuantity) || 1,
      partImage: formImage,  // Database uses 'partImage' not 'image'
      xPercent: formX,       // Database uses 'xPercent' not 'x'
      yPercent: formY,       // Database uses 'yPercent' not 'y'
    };
    
    const updated = JSON.parse(JSON.stringify(productData));
    
    if (navigationStack.length === 0) {
      // At product level
      if (editingIndex !== null) {
        // Editing existing part - preserve subparts
        partData.subparts = updated.parts[editingIndex]?.subparts || [];
        updated.parts[editingIndex] = partData;
      } else {
        // Adding new part
        partData.subparts = [];
        updated.parts = [...(updated.parts || []), partData];
      }
    } else {
      // In a subpart level
      let current = updated.parts;
      for (let i = 0; i < navigationStack.length; i++) {
        if (i === navigationStack.length - 1) {
          if (editingIndex !== null) {
            // Editing existing subpart - preserve its subparts
            partData.subparts = current[navigationStack[i]].subparts[editingIndex]?.subparts || [];
            current[navigationStack[i]].subparts[editingIndex] = partData;
          } else {
            // Adding new subpart
            partData.subparts = [];
            current[navigationStack[i]].subparts = [
              ...(current[navigationStack[i]].subparts || []),
              partData
            ];
          }
        } else {
          current = current[navigationStack[i]].subparts;
        }
      }
    }
    
    setProductData(updated);
    setShowPartForm(false);
    resetForm();
    toast({ title: editingIndex !== null ? 'Part updated!' : 'Part added!' });
  };

  // Delete part
  const handleDeletePart = (index) => {
    if (!confirm('Delete this part?')) return;
    
    const updated = JSON.parse(JSON.stringify(productData));
    
    if (navigationStack.length === 0) {
      updated.parts.splice(index, 1);
    } else {
      let current = updated.parts;
      for (let i = 0; i < navigationStack.length; i++) {
        if (i === navigationStack.length - 1) {
          current[navigationStack[i]].subparts.splice(index, 1);
        } else {
          current = current[navigationStack[i]].subparts;
        }
      }
    }
    
    setProductData(updated);
    toast({ title: 'Deleted' });
  };

  // Drill down
  const handleDrillDown = (index) => {
    const parts = getCurrentParts();
    // Support both 'partImage' (database) and 'image' (legacy)
    if (parts[index]?.partImage || parts[index]?.image) {
      setNavigationStack([...navigationStack, index]);
      setShowPartForm(false);
    } else {
      toast({ title: 'Upload an image to this part first', variant: 'destructive' });
    }
  };

  // Navigate back
  const handleGoBack = () => {
    setNavigationStack(navigationStack.slice(0, -1));
    setShowPartForm(false);
  };

  // Breadcrumb click
  const handleBreadcrumbClick = (idx) => {
    if (idx === -1) {
      setNavigationStack([]);
    } else {
      setNavigationStack(navigationStack.slice(0, idx + 1));
    }
    setShowPartForm(false);
  };

  // Save all
  const handleSaveAll = () => {
    onSave(productData);
  };

  // Close form
  const handleCloseForm = () => {
    setShowPartForm(false);
    resetForm();
    setEditingIndex(null);
  };

  const currentParts = getCurrentParts();
  const currentImage = getCurrentImage();
  const breadcrumbs = getBreadcrumbs();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      backgroundColor: '#111'
    }}>
      {/* Header */}
      <div style={{
        height: '56px',
        backgroundColor: '#1a1a1a',
        borderBottom: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {navigationStack.length > 0 && (
            <Button size="sm" variant="outline" onClick={handleGoBack}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', color: 'white', fontSize: '14px' }}>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight style={{ width: '16px', height: '16px', margin: '0 4px', color: '#666' }} />}
                <button
                  onClick={() => handleBreadcrumbClick(crumb.index)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: 'none',
                    background: idx === breadcrumbs.length - 1 ? '#3b82f6' : 'transparent',
                    color: idx === breadcrumbs.length - 1 ? 'white' : '#999',
                    cursor: 'pointer',
                    fontWeight: idx === breadcrumbs.length - 1 ? 'bold' : 'normal'
                  }}
                >
                  {idx === 0 && <Home style={{ width: '14px', height: '14px', display: 'inline', marginRight: '4px' }} />}
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#888', fontSize: '14px' }}>{currentParts.length} parts</span>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" style={{ backgroundColor: '#22c55e' }} onClick={handleSaveAll}>
            <Save className="w-4 h-4 mr-1" /> Save
          </Button>
        </div>
      </div>

      {/* Main Area */}
      <div style={{ display: 'flex', height: 'calc(100vh - 56px)' }}>
        {/* Image Section */}
        <div style={{
          flex: 1,
          backgroundColor: '#222',
          overflow: 'auto',
          padding: '32px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}>
          <div style={{ position: 'relative' }}>
            {/* Instruction Banner */}
            <div style={{
              backgroundColor: '#22c55e',
              color: 'white',
              textAlign: 'center',
              padding: '12px 24px',
              borderRadius: '8px 8px 0 0',
              fontWeight: '600',
              fontSize: '16px'
            }}>
              👆 CLICK ON THE IMAGE TO ADD A {navigationStack.length > 0 ? 'SUBPART' : 'PART'}
            </div>
            
            {currentImage ? (
              <div style={{ position: 'relative', width: '800px' }}>
                <img
                  ref={imageRef}
                  src={currentImage}
                  alt="Product"
                  style={{
                    width: '800px',
                    height: 'auto',
                    display: 'block',
                    border: '4px solid #22c55e',
                    borderTop: 'none',
                    borderRadius: '0 0 8px 8px',
                    userSelect: 'none'
                  }}
                  draggable={false}
                />
                
                {/* Clickable overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    cursor: 'crosshair',
                    zIndex: 5
                  }}
                  onClick={(e) => {
                    const rect = imageRef.current.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    
                    console.log('CLICKED AT:', x.toFixed(2), y.toFixed(2));
                    
                    setClickPosition({ x, y });
                    setFormX(x);
                    setFormY(y);
                    resetForm();
                    setEditingIndex(null); // Ensure we're in "add" mode
                    setShowPartForm(true);
                  }}
                />
                
                {/* Hotspots */}
                {currentParts.map((part, index) => (
                  <div
                    key={index}
                    style={{
                      position: 'absolute',
                      left: `${part.xPercent || part.x || 0}%`,
                      top: `${part.yPercent || part.y || 0}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 50
                    }}
                    onMouseEnter={() => setHoveredPoint(index)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        backgroundColor: (part.partImage || part.image) ? '#9333ea' : '#3b82f6',
                        color: 'white',
                        border: '4px solid white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Click opens edit form
                        handleEditPart(index);
                      }}
                    >
                      {index + 1}
                    </div>
                    
                    {/* Tooltip */}
                    {hoveredPoint === index && (
                      <div style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginBottom: '8px',
                        backgroundColor: 'black',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        whiteSpace: 'nowrap',
                        zIndex: 100
                      }}>
                        <div style={{ fontWeight: 'bold' }}>{part.name}</div>
                        <div style={{ color: '#aaa' }}>Qty: {part.quantity} | ₹{part.price}</div>
                        <div style={{ color: '#4ade80' }}>Click to edit</div>
                        {(part.partImage || part.image) && <div style={{ color: '#c084fc' }}>Has image - can add subparts</div>}
                      </div>
                    )}
                    
                    {/* Drill Down Button (for parts with images) */}
                    {(part.partImage || part.image) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDrillDown(index); }}
                        style={{
                          position: 'absolute',
                          bottom: '-8px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          padding: '2px 6px',
                          fontSize: '10px',
                          backgroundColor: '#9333ea',
                          color: 'white',
                          border: '2px solid white',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        ↓ Enter
                      </button>
                    )}
                    
                    {/* Delete Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeletePart(index); }}
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: '2px solid white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                {/* Pending point */}
                {showPartForm && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${clickPosition.x}%`,
                      top: `${clickPosition.y}%`,
                      transform: 'translate(-50%, -50%)',
                      width: '48px',
                      height: '48px',
                      backgroundColor: editingIndex !== null ? '#22c55e' : '#fbbf24',
                      borderRadius: '50%',
                      border: '4px solid white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: editingIndex !== null ? 'white' : 'black',
                      animation: 'pulse 1s infinite',
                      zIndex: 20
                    }}
                  >
                    {editingIndex !== null ? '✎' : '+'}
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                width: '800px',
                height: '500px',
                backgroundColor: '#333',
                borderRadius: '0 0 8px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#888'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <Package style={{ width: '64px', height: '64px', margin: '0 auto 16px' }} />
                  <p>No image available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{
          width: '320px',
          backgroundColor: 'white',
          borderLeft: '1px solid #ddd',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #eee', backgroundColor: '#f9f9f9' }}>
            <h3 style={{ fontWeight: 'bold', fontSize: '18px', margin: 0 }}>
              {navigationStack.length > 0 ? 'Subparts' : 'Parts'}
            </h3>
            <p style={{ color: '#888', fontSize: '14px', margin: '4px 0 0' }}>Click image to add</p>
          </div>
          
          <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
            {currentParts.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#aaa', padding: '40px 0' }}>
                <Package style={{ width: '48px', height: '48px', margin: '0 auto 8px', opacity: 0.5 }} />
                <p>No parts yet</p>
                <p style={{ fontSize: '14px' }}>Click on image to add</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentParts.map((part, index) => (
                  <div key={index} style={{
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa'
                  }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {(part.partImage || part.image) ? (
                        <img src={part.partImage || part.image} style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold'
                        }}>
                          {index + 1}
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontWeight: '600', margin: 0 }}>{part.name}</h4>
                        <p style={{ fontSize: '12px', color: '#888', margin: '2px 0' }}>
                          Qty: {part.quantity} | ₹{part.price}
                        </p>
                        <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                          {/* Edit Button */}
                          <button
                            onClick={() => handleEditPart(index)}
                            style={{
                              padding: '4px 8px',
                              fontSize: '12px',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Edit2 style={{ width: '12px', height: '12px' }} />
                            Edit
                          </button>
                          
                          {/* View Subparts Button */}
                          {(part.partImage || part.image) && (
                            <button
                              onClick={() => handleDrillDown(index)}
                              style={{
                                padding: '4px 8px',
                                fontSize: '12px',
                                backgroundColor: '#9333ea',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Eye style={{ width: '12px', height: '12px' }} />
                              Subparts ({part.subparts?.length || 0})
                            </button>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePart(index)}
                        style={{
                          padding: '4px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 style={{ width: '16px', height: '16px' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showPartForm && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              width: '480px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
            }}
          >
            <div style={{
              padding: '16px 20px',
              backgroundColor: editingIndex !== null ? '#22c55e' : '#3b82f6',
              color: 'white',
              borderRadius: '12px 12px 0 0'
            }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {editingIndex !== null ? <Edit2 style={{ width: '24px', height: '24px' }} /> : <Package style={{ width: '24px', height: '24px' }} />}
                {editingIndex !== null ? 'Edit' : 'Add'} {navigationStack.length > 0 ? 'Subpart' : 'Part'}
              </h3>
            </div>
            
            <div style={{ padding: '20px' }}>
              {/* Image Upload */}
              <div style={{
                padding: '16px',
                backgroundColor: '#faf5ff',
                border: '1px solid #e9d5ff',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <label style={{ fontWeight: '600', color: '#7c3aed', display: 'block', marginBottom: '8px' }}>
                  Part Image (enables subparts)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {formImage ? (
                    <img src={formImage} style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', border: '2px solid #a855f7' }} />
                  ) : (
                    <div style={{
                      width: '64px',
                      height: '64px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '8px',
                      border: '2px dashed #d1d5db',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Package style={{ width: '32px', height: '32px', color: '#d1d5db' }} />
                    </div>
                  )}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={imageLoading}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Upload style={{ width: '16px', height: '16px' }} />
                      {imageLoading ? 'Uploading...' : 'Upload Image'}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Name */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                  Part Name <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Enter part name"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              {/* Node ID */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                  Part Number / Node ID
                </label>
                <input
                  type="text"
                  value={formNodeName}
                  onChange={(e) => setFormNodeName(e.target.value)}
                  placeholder="e.g., P-001"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              {/* Price & Quantity */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '4px' }}>Price (₹)</label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '4px' }}>Quantity</label>
                  <input
                    type="number"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(e.target.value)}
                    placeholder="1"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
              
              {/* Description */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: '600', display: 'block', marginBottom: '4px' }}>Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Enter description"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
            
            {/* Buttons */}
            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid #eee',
              backgroundColor: '#f9fafb',
              borderRadius: '0 0 12px 12px',
              display: 'flex',
              gap: '12px'
            }}>
              <button
                type="button"
                onClick={handleCloseForm}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <X style={{ width: '16px', height: '16px' }} />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePart}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: editingIndex !== null ? '#22c55e' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: '600'
                }}
              >
                <Save style={{ width: '16px', height: '16px' }} />
                {editingIndex !== null ? 'Update Part' : 'Add Part'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
        }
      `}</style>
    </div>
  );
}
