import { 
    Award, 
    Users, 
    Target, 
    Zap, 
    CheckCircle,
    Building2,
    Cpu,
    Settings,
    Wrench,
    Cog,
    Monitor,
    Wifi,
    GraduationCap,
    Factory,
    Clock,
    BookOpen,
    ShieldCheck,
    Lightbulb,
    Trophy,
    Boxes,
    HardHat,
    Microscope,
    Bot
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const AboutUs = () => {
    const stats = [
        { value: "1992", label: "Established Since" },
        { value: "30+", label: "Years Experience" },
        { value: "500+", label: "Projects Completed" },
        { value: "10+", label: "Years Training" }
    ];

    const missionPoints = [
        "Students Are The Most Valuable ‘Asset’ Of Our Nation.",
        "Mechatron Solutions Is Committed To- Be a leader in Education & training system.",
        "Promote importance of real field work place with free from accident and injuries.",
        "Inculcate good knowledge with values & discipline through interactive teaching.",
        "Offer avenues for professional skill enhancement to create environment of harmony and joy when they will in industries.",
        "Provide most advance education and training to all engineers including new entrants- to enrich their knowledge, competence & skills to ensure that they embrace technological changes, stay updated with latest technologies and techniques for self development."
    ];

    const objectives = [
        "Upgrade working knowledge and practical skill.",
        "Develop working competency & multi skilling capability.",
        "Inculcate work discipline and good moral values.",
        "Increases engineer’s confidence.",
        "Create ownership and responsibility by enhancing technician knowledge.",
        "Generate skills which are not technical but those are immense fully use for presenting the technical knowledge in front of industrial leaders or field experts in professional way like presentation skill.",
        "Upgrade step by step levels of skill (Operational & Maintenance) of Personnel’s.",
        "Develop capabilities to Operate & Maintain Equipment.",
        "To understand relations between Equipment & Quality.",
        "To create a team of Professionals to meet challenges in the Technological, Economical and Modernization of Management Development."
    ];

    const services = [
        { icon: Wifi, title: "Automation & IoT", desc: "Industrial monitoring solutions" },
        { icon: Cpu, title: "CNC Repairing", desc: "Dedicated troubleshooting team" },
        { icon: Settings, title: "CNC Engineering", desc: "Re-configure & re-program" },
        { icon: Wrench, title: "Machine Maintenance", desc: "CNC & conventional machines" },
        { icon: Cog, title: "Gear Manufacturing", desc: "Helical, Bevel, Planetary" },
        { icon: Factory, title: "Retrofitting", desc: "Machine upgrades & retrofit" },
        { icon: GraduationCap, title: "Training", desc: "Educational & Industrial" },
        { icon: Monitor, title: "Automation Projects", desc: "Complete system development" }
    ];

    const detailedServices = [
        "Electronics & Electrical components like PLC, HMI, Resistor, Capacitor, Relays, contractors, Transistors, Ic supply with technical support & application development.",
        "Expertise in developing temperature control process, introduce automation in manually operated system.",
        "All kind of sensor interfacing with controller or PLCs.",
        "Industrial Automation project.",
        "Technical training on various field like Electrical, Electronics, Mechatronics, Mechanical etc."
    ];

    const robots = [
        "Rococo", "Rob war", "Line Follower Robot", "Automatic Storage Systems", 
        "Weight Lifting Crain", "Pneumatic Systems", "Hydraulics Systems", 
        "Programmable Logic Control", "Factory Automation", "Micro-controller Training With Practical"
    ];

    return (
        <div className="min-h-screen bg-mesh">
            {/* Cinematic Mini-Hero */}
            <section className="relative overflow-hidden pt-32 pb-20">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-24 pointer-events-none animate-pulse"></div>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-6">
                            Established 1992
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight tracking-tight mb-8">
                            Engineering the <br />
                            <span className="text-gradient-primary">Mechatron Legacy</span>
                        </h1>
                        <p className="text-xl text-slate-600 leading-relaxed max-w-2xl">
                            Since 1992, Mechatron Solutions has defined excellence in industrial automation and CNC engineering. We provide the heartbeat for modern manufacturing.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-white border-y border-slate-100 shadow-sm relative z-20">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-left group">
                                <div className="text-4xl md:text-5xl font-black text-slate-900 mb-2 group-hover:text-primary transition-colors duration-500 tracking-tighter">{stat.value}</div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Mechatron Solutions */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-start">
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-4xl font-black text-slate-900 mb-6">Who We Are</h2>
                                <p className="text-lg text-slate-600 leading-relaxed">
                                    Mechatron Solutions is a service provider company in the area of custom Automation project, Instrumentation Project, since 2013. We are situated at <strong>Vithal Udyognagar, Anand District, Gujarat</strong>, 80 km from Ahmedabad Airport, with superior industrial infrastructure.
                                </p>
                            </div>
                            <div className="space-y-6">
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-3">
                                        <Zap className="text-primary h-6 w-6" />
                                        First in India
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        We provide Online guidance in your project with technical training as well as hardware support (where to buy & how to use). And it is <strong>Free of Cost</strong>, which is first time in India.
                                    </p>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-3">
                                        <Monitor className="text-primary h-6 w-6" />
                                        Digital Resources
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        Mechatron Solutions has an Online Technical Block covering various technical topics (SOP, OPL) on this site.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/5 rounded-[3rem] -rotate-3"></div>
                            <div className="relative bg-white p-8 rounded-[3rem] border border-slate-100 shadow-premium">
                                <h3 className="text-2xl font-black text-slate-900 mb-8">Our Core Offerings</h3>
                                <div className="space-y-6">
                                    {detailedServices.map((service, index) => (
                                        <div key={index} className="flex gap-4">
                                            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                                <CheckCircle className="text-primary h-4 w-4" />
                                            </div>
                                            <p className="text-slate-600 text-sm font-medium leading-relaxed">{service}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary rounded-full blur-[150px] -mr-48 -mt-24"></div>
                </div>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Our Mission</h2>
                            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                                Committed to being a leader in the education and training system while promoting safety and professional excellence.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            {missionPoints.map((point, index) => (
                                <div key={index} className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-colors group">
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-primary/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Target className="text-primary h-5 w-5" />
                                        </div>
                                        <p className="text-slate-300 text-sm leading-relaxed font-medium">{point}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Objectives Section */}
            <section className="py-24 bg-mesh">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">Our Objectives</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
                            The objectives of Mechatron Solutions is to impart quality training to Engineers and trainees with a focus on practical excellence.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {objectives.map((obj, index) => (
                            <Card key={index} className="border-0 shadow-premium bg-white/80 backdrop-blur-sm rounded-[2rem] hover-lift">
                                <CardContent className="p-8">
                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                                        <ShieldCheck className="text-primary h-6 w-6" />
                                    </div>
                                    <p className="text-slate-700 font-bold leading-relaxed">{obj}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Basic Principle & Aim */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-6">
                                The Core Philosophy
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 tracking-tight">Basic Principle</h2>
                            <p className="text-xl text-slate-600 leading-relaxed mb-8">
                                Education and training are organized for the improvement of individual capabilities to contribute to the company's business and help individuals achieve their job goals.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: "Trainee Technicians", sub: "(I.T.I.)" },
                                    { label: "Engineers", sub: "(Diploma)" },
                                    { label: "Engineers", sub: "(Degree)" },
                                    { label: "On The Job Training", sub: "Industry Demand" }
                                ].map((item, index) => (
                                    <div key={index} className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                        <div className="text-primary font-black text-lg mb-1">{item.label}</div>
                                        <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">{item.sub}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-8">
                                    <Lightbulb className="text-white h-8 w-8" />
                                </div>
                                <h3 className="text-3xl font-black mb-6">Aim of Education & Training</h3>
                                <p className="text-slate-300 text-lg leading-relaxed mb-8">
                                    "Classroom training and practical training in the field to make them skillful with equipment operation and maintenance, meeting the long-term perspective of life goals."
                                </p>
                                <div className="flex items-center gap-4 p-6 bg-white/5 rounded-3xl border border-white/10">
                                    <HardHat className="text-primary h-8 w-8" />
                                    <div className="text-sm font-medium text-slate-200">
                                        Focusing on real-world industrial applications and safety protocols.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Industrial & Collage Robotics */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">Industrial & College Level Robotics</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
                            We provide industrial training to students and technical persons at our training center and conduct workshops in colleges.
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6">
                        {robots.map((robot, index) => (
                            <div 
                                key={index} 
                                className="px-8 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-3 hover:border-primary transition-colors group"
                            >
                                <Bot className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                                <span className="font-bold text-slate-700 text-sm">{robot}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Core Expertise Grid */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Our Core Expertise</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
                            Dedicated to improving industrial productivity with world-class technical support and engineering innovation.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {services.map((service, index) => {
                            const Icon = service.icon;
                            return (
                                <Card key={index} className="hover-lift border-0 bg-slate-50 shadow-sm overflow-hidden group rounded-[2.5rem]">
                                    <CardContent className="p-8 flex flex-col items-center text-center">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:scale-110 group-hover:rotate-3 shadow-sm">
                                            <Icon className="h-8 w-8 transition-transform duration-500" />
                                        </div>
                                        <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-primary transition-colors">{service.title}</h3>
                                        <p className="text-sm text-slate-500 leading-relaxed font-medium">{service.desc}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-[100px] -ml-48 -mt-48"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-[100px] -mr-48 -mb-48"></div>
                </div>
                <div className="container mx-auto px-6 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">
                        Ready to Transform Your Business?
                    </h2>
                    <p className="mb-10 text-white/80 text-xl max-w-2xl mx-auto font-medium">
                        Let's discuss how we can help you achieve your goals with our engineering expertise 
                        and decades of experience in industrial automation.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a 
                            href="/shop/contact" 
                            className="inline-flex items-center justify-center px-10 py-4 bg-white text-primary rounded-full font-black text-lg hover:bg-slate-50 transition-all shadow-xl hover:scale-105"
                        >
                            Contact Us Today
                        </a>
                        <a 
                            href="/shop/listing" 
                            className="inline-flex items-center justify-center px-10 py-4 bg-primary-foreground/10 text-white border border-white/20 rounded-full font-black text-lg hover:bg-white/10 transition-all"
                        >
                            Browse Components
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;
