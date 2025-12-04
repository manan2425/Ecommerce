import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit2, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

export default function AdminCategories() {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    image: ''
  });

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/categories/get-all');
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.log(error);
      toast({
        title: 'Error fetching categories',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: '',
      image: ''
    });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Category name is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      if (editingId) {
        // Update
        const response = await api.put(`/admin/categories/update/${editingId}`, formData);
        if (response.data.success) {
          toast({
            title: 'Category updated successfully'
          });
          fetchCategories();
          setIsSheetOpen(false);
          resetForm();
        }
      } else {
        // Create
        const response = await api.post('/admin/categories/add', formData);
        if (response.data.success) {
          toast({
            title: 'Category created successfully'
          });
          fetchCategories();
          setIsSheetOpen(false);
          resetForm();
        }
      }
    } catch (error) {
      console.log(error);
      toast({
        title: error.response?.data?.message || 'Error saving category',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      image: category.image || ''
    });
    setEditingId(category._id);
    setIsSheetOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      setIsDeleting(true);
      const response = await api.delete(`/admin/categories/delete/${id}`);
      if (response.data.success) {
        toast({
          title: 'Category deleted successfully'
        });
        fetchCategories();
      }
    } catch (error) {
      console.log(error);
      toast({
        title: 'Error deleting category',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const response = await api.patch(`/admin/categories/toggle/${id}`);
      if (response.data.success) {
        toast({
          title: response.data.message
        });
        fetchCategories();
      }
    } catch (error) {
      console.log(error);
      toast({
        title: 'Error updating category status',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Categories Management</h1>
          <p className="text-gray-600 mt-1">Create and manage product categories</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsSheetOpen(true);
          }}
          className="gap-2"
        >
          <Plus size={20} />
          Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      {loading && categories.length === 0 ? (
        <div className="text-center py-12">Loading categories...</div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600 mb-4">No categories found</p>
            <Button
              onClick={() => {
                resetForm();
                setIsSheetOpen(true);
              }}
            >
              Create First Category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card
              key={category._id}
              className={`hover:shadow-lg transition ${
                !category.isActive ? 'opacity-60' : ''
              }`}
            >
              {category.image && (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-32 object-cover rounded-t-lg"
                />
              )}
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    {category.icon && <span className="text-2xl">{category.icon}</span>}
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Slug: <code className="bg-gray-100 px-2 py-1 rounded">{category.slug}</code>
                  </p>

                  {/* Status Badge */}
                  <div className="pt-2">
                    <button
                      onClick={() =>
                        handleToggleStatus(category._id, category.isActive)
                      }
                      className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded transition ${
                        category.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.isActive ? (
                        <>
                          <Eye size={16} />
                          Active
                        </>
                      ) : (
                        <>
                          <EyeOff size={16} />
                          Inactive
                        </>
                      )}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(category)}
                      className="flex-1 gap-2"
                    >
                      <Edit2 size={16} />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(category._id)}
                      disabled={isDeleting}
                      className="flex-1 gap-2"
                    >
                      <Trash2 size={16} />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="overflow-auto w-full sm:w-[500px]">
          <SheetHeader>
            <SheetTitle>
              {editingId ? 'Edit Category' : 'Add New Category'}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div>
              <Label>Category Name *</Label>
              <Input
                placeholder="e.g., Electronics, Clothing, etc."
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Category description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="mt-1 h-24"
              />
            </div>

            <div>
              <Label>Icon (emoji or URL)</Label>
              <Input
                placeholder="e.g., 📱 or https://example.com/icon.png"
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label>Category Image URL</Label>
              <Input
                placeholder="https://example.com/category-image.jpg"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                className="mt-1"
              />
              {formData.image && (
                <img
                  src={formData.image}
                  alt="Preview"
                  className="mt-2 h-32 w-full object-cover rounded"
                  onError={(e) => {
                    e.target.src = '';
                  }}
                />
              )}
            </div>

            <div className="flex gap-2 pt-6 border-t">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="flex-1"
              >
                {editingId ? 'Update Category' : 'Create Category'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsSheetOpen(false);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
