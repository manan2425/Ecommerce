import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
    fetchAllServicesAdmin, 
    addService, 
    editService, 
    deleteService,
    toggleServiceStatus 
} from "@/store/admin/service-slice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
    Plus, 
    Pencil, 
    Trash2, 
    Loader2,
    X,
    Settings
} from "lucide-react";

const SERVICE_CATEGORIES = [
    'Technical Drawings',
    'Mechatronics System Design',
    'CNC Machine Kaizen',
    'Panel Designing',
    'Concept Preparation',
    'Technical Presentation',
    'Project Management'
];

const PRICE_TYPES = [
    { value: 'fixed', label: 'Fixed Price' },
    { value: 'hourly', label: 'Per Hour' },
    { value: 'daily', label: 'Per Day' },
    { value: 'project', label: 'Per Project' }
];

const initialFormData = {
    title: '',
    description: '',
    category: '',
    image: '',
    price: '',
    priceType: 'fixed',
    estimatedDuration: '',
    features: [],
    specifications: [],
    displayOrder: 0
};

const AdminServices = () => {
    const dispatch = useDispatch();
    const { toast } = useToast();
    const { serviceList, isLoading } = useSelector(state => state.adminServices);
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentServiceId, setCurrentServiceId] = useState(null);
    const [formData, setFormData] = useState(initialFormData);
    const [featureInput, setFeatureInput] = useState('');
    const [specLabel, setSpecLabel] = useState('');
    const [specValue, setSpecValue] = useState('');

    useEffect(() => {
        dispatch(fetchAllServicesAdmin());
    }, [dispatch]);

    const resetForm = () => {
        setFormData(initialFormData);
        setFeatureInput('');
        setSpecLabel('');
        setSpecValue('');
        setIsEditMode(false);
        setCurrentServiceId(null);
    };

    const handleOpenDialog = (service = null) => {
        if (service) {
            setIsEditMode(true);
            setCurrentServiceId(service._id);
            setFormData({
                title: service.title,
                description: service.description,
                category: service.category,
                image: service.image || '',
                price: service.price.toString(),
                priceType: service.priceType || 'fixed',
                estimatedDuration: service.estimatedDuration || '',
                features: service.features || [],
                specifications: service.specifications || [],
                displayOrder: service.displayOrder || 0
            });
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        resetForm();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddFeature = () => {
        if (featureInput.trim()) {
            setFormData(prev => ({
                ...prev,
                features: [...prev.features, featureInput.trim()]
            }));
            setFeatureInput('');
        }
    };

    const handleRemoveFeature = (index) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    const handleAddSpec = () => {
        if (specLabel.trim() && specValue.trim()) {
            setFormData(prev => ({
                ...prev,
                specifications: [...prev.specifications, { label: specLabel.trim(), value: specValue.trim() }]
            }));
            setSpecLabel('');
            setSpecValue('');
        }
    };

    const handleRemoveSpec = (index) => {
        setFormData(prev => ({
            ...prev,
            specifications: prev.specifications.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.description || !formData.category || !formData.price) {
            toast({
                title: "Error",
                description: "Please fill all required fields",
                variant: "destructive"
            });
            return;
        }

        try {
            const serviceData = {
                ...formData,
                price: parseFloat(formData.price),
                displayOrder: parseInt(formData.displayOrder) || 0
            };

            if (isEditMode) {
                await dispatch(editService({ id: currentServiceId, serviceData })).unwrap();
                toast({ title: "Success", description: "Service updated successfully" });
            } else {
                await dispatch(addService(serviceData)).unwrap();
                toast({ title: "Success", description: "Service added successfully" });
            }
            handleCloseDialog();
            dispatch(fetchAllServicesAdmin());
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to save service",
                variant: "destructive"
            });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this service?")) {
            try {
                await dispatch(deleteService(id)).unwrap();
                toast({ title: "Success", description: "Service deleted successfully" });
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to delete service",
                    variant: "destructive"
                });
            }
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await dispatch(toggleServiceStatus(id)).unwrap();
            toast({ title: "Success", description: "Service status updated" });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update status",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Services Management</h1>
                    <p className="text-muted-foreground">Manage your professional services</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Service
                </Button>
            </div>

            {/* Services Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        All Services ({serviceList.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : serviceList.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No services found. Add your first service!
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {serviceList.map(service => (
                                    <TableRow key={service._id}>
                                        <TableCell className="font-medium">
                                            {service.title}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{service.category}</Badge>
                                        </TableCell>
                                        <TableCell>₹{service.price.toLocaleString()}</TableCell>
                                        <TableCell className="capitalize">{service.priceType}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Switch 
                                                    checked={service.isActive}
                                                    onCheckedChange={() => handleToggleStatus(service._id)}
                                                />
                                                <span className={service.isActive ? 'text-green-600' : 'text-red-600'}>
                                                    {service.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => handleOpenDialog(service)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="destructive"
                                                    onClick={() => handleDelete(service._id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditMode ? 'Edit Service' : 'Add New Service'}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Service title"
                                    required
                                />
                            </div>
                            
                            <div className="col-span-2">
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Service description"
                                    rows={3}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="category">Category *</Label>
                                <Select 
                                    value={formData.category} 
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SERVICE_CATEGORIES.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="priceType">Price Type</Label>
                                <Select 
                                    value={formData.priceType} 
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, priceType: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PRICE_TYPES.map(type => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="price">Price (₹) *</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder="0"
                                    min="0"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="estimatedDuration">Est. Duration</Label>
                                <Input
                                    id="estimatedDuration"
                                    name="estimatedDuration"
                                    value={formData.estimatedDuration}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 2-3 days"
                                />
                            </div>

                            <div>
                                <Label htmlFor="image">Image URL</Label>
                                <Input
                                    id="image"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleInputChange}
                                    placeholder="https://..."
                                />
                            </div>

                            <div>
                                <Label htmlFor="displayOrder">Display Order</Label>
                                <Input
                                    id="displayOrder"
                                    name="displayOrder"
                                    type="number"
                                    value={formData.displayOrder}
                                    onChange={handleInputChange}
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Features */}
                        <div>
                            <Label>Features / Deliverables</Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    value={featureInput}
                                    onChange={(e) => setFeatureInput(e.target.value)}
                                    placeholder="Add a feature"
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                                />
                                <Button type="button" onClick={handleAddFeature} variant="outline">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            {formData.features.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.features.map((feature, idx) => (
                                        <Badge key={idx} variant="secondary" className="gap-1 pr-1">
                                            {feature}
                                            <button 
                                                type="button"
                                                onClick={() => handleRemoveFeature(idx)}
                                                className="ml-1 hover:bg-muted rounded-full"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Specifications */}
                        <div>
                            <Label>Specifications</Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    value={specLabel}
                                    onChange={(e) => setSpecLabel(e.target.value)}
                                    placeholder="Label"
                                    className="w-1/3"
                                />
                                <Input
                                    value={specValue}
                                    onChange={(e) => setSpecValue(e.target.value)}
                                    placeholder="Value"
                                    className="flex-1"
                                />
                                <Button type="button" onClick={handleAddSpec} variant="outline">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            {formData.specifications.length > 0 && (
                                <div className="space-y-1 mt-2">
                                    {formData.specifications.map((spec, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-sm bg-muted p-2 rounded">
                                            <span><strong>{spec.label}:</strong> {spec.value}</span>
                                            <button 
                                                type="button"
                                                onClick={() => handleRemoveSpec(idx)}
                                                className="hover:bg-background rounded p-1"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                {isEditMode ? 'Update Service' : 'Add Service'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminServices;
