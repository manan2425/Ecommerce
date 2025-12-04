import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Trash2, Edit2, Plus, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

export default function PartsManagement({ product, onSave, isOpen, onClose }) {
  const [parts, setParts] = useState(product?.parts || []);
  const [editingPath, setEditingPath] = useState(null); // Track path to current editing part
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedParts, setExpandedParts] = useState({});

  const resetForm = () => {
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
    setEditingPath(null);
    setShowAddForm(false);
  };

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

  const setPartAtPath = (path, newPart) => {
    if (!path || path.length === 0) return parts;
    
    const newParts = JSON.parse(JSON.stringify(parts));
    let current = newParts;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
      if (!current.subparts) current.subparts = [];
      current = current.subparts;
    }
    
    current[path[path.length - 1]] = newPart;
    return newParts;
  };

  const handleAddOrUpdatePart = () => {
    if (!partForm.name || !partForm.quantity) {
      alert('Please fill in Name and Quantity');
      return;
    }

    const newPart = {
      ...partForm,
      price: partForm.price ? Number(partForm.price) : 0,
      quantity: Number(partForm.quantity),
      subparts: partForm.subparts || []
    };

    let updatedParts;
    if (editingPath !== null && editingPath.length > 0) {
      updatedParts = setPartAtPath(editingPath, newPart);
    } else if (editingPath === null) {
      // Adding new top-level part
      updatedParts = [...parts, newPart];
    } else {
      // Shouldn't happen
      updatedParts = parts;
    }

    setParts(updatedParts);
    resetForm();
  };

  const handleEditPart = (path) => {
    const part = path === null ? null : getPartAtPath(path);
    if (part) {
      setPartForm({
        ...part,
        price: part.price || '',
        quantity: part.quantity || '',
        subparts: part.subparts || []
      });
      setEditingPath(path);
      setShowAddForm(true);
    }
  };

  const handleDeletePart = (path) => {
    if (window.confirm('Are you sure you want to delete this part and all its subparts?')) {
      if (path.length === 1) {
        setParts(parts.filter((_, idx) => idx !== path[0]));
      } else {
        const newParts = JSON.parse(JSON.stringify(parts));
        let current = newParts;
        for (let i = 0; i < path.length - 2; i++) {
          current = current[path[i]];
          current = current.subparts;
        }
        current.splice(path[path.length - 1], 1);
        setParts(newParts);
      }
    }
  };

  const renderPartsList = (partsList, path = []) => {
    return (
      <div className="space-y-2">
        {partsList.map((part, idx) => {
          const currentPath = [...path, idx];
          const isExpanded = expandedParts[JSON.stringify(currentPath)];
          const hasSubparts = part.subparts && part.subparts.length > 0;

          return (
            <div key={idx}>
              <Card className="bg-gray-50 hover:bg-gray-100 transition">
                <CardContent className="p-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {hasSubparts && (
                          <button
                            onClick={() => {
                              const key = JSON.stringify(currentPath);
                              setExpandedParts(prev => ({
                                ...prev,
                                [key]: !isExpanded
                              }));
                            }}
                            className="text-blue-600 hover:bg-blue-100 p-1 rounded"
                          >
                            <ChevronRight size={16} className={isExpanded ? 'rotate-90' : ''} />
                          </button>
                        )}
                        <div>
                          <h4 className="font-semibold text-sm">{part.name}</h4>
                          {part.nodeName && (
                            <p className="text-xs text-gray-600">ID: {part.nodeName}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-6 grid grid-cols-3 gap-2 text-xs mt-2">
                        <div>
                          <span className="text-gray-600">Qty:</span>
                          <p className="font-bold text-blue-600">{part.quantity}</p>
                        </div>
                        {part.price > 0 && (
                          <div>
                            <span className="text-gray-600">Price:</span>
                            <p className="font-bold">${part.price}</p>
                          </div>
                        )}
                        {hasSubparts && (
                          <div>
                            <span className="text-gray-600">Subparts:</span>
                            <p className="font-bold text-orange-600">{part.subparts.length}</p>
                          </div>
                        )}
                      </div>

                      {part.description && (
                        <p className="text-xs text-gray-600 mt-2 ml-6">{part.description}</p>
                      )}
                    </div>

                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditPart(currentPath)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeletePart(currentPath)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Add Subpart Button */}
                  {hasSubparts && (
                    <button
                      onClick={() => {
                        const key = JSON.stringify([...currentPath, 'add']);
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
                        setEditingPath([...currentPath, part.subparts.length]);
                        setShowAddForm(true);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 ml-6 mt-2 font-semibold"
                    >
                      + Add Subpart
                    </button>
                  )}
                </CardContent>
              </Card>

              {/* Subparts List */}
              {hasSubparts && isExpanded && (
                <div className="ml-6 mt-2 border-l-2 border-blue-200 pl-3">
                  {renderPartsList(part.subparts, currentPath)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const handleSave = () => {
    onSave(parts);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm();
        onClose();
      }
    }}>
      <SheetContent side="right" className="overflow-auto w-full sm:w-[700px]">
        <SheetHeader>
          <SheetTitle>Manage Parts & Subparts - {product?.title}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Parts Tree View */}
          <div>
            <h3 className="font-semibold mb-3">Parts Hierarchy ({parts.length})</h3>
            
            {parts.length === 0 ? (
              <p className="text-sm text-gray-500 mb-4">No parts added yet</p>
            ) : (
              <div className="space-y-2 mb-4 max-h-96 overflow-y-auto border rounded p-3 bg-white">
                {renderPartsList(parts)}
              </div>
            )}
          </div>

          {/* Add/Edit Form */}
          <div className="border-t pt-4">
            {!showAddForm ? (
              <Button
                onClick={() => {
                  setShowAddForm(true);
                  setEditingPath(null);
                }}
                className="w-full"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Top-Level Part
              </Button>
            ) : (
              <div className="space-y-3 bg-blue-50 p-4 rounded">
                <h4 className="font-semibold text-sm">
                  {editingPath !== null ? 'Edit Part' : 'Add New Part'}
                </h4>

                <div>
                  <Label className="text-xs">Part Name *</Label>
                  <Input
                    placeholder="e.g., Gearbox"
                    value={partForm.name}
                    onChange={(e) => setPartForm({ ...partForm, name: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs">Part ID (optional)</Label>
                  <Input
                    placeholder="e.g., gearbox_001"
                    value={partForm.nodeName}
                    onChange={(e) => setPartForm({ ...partForm, nodeName: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Quantity *</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 10"
                      value={partForm.quantity}
                      onChange={(e) => setPartForm({ ...partForm, quantity: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Price (optional)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 50"
                      value={partForm.price}
                      onChange={(e) => setPartForm({ ...partForm, price: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Description (optional)</Label>
                  <Textarea
                    placeholder="Part description"
                    value={partForm.description}
                    onChange={(e) => setPartForm({ ...partForm, description: e.target.value })}
                    className="mt-1 h-20"
                  />
                </div>

                <div>
                  <Label className="text-xs">Part Image URL (optional)</Label>
                  <Input
                    placeholder="https://example.com/part-image.jpg"
                    value={partForm.partImage}
                    onChange={(e) => setPartForm({ ...partForm, partImage: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs">Hotspot X (% from left, optional)</Label>
                  <Input
                    type="number"
                    placeholder="0-100"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs">Hotspot Y (% from top, optional)</Label>
                  <Input
                    type="number"
                    placeholder="0-100"
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleAddOrUpdatePart}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {editingPath !== null ? 'Update Part' : 'Add Part'}
                  </Button>
                  <Button
                    onClick={resetForm}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="border-t pt-4 flex gap-2 sticky bottom-0 bg-white">
            <Button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700">
              Save All Changes
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
