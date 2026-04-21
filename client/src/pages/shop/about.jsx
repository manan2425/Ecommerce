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
    Clock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const AboutUs = () => {
    const stats = [
        { value: "1992", label: "Established Since" },
        { value: "30+", label: "Years Experience" },
        { value: "500+", label: "Projects Completed" },
        { value: "10+", label: "Years Training" }
    ];

    const values = [
        {
            icon: Target,
            title: "Exceed Expectations",
            description: "Exceed the expectations of clients and customers with quality service."
        },
        {
            icon: Zap,
            title: "Add Value",
            description: "Deliver projects and services that add value and are sustainable."
        },
        {
            icon: Users,
            title: "Social Investment",
            description: "Reinvest profits for social outcomes like providing training to students."
        },
        {
            icon: Award,
            title: "Quality & Safety",
            description: "Ensure the highest standards of quality and safety across all operational work streams."
        }
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

    const softwares = [
        "Codesys", "TIA Portal", "GXworks", "GT Designer", 
        "AutoCAD Electrical", "AutoCAD Mechanical", "Automation Builder"
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

            {/* Our Story */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-start">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                            <div className="space-y-4 text-muted-foreground">
                                <p>
                                    We are situated at <strong>Vithal Udyognagar, Anand District, Gujarat</strong> which 
                                    is 80 km away from Ahmedabad Airport with better industrial infrastructure. We have 
                                    manufacturing plant of Gearing Components as well as complete Gear Boxes of 
                                    <strong> Helical, Bevel-Helical, Planetary Types</strong> as per customer requirements.
                                </p>
                                <p>
                                    From <strong>2015</strong>, we started maintenance activity, supply electrical & electronics 
                                    goods to industry on right time with proper installation guides, also providing 
                                    Educational and Industrial training to Engineers as well as automation & maintenance 
                                    services to industries.
                                </p>
                                <p>
                                    Mechatron Solutions has a strong sense of identity and has defined its goals and 
                                    aspirations in simple and clear terms. Our vision, mission and values inform the 
                                    way we work on a day-to-day basis and continue to shape our corporate identity and ethos.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-muted rounded-2xl p-6">
                                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    Our Team
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                    Our team has been working in this field for more than <strong>1 decade</strong>. 
                                    With our vast experience and continuous efforts of our trained and competent personnel, 
                                    we are in position to climb the step of success in Industrial automation, Maintenance 
                                    & Development field. Our higher level staff is highly educated with long experience 
                                    in designing standard as well as special-purpose automation systems & projects.
                                </p>
                            </div>
                            <div className="bg-muted rounded-2xl p-6">
                                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <Factory className="h-5 w-5 text-primary" />
                                    Our Facility
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                    We have complete setup to develop automation systems, Machine retrofitting at our own 
                                    Plant for testing & trialing developed electromechanical systems. We also have proper 
                                    incubation center facility for our R&D projects with various types of machines and 
                                    well-skilled manpower.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="section-spacing relative bg-slate-50/50">
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
                                <Card key={index} className="hover-lift border-0 bg-white shadow-premium overflow-hidden group rounded-[2rem]">
                                    <CardContent className="p-8 flex flex-col items-center text-center">
                                        <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:scale-110 group-hover:rotate-3 shadow-inner">
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

            {/* Detailed Services */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-12">What We Offer</h2>
                        <div className="space-y-6">
                            <div className="p-6 bg-muted/50 rounded-lg">
                                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                    <Wifi className="h-5 w-5 text-primary" />
                                    Automation & IoT Solutions
                                </h3>
                                <p className="text-muted-foreground">
                                    Industrial systems that can continuously monitor machine health. Automation systems 
                                    to automate the processes in industries for improved efficiency and productivity.
                                </p>
                            </div>
                            <div className="p-6 bg-muted/50 rounded-lg">
                                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                    <Cpu className="h-5 w-5 text-primary" />
                                    CNC Repairing & Service
                                </h3>
                                <p className="text-muted-foreground">
                                    Dedicated experienced team available for onsite troubleshooting, startup and equipment 
                                    relocation. Machine tool maintenance for CNC & conventional machines.
                                </p>
                            </div>
                            <div className="p-6 bg-muted/50 rounded-lg">
                                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                    <Settings className="h-5 w-5 text-primary" />
                                    CNC Engineering
                                </h3>
                                <p className="text-muted-foreground">
                                    Re-configure, interconnect, backup or re-program your CNC. Repairing of electrical 
                                    as well as electronics components (Drives, VFD, PLC, Peripherals for Industrial Automation).
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Software & Tools */}
            <section className="py-16 bg-muted/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold mb-4">Tools & Technologies</h2>
                        <p className="text-muted-foreground">
                            We use industry-leading automation & designing software for developing productive systems
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3">
                        {softwares.map((software, index) => (
                            <span 
                                key={index} 
                                className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium"
                            >
                                {software}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-12">Our Mission</h2>
                        <div className="space-y-4">
                            {[
                                "Exceed the expectations of clients and customers",
                                "Deliver projects and services that add value and are sustainable",
                                "Reinvest profits for social outcomes like providing training to students",
                                "Take a positive commercial approach to ensure long term sustainability for the company and customers",
                                "Ensure the highest standards of quality and safety are achieved across all operational work streams",
                                "Communicate openly, listen to, respect and value customers"
                            ].map((item, index) => (
                                <div key={index} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Values */}
            <section className="section-spacing bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Our Core Values</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
                            Principles that guide our daily operations and define the Mechatron identity.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => {
                            const Icon = value.icon;
                            return (
                                <Card key={index} className="hover-lift border-0 bg-slate-50 shadow-sm overflow-hidden group rounded-[2.5rem]">
                                    <CardContent className="p-10 flex flex-col items-center text-center">
                                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-8 shadow-premium group-hover:bg-primary group-hover:text-white transition-all duration-700">
                                            <Icon className="h-10 w-10 transition-transform duration-700 group-hover:scale-110" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-4 group-hover:text-primary transition-colors">{value.title}</h3>
                                        <p className="text-sm text-slate-500 leading-relaxed font-medium">{value.description}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-primary text-primary-foreground">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                        Ready to Transform Your Business?
                    </h2>
                    <p className="mb-8 opacity-90 max-w-xl mx-auto">
                        Let's discuss how we can help you achieve your goals with our engineering expertise 
                        and decades of experience in industrial automation.
                    </p>
                    <a 
                        href="/shop/contact" 
                        className="inline-flex items-center justify-center px-8 py-3 bg-background text-foreground rounded-lg font-medium hover:bg-background/90 transition-colors"
                    >
                        Contact Us Today
                    </a>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;
