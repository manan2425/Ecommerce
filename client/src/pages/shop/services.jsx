import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { fetchActiveServices } from "@/store/shop/service-slice";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
    Wrench, 
    Cpu, 
    Settings, 
    FileText, 
    Lightbulb, 
    Presentation, 
    FolderKanban,
    MessageSquare,
    Clock,
    CheckCircle,
    Loader2,
    Send
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const SERVICE_CATEGORIES = [
    { value: 'all', label: 'All Services', icon: Settings },
    { value: 'Technical Drawings', label: 'Technical Drawings', icon: FileText },
    { value: 'Mechatronics System Design', label: 'Mechatronics', icon: Cpu },
    { value: 'CNC Machine Kaizen', label: 'CNC Kaizen', icon: Wrench },
    { value: 'Panel Designing', label: 'Panel Design', icon: Settings },
    { value: 'Concept Preparation', label: 'Concept Prep', icon: Lightbulb },
    { value: 'Technical Presentation', label: 'Presentation', icon: Presentation },
    { value: 'Project Management', label: 'Project Mgmt', icon: FolderKanban },
];

const TIMELINE_OPTIONS = [
    "Within 1 week",
    "1-2 weeks",
    "2-4 weeks",
    "1-2 months",
    "Flexible"
];

const BUDGET_OPTIONS = [
    "Under ₹10,000",
    "₹10,000 - ₹25,000",
    "₹25,000 - ₹50,000",
    "₹50,000 - ₹1,00,000",
    "Above ₹1,00,000",
    "To be discussed"
];

const ServiceCard = ({ service, onInquiry, isSubmitting }) => {
    const getCategoryIcon = (category) => {
        const cat = SERVICE_CATEGORIES.find(c => c.value === category);
        const Icon = cat?.icon || Settings;
        return <Icon className="h-6 w-6" />;
    };
    return (
        <Card className="flex flex-col h-full hover-lift border-0 shadow-premium bg-white group rounded-[2rem] overflow-hidden">
            <CardHeader className="p-8 pb-3">
                <div className="flex items-start justify-between">
                    <div className="p-4 bg-primary/5 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                        {getCategoryIcon(service.category)}
                    </div>
                    <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-200 border-0 px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-all">
                        {service.category}
                    </Badge>
                </div>
                <CardTitle className="text-xl font-bold mt-6 line-clamp-2 text-slate-900 group-hover:text-primary transition-colors">{service.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 flex-grow">
                <p className="text-sm text-slate-500 leading-relaxed font-medium line-clamp-3 mb-6">
                    {service.description}
                </p>
                
                {service.features && service.features.length > 0 && (
                    <div className="space-y-2 mb-6">
                        {service.features.slice(0, 3).map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-sm text-slate-600 font-bold">
                                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                                <span className="line-clamp-1">{feature}</span>
                            </div>
                        ))}
                    </div>
                )}

                {service.estimatedDuration && (
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                        <Clock className="h-4 w-4" />
                        <span>Est. Duration: {service.estimatedDuration}</span>
                    </div>
                )}
            </CardContent>
            <CardFooter className="p-6 bg-slate-50/50 border-t border-slate-100 italic">
                <Button 
                    onClick={() => onInquiry(service)}
                    disabled={isSubmitting}
                    className="gap-2 w-full py-6 rounded-xl font-bold bg-white text-slate-900 border border-slate-200 hover:bg-primary hover:text-white hover:border-primary shadow-sm hover:shadow-lg transition-all"
                >
                    {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <MessageSquare className="h-4 w-4" />
                    )}
                    Inquiry
                </Button>
            </CardFooter>
        </Card>
    );
};

const ShopServices = () => {
    const dispatch = useDispatch();
    const { toast } = useToast();
    const { serviceList, isLoading } = useSelector(state => state.shopServices);
    const { user, isAuthenticated } = useSelector(state => state.auth);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: '',
        budget: '',
        timeline: ''
    });

    useEffect(() => {
        dispatch(fetchActiveServices(selectedCategory));
    }, [dispatch, selectedCategory]);

    // Pre-fill user data if authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            setFormData(prev => ({
                ...prev,
                name: user.userName || '',
                email: user.email || ''
            }));
        }
    }, [isAuthenticated, user]);

    const handleInquiry = (service) => {
        setSelectedService(service);
        setInquiryDialogOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitInquiry = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.message) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axios.post(
                `${API_URL}/api/shop/service-inquiry/submit`,
                {
                    ...formData,
                    serviceId: selectedService._id
                }
            );

            if (response.data.success) {
                toast({
                    title: "Inquiry Submitted!",
                    description: response.data.message || "We'll get back to you within 24 hours."
                });
                setInquiryDialogOpen(false);
                setFormData({
                    name: isAuthenticated ? user?.userName || '' : '',
                    email: isAuthenticated ? user?.email || '' : '',
                    phone: '',
                    company: '',
                    message: '',
                    budget: '',
                    timeline: ''
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to submit inquiry. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-mesh">
            {/* Cinematic Services Mini-Hero */}
            <section className="relative overflow-hidden pt-32 pb-20">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-24 pointer-events-none animate-pulse"></div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-6">
                        Industrial Engineering
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight tracking-tight mb-8">
                        Technical Solutions <br />
                        <span className="text-gradient-primary">Built for Precision</span>
                    </h1>
                    <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                        Professional engineering services covering everything from mechatronics system design to complete CNC machine kaizen and project management.
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-6 py-12">

            {/* Category Tabs */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
                <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent justify-center">
                    {SERVICE_CATEGORIES.map(cat => {
                        const Icon = cat.icon;
                        return (
                            <TabsTrigger 
                                key={cat.value} 
                                value={cat.value}
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                            >
                                <Icon className="h-4 w-4" />
                                <span className="hidden sm:inline">{cat.label}</span>
                            </TabsTrigger>
                        );
                    })}
                </TabsList>
            </Tabs>

            {/* Services Grid */}
            {isLoading ? (
                <div className="flex justify-center items-center min-h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : serviceList.length === 0 ? (
                <div className="text-center py-16">
                    <Settings className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium">No Services Available</h3>
                    <p className="text-muted-foreground">
                        {selectedCategory === 'all' 
                            ? 'Services will be available soon.' 
                            : 'No services in this category yet.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {serviceList.map(service => (
                        <ServiceCard 
                            key={service._id} 
                            service={service}
                            onInquiry={handleInquiry}
                            isSubmitting={isSubmitting && selectedService?._id === service._id}
                        />
                    ))}
                </div>
            )}

            {/* Service Info Section */}
            <div className="mt-16 bg-muted/50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-center mb-8">Why Choose Our Services?</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-2">Expert Team</h3>
                        <p className="text-sm text-muted-foreground">
                            Experienced engineers with deep industry knowledge
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-2">Timely Delivery</h3>
                        <p className="text-sm text-muted-foreground">
                            On-time project completion with quality assurance
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Wrench className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-2">End-to-End Support</h3>
                        <p className="text-sm text-muted-foreground">
                            Complete support from concept to implementation
                        </p>
                    </div>
                </div>
            </div>
        </div>

            {/* Service Inquiry Dialog */}
            <Dialog open={inquiryDialogOpen} onOpenChange={setInquiryDialogOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            Service Inquiry
                        </DialogTitle>
                        <DialogDescription>
                            {selectedService && (
                                <span>
                                    Fill out the form below to inquire about{" "}
                                    <strong>{selectedService.title}</strong>
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedService && (
                        <form onSubmit={handleSubmitInquiry} className="space-y-4">
                            {/* Service Info */}
                            <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <Settings className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{selectedService.title}</p>
                                        {selectedService.category && (
                                            <p className="text-sm text-muted-foreground">
                                                {selectedService.category}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Your name"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="your@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company">Company</Label>
                                    <Input
                                        id="company"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleInputChange}
                                        placeholder="Your company name"
                                    />
                                </div>
                            </div>

                            {/* Budget & Timeline */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="budget">Budget Range</Label>
                                    <Select 
                                        value={formData.budget} 
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select budget" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {BUDGET_OPTIONS.map(option => (
                                                <SelectItem key={option} value={option}>
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="timeline">Expected Timeline</Label>
                                    <Select 
                                        value={formData.timeline} 
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, timeline: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select timeline" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {TIMELINE_OPTIONS.map(option => (
                                                <SelectItem key={option} value={option}>
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Message */}
                            <div className="space-y-2">
                                <Label htmlFor="message">Your Requirements *</Label>
                                <Textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    placeholder="Please describe your project requirements, specifications, and any other details..."
                                    rows={4}
                                    required
                                />
                            </div>

                            {/* Submit Button */}
                            <Button 
                                type="submit" 
                                className="w-full gap-2"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                                {isSubmitting ? "Submitting..." : "Submit Inquiry"}
                            </Button>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ShopServices;
