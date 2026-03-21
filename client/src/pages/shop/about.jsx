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
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            About <span className="text-primary">Mechatron Solutions</span>
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Since 1992, Mechatron Solutions is one of the leading hardware & electromechanical 
                            component provider for CNC maintenance, Automation Projects, AMC, and Retrofitting 
                            of machines for all Industrial applications.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-primary text-primary-foreground">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
                                <div className="text-sm md:text-base opacity-90">{stat.label}</div>
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
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Our Services</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            "Dedicated to improving customer productivity, by providing the best support"
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {services.map((service, index) => {
                            const Icon = service.icon;
                            return (
                                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="font-semibold text-sm mb-1">{service.title}</h3>
                                        <p className="text-xs text-muted-foreground">{service.desc}</p>
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
            <section className="py-20 bg-muted/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            These principles guide everything we do and define who we are as a company.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value, index) => {
                            const Icon = value.icon;
                            return (
                                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Icon className="h-8 w-8 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                                        <p className="text-sm text-muted-foreground">{value.description}</p>
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
