import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Service model
const ServiceSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    priceType: { type: String, enum: ['fixed', 'hourly', 'daily', 'project'], default: 'fixed' },
    estimatedDuration: { type: String, default: '' },
    features: [{ type: String }],
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    specifications: [{ label: { type: String }, value: { type: String } }]
}, { timestamps: true });

const Service = mongoose.model('Service', ServiceSchema);

const services = [
    {
        title: "Technical Drawings (Electrical & Mechanical)",
        description: "Professional technical drawing services for electrical and mechanical systems. We provide accurate, detailed drawings following industry standards including wiring diagrams, circuit schematics, assembly drawings, and component layouts.",
        category: "Technical Drawings",
        price: 15000,
        priceType: "project",
        estimatedDuration: "3-7 days",
        displayOrder: 1,
        features: [
            "Electrical wiring diagrams",
            "Mechanical assembly drawings",
            "2D/3D CAD drawings",
            "Bill of Materials (BOM)",
            "Revision control",
            "Industry standard compliance"
        ],
        specifications: [
            { label: "Software", value: "AutoCAD, SolidWorks, EPLAN" },
            { label: "Formats", value: "DWG, PDF, DXF, STEP" }
        ]
    },
    {
        title: "Mechatronics System Design",
        description: "Complete mechatronics system design services combining mechanical, electrical, and software engineering. From concept to implementation, we design integrated automation systems for industrial applications.",
        category: "Mechatronics System Design",
        price: 50000,
        priceType: "project",
        estimatedDuration: "2-4 weeks",
        displayOrder: 2,
        features: [
            "System architecture design",
            "PLC/HMI programming",
            "Sensor integration",
            "Motion control systems",
            "Control panel design",
            "System simulation"
        ],
        specifications: [
            { label: "Platforms", value: "Siemens, Allen Bradley, Mitsubishi" },
            { label: "Deliverables", value: "Design docs, Source code, Test reports" }
        ]
    },
    {
        title: "CNC Machine Kaizen",
        description: "Continuous improvement services for CNC machines to enhance productivity, reduce cycle time, and improve quality. We analyze existing processes and implement optimizations for better efficiency.",
        category: "CNC Machine Kaizen",
        price: 25000,
        priceType: "project",
        estimatedDuration: "1-2 weeks",
        displayOrder: 3,
        features: [
            "Process analysis",
            "Cycle time reduction",
            "Tool path optimization",
            "Fixture improvements",
            "Quality enhancement",
            "OEE improvement"
        ],
        specifications: [
            { label: "Machine Types", value: "VMC, HMC, Lathe, EDM" },
            { label: "Expected ROI", value: "15-30% productivity gain" }
        ]
    },
    {
        title: "Panel Designing",
        description: "Complete electrical panel design services including control panels, MCC panels, PLC panels, and distribution panels. We ensure compliance with safety standards and optimal component layout.",
        category: "Panel Designing",
        price: 20000,
        priceType: "project",
        estimatedDuration: "5-10 days",
        displayOrder: 4,
        features: [
            "Panel layout design",
            "Component selection",
            "Wiring schematics",
            "Heat load calculation",
            "Safety compliance",
            "3D visualization"
        ],
        specifications: [
            { label: "Standards", value: "IEC, IS, UL compliant" },
            { label: "Software", value: "EPLAN, AutoCAD Electrical" }
        ]
    },
    {
        title: "Concept Preparation",
        description: "Transform your ideas into detailed concepts with our concept preparation services. We help visualize and document your product or system concepts with feasibility analysis and preliminary designs.",
        category: "Concept Preparation",
        price: 12000,
        priceType: "project",
        estimatedDuration: "3-5 days",
        displayOrder: 5,
        features: [
            "Idea visualization",
            "Feasibility study",
            "Preliminary designs",
            "Cost estimation",
            "Risk analysis",
            "Proof of concept"
        ],
        specifications: [
            { label: "Deliverables", value: "Concept document, Sketches, Estimates" },
            { label: "Scope", value: "Industrial & Automation projects" }
        ]
    },
    {
        title: "Technical Presentation Preparation",
        description: "Professional technical presentation services for product launches, client meetings, and training sessions. We create impactful presentations with clear technical content and visualizations.",
        category: "Technical Presentation",
        price: 8000,
        priceType: "project",
        estimatedDuration: "2-3 days",
        displayOrder: 6,
        features: [
            "Content structuring",
            "Technical diagrams",
            "3D visualizations",
            "Animation/Videos",
            "Infographics",
            "Presentation coaching"
        ],
        specifications: [
            { label: "Formats", value: "PowerPoint, PDF, Video" },
            { label: "Languages", value: "English, Hindi" }
        ]
    },
    {
        title: "Project Management",
        description: "End-to-end project management services for industrial and automation projects. We ensure timely delivery, quality control, and effective resource management throughout the project lifecycle.",
        category: "Project Management",
        price: 3000,
        priceType: "daily",
        estimatedDuration: "As per project",
        displayOrder: 7,
        features: [
            "Project planning",
            "Resource allocation",
            "Timeline management",
            "Vendor coordination",
            "Quality control",
            "Progress reporting"
        ],
        specifications: [
            { label: "Methodology", value: "Agile, Waterfall" },
            { label: "Tools", value: "MS Project, Jira, Trello" }
        ]
    }
];

const seedServices = async () => {
    try {
        const mongoUrl = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/ecommerce1";
        await mongoose.connect(mongoUrl);
        console.log('Connected to MongoDB');

        // Check if services already exist
        const existingCount = await Service.countDocuments();
        if (existingCount > 0) {
            console.log(`${existingCount} services already exist. Skipping seed.`);
            console.log('To re-seed, delete existing services first.');
            process.exit(0);
        }

        // Insert services
        const result = await Service.insertMany(services);
        console.log(`Successfully seeded ${result.length} services:`);
        result.forEach(s => console.log(`  - ${s.title} (₹${s.price}/${s.priceType})`));

        process.exit(0);
    } catch (error) {
        console.error('Error seeding services:', error);
        process.exit(1);
    }
};

seedServices();
