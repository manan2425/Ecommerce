import { useState } from "react";
import axios from "axios";
import { 
    MapPin, 
    Phone, 
    Mail, 
    Clock, 
    Send,
    Loader2,
    CheckCircle,
    MessageSquare,
    Building2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const Contact = () => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: ''
    });

    const contactInfo = [
        {
            icon: MapPin,
            title: "Visit Us",
            details: ["SHREE MARUTI TRADERS", "Plot 59, Shop 6, Aarogyajyoti Pharmacy", "GIDC, V.U. Nagar, Anand - 388121"]
        },
        {
            icon: Phone,
            title: "Call Us",
            details: ["Rushil Sevak: +91 78743 93297", "Anish Sharma: +91 89882 99522"]
        },
        {
            icon: Mail,
            title: "Email Us",
            details: ["mtronapp@gmail.com"]
        },
        {
            icon: Clock,
            title: "Working Hours",
            details: ["Monday - Friday: 9:00 AM - 6:00 PM", "Saturday: 9:00 AM - 1:00 PM", "GST: 24AHLPS6771N1ZH"]
        }
    ];

    const subjectOptions = [
        "General Inquiry",
        "Technical Drawings",
        "Mechatronics System Design",
        "CNC Machine Kaizen",
        "Panel Designing",
        "Project Management",
        "Quote Request",
        "Support",
        "Other"
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
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
                `${API_URL}/api/shop/contact/submit`,
                formData
            );

            if (response.data.success) {
                setIsSubmitted(true);
                toast({
                    title: "Message Sent!",
                    description: response.data.message || "We'll get back to you within 24 hours."
                });

                // Reset form after 3 seconds
                setTimeout(() => {
                    setIsSubmitted(false);
                    setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        company: '',
                        subject: '',
                        message: ''
                    });
                }, 3000);
            } else {
                toast({
                    title: "Error",
                    description: response.data.message || "Failed to send message",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to send message. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-mesh">
            {/* Cinematic Contact Mini-Hero */}
            <section className="relative overflow-hidden pt-32 pb-20">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-24 pointer-events-none animate-pulse"></div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-6">
                        Get In Touch
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight tracking-tight mb-8">
                        Connect with <br />
                        <span className="text-gradient-primary">Our Specialists</span>
                    </h1>
                    <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                        Have a question about a specific component or a massive project? Our team is ready to deliver the answers you need.
                    </p>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="py-12 -mt-8">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {contactInfo.map((info, index) => {
                            const Icon = info.icon;
                            return (
                                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="font-semibold mb-2">{info.title}</h3>
                                        <div className="space-y-1">
                                            {info.details.map((detail, idx) => (
                                                <p key={idx} className="text-sm text-muted-foreground">{detail}</p>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Contact Form & Map */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Contact Form */}
                        <Card className="border-0 shadow-premium rounded-[3rem] bg-white overflow-hidden group transition-all duration-500 hover:shadow-2xl">
                            <CardHeader className="p-10 pb-2">
                                <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
                                    <MessageSquare className="h-6 w-6 text-primary" />
                                    Send us a Message
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-10 pt-6">
                                {isSubmitted ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="h-8 w-8 text-green-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
                                        <p className="text-muted-foreground">
                                            Your message has been sent successfully. We'll get back to you soon.
                                        </p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
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
                                            <div>
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

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="phone">Phone</Label>
                                                <Input
                                                    id="phone"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    placeholder="+91 98765 43210"
                                                />
                                            </div>
                                            <div>
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

                                        <div>
                                            <Label htmlFor="subject">Subject</Label>
                                            <Select 
                                                value={formData.subject} 
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a subject" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {subjectOptions.map(option => (
                                                        <SelectItem key={option} value={option}>
                                                            {option}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="message">Message *</Label>
                                            <Textarea
                                                id="message"
                                                name="message"
                                                value={formData.message}
                                                onChange={handleInputChange}
                                                placeholder="Tell us about your project or inquiry..."
                                                rows={5}
                                                required
                                            />
                                        </div>

                                        <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4" />
                                                    Send Message
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>

                        {/* Map & Additional Info */}
                        <div className="space-y-6">
                            {/* Google Maps - Anand, Gujarat */}
                            <Card className="overflow-hidden">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d58917.77423489557!2d72.90726955!3d22.5645175!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e4e5a58e93f9f%3A0x1c0f79a4a3b87ba!2sAnand%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1702123456789!5m2!1sen!2sin"
                                    width="100%"
                                    height="300"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Our Location - Anand, Gujarat"
                                    className="rounded-lg"
                                ></iframe>
                            </Card>

                            {/* Quick Contact */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Building2 className="h-5 w-5 text-primary" />
                                        Quick Contact
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                        <Phone className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">For Sales Inquiries</p>
                                            <p className="font-medium">+91 98765 43210</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                        <Mail className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">For Technical Support</p>
                                            <p className="font-medium">support@company.com</p>
                                        </div>
                                    </div>
                                    <div className="text-center pt-2">
                                        <p className="text-sm text-muted-foreground">
                                            We typically respond within 24 hours
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-12 bg-muted/50">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
                    <div className="max-w-3xl mx-auto space-y-4">
                        {[
                            {
                                q: "What is your typical project turnaround time?",
                                a: "Depending on the project complexity, turnaround time ranges from a few days to several weeks. We provide detailed timelines during the quotation phase."
                            },
                            {
                                q: "Do you provide on-site services?",
                                a: "Yes, we offer on-site services for installation, commissioning, and training. Travel costs are quoted separately based on location."
                            },
                            {
                                q: "What payment methods do you accept?",
                                a: "We accept bank transfers, UPI, and major credit/debit cards. For larger projects, we offer milestone-based payment options."
                            },
                            {
                                q: "Do you provide post-project support?",
                                a: "Absolutely! We offer comprehensive post-project support and maintenance packages to ensure your systems run smoothly."
                            }
                        ].map((faq, index) => (
                            <div key={index} className="bg-background p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">{faq.q}</h3>
                                <p className="text-sm text-muted-foreground">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;
