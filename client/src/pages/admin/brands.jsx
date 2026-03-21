import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Edit2, Trash2, Plus, Eye, EyeOff, Globe, Building2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

export default function AdminBrands() {
  const { toast } = useToast();
  const [brands, setBrands] = useState([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: '',
    website: '',
    country: ''
  });

  // Fetch all brands
  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/brands/get-all');
      if (response.data.success) {
        setBrands(response.data.data || []);
      }
    } catch (error) {
      console.log(error);
      toast({
        title: 'Error fetching brands',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      logo: '',
      website: '',
      country: ''
    });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Brand name is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      if (editingId) {
        // Update
        const response = await api.put(`/admin/brands/update/${editingId}`, formData);
        if (response.data.success) {
          toast({
            title: 'Brand updated successfully'
          });
          fetchBrands();
          setIsSheetOpen(false);
          resetForm();
        }
      } else {
        // Create
        const response = await api.post('/admin/brands/add', formData);
        if (response.data.success) {
          toast({
            title: 'Brand created successfully'
          });
          fetchBrands();
          setIsSheetOpen(false);
          resetForm();
        }
      }
    } catch (error) {
      console.log(error);
      toast({
        title: error.response?.data?.message || 'Error saving brand',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (brand) => {
    setFormData({
      name: brand.name,
      description: brand.description || '',
      logo: brand.logo || '',
      website: brand.website || '',
      country: brand.country || ''
    });
    setEditingId(brand._id);
    setIsSheetOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      setIsDeleting(true);
      const response = await api.delete(`/admin/brands/delete/${id}`);
      if (response.data.success) {
        toast({
          title: 'Brand deleted successfully'
        });
        fetchBrands();
      }
    } catch (error) {
      console.log(error);
      toast({
        title: 'Error deleting brand',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const response = await api.patch(`/admin/brands/toggle/${id}`);
      if (response.data.success) {
        toast({
          title: response.data.message
        });
        fetchBrands();
      }
    } catch (error) {
      console.log(error);
      toast({
        title: 'Error updating brand status',
        variant: 'destructive'
      });
    }
  };

  const handleSeedBrands = async () => {
    try {
      setSeeding(true);
      const response = await api.post('/admin/brands/seed');
      if (response.data.success) {
        toast({
          title: response.data.message
        });
        fetchBrands();
      }
    } catch (error) {
      console.log(error);
      toast({
        title: error.response?.data?.message || 'Error seeding brands',
        variant: 'destructive'
      });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Brands Management</h1>
          <p className="text-gray-600 mt-1">Create and manage industrial product brands</p>
        </div>
        <div className="flex gap-2">
          {brands.length === 0 && (
            <Button
              onClick={handleSeedBrands}
              variant="outline"
              disabled={seeding}
              className="gap-2"
            >
              {seeding ? <Loader2 className="animate-spin" size={20} /> : <Building2 size={20} />}
              Seed 40 Industrial Brands
            </Button>
          )}
          <Button
            onClick={() => {
              resetForm();
              setIsSheetOpen(true);
            }}
            className="gap-2"
          >
            <Plus size={20} />
            Add Brand
          </Button>
        </div>
      </div>

      {/* Brands Grid */}
      {loading && brands.length === 0 ? (
        <div className="text-center py-12">Loading brands...</div>
      ) : brands.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">No brands found</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleSeedBrands} disabled={seeding} variant="outline">
                {seeding ? 'Seeding...' : 'Seed 40 Industrial Brands'}
              </Button>
              <Button
                onClick={() => {
                  resetForm();
                  setIsSheetOpen(true);
                }}
              >
                Create First Brand
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="bg-muted/50 p-4 rounded-lg mb-4">
            <p className="text-sm text-muted-foreground">
              Total Brands: <strong>{brands.length}</strong> | 
              Active: <strong>{brands.filter(b => b.isActive).length}</strong> | 
              Inactive: <strong>{brands.filter(b => !b.isActive).length}</strong>
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {brands.map((brand) => (
              <Card
                key={brand._id}
                className={`hover:shadow-lg transition ${
                  !brand.isActive ? 'opacity-60' : ''
                }`}
              >
                {brand.logo && (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-full h-24 object-contain p-4 bg-white rounded-t-lg"
                  />
                )}
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg">{brand.name}</h3>
                    
                    {brand.country && (
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Globe size={14} />
                        {brand.country}
                      </p>
                    )}
                    
                    {brand.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {brand.description}
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      Slug: <code className="bg-gray-100 px-2 py-1 rounded">{brand.slug}</code>
                    </p>

                    {brand.website && (
                      <a 
                        href={brand.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Globe size={12} />
                        Visit Website
                      </a>
                    )}

                    {/* Status Badge */}
                    <div className="pt-2">
                      <button
                        onClick={() =>
                          handleToggleStatus(brand._id, brand.isActive)
                        }
                        className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded transition ${
                          brand.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {brand.isActive ? (
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
                        onClick={() => handleEdit(brand)}
                        className="flex-1 gap-2"
                      >
                        <Edit2 size={16} />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(brand._id)}
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
        </>
      )}

      {/* Add/Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="overflow-auto w-full sm:w-[500px]">
          <SheetHeader>
            <SheetTitle>
              {editingId ? 'Edit Brand' : 'Add New Brand'}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div>
              <Label htmlFor="name">Brand Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Siemens"
              />
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                placeholder="e.g., Germany"
              />
            </div>

            <div>
              <Label htmlFor="website">Website URL</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                placeholder="https://www.siemens.com"
              />
            </div>

            <div>
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                value={formData.logo}
                onChange={(e) =>
                  setFormData({ ...formData, logo: e.target.value })
                }
                placeholder="Logo image URL"
              />
              {formData.logo && (
                <img
                  src={formData.logo}
                  alt="Logo preview"
                  className="mt-2 h-20 object-contain bg-gray-100 rounded p-2"
                />
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the brand"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
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
              <Button
                onClick={handleSave}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
