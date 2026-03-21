// Seed script for Industrial Automation Categories and Products
// Run with: node seed-categories-products.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Category Schema
const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    icon: { type: String, default: "" },
    image: { type: String, default: "" },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

CategorySchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    }
    next();
});

const Category = mongoose.model("Category", CategorySchema);

// Product Schema (simplified for seeding)
const ProductSchema = new mongoose.Schema({
    image: String,
    title: { type: String, required: true },
    description: String,
    descriptionPdf: { type: String, default: "" },
    category: String,
    brand: String,
    price: { type: Number, default: 0 },
    salePrice: { type: Number, default: 0 },
    totalStock: { type: Number, default: 100 },
    redThreshold: { type: Number, default: 5 },
    yellowThreshold: { type: Number, default: 20 },
    customFields: [{ label: String, value: String }],
    options: [{ name: String, values: [String] }],
    variants: [mongoose.Schema.Types.Mixed],
    parts: [mongoose.Schema.Types.Mixed],
    isService: { type: Boolean, default: false }
}, { timestamps: true });

const Product = mongoose.model("Product", ProductSchema);

// Industrial Automation Categories with Products
const categoriesWithProducts = [
    {
        category: {
            name: "Sensors & Transducers",
            description: "Industrial sensors for temperature, pressure, flow, level, and process measurement",
            icon: "📡"
        },
        products: [
            // Temperature Sensors
            { title: "RTD Pt100 Temperature Sensor", description: "High accuracy platinum resistance temperature detector for industrial applications", brand: "endresshauser" },
            { title: "K-Type Thermocouple", description: "General purpose thermocouple for wide temperature range measurement", brand: "wika" },
            { title: "J-Type Thermocouple", description: "Iron-constantan thermocouple for reducing atmospheres", brand: "wika" },
            { title: "Temperature Transmitter 4-20mA", description: "Head-mounted temperature transmitter with HART protocol", brand: "endresshauser" },
            // Pressure
            { title: "Pressure Transmitter - Gauge", description: "Industrial gauge pressure transmitter with stainless steel diaphragm", brand: "wika" },
            { title: "Differential Pressure Transmitter", description: "DP transmitter for flow and level measurement", brand: "endresshauser" },
            { title: "Absolute Pressure Transmitter", description: "Absolute pressure measurement for vacuum applications", brand: "wika" },
            // Flow
            { title: "Electromagnetic Flow Meter", description: "Magflow meter for conductive liquids", brand: "endresshauser" },
            { title: "Ultrasonic Flow Meter - Clamp-on", description: "Non-invasive ultrasonic flow measurement", brand: "sick" },
            { title: "Vortex Flow Meter", description: "Vortex shedding flow meter for steam and gas", brand: "yokogawa" },
            { title: "Turbine Flow Meter", description: "High accuracy turbine meter for clean liquids", brand: "endresshauser" },
            // Level
            { title: "Ultrasonic Level Sensor", description: "Non-contact ultrasonic level measurement", brand: "sick" },
            { title: "Radar Level Transmitter", description: "FMCW radar for accurate level measurement", brand: "endresshauser" },
            { title: "Capacitive Level Sensor", description: "Point level detection for solids and liquids", brand: "turck" },
            { title: "Float Level Switch", description: "Magnetic float switch for tank level control", brand: "wika" },
            // Humidity & Gas
            { title: "Humidity & Temperature Transmitter", description: "Combined humidity and temperature measurement", brand: "endresshauser" },
            { title: "Dew Point Sensor", description: "Precision dew point measurement for compressed air", brand: "wika" },
            { title: "CH4 Methane Gas Detector", description: "Fixed gas detector for methane monitoring", brand: "honeywell" },
            { title: "H2S Gas Detector", description: "Hydrogen sulfide detection for safety applications", brand: "honeywell" },
            { title: "CO Carbon Monoxide Detector", description: "Industrial CO monitoring system", brand: "honeywell" },
            { title: "O2 Oxygen Analyzer", description: "Oxygen concentration measurement", brand: "yokogawa" },
            // pH & Conductivity
            { title: "pH Sensor with Transmitter", description: "Industrial pH measurement system", brand: "endresshauser" },
            { title: "Conductivity Sensor", description: "Inductive conductivity measurement", brand: "endresshauser" },
            { title: "ORP Sensor", description: "Oxidation-reduction potential measurement", brand: "endresshauser" },
            // Proximity & Photoelectric
            { title: "Inductive Proximity Sensor", description: "Metal detection proximity sensor", brand: "turck" },
            { title: "Capacitive Proximity Sensor", description: "Non-metal detection sensor", brand: "turck" },
            { title: "Photoelectric Sensor - Diffuse", description: "Background suppression photoelectric sensor", brand: "sick" },
            { title: "Photoelectric Sensor - Through-beam", description: "Long range through-beam sensor pair", brand: "sick" },
            { title: "Photoelectric Sensor - Retro-reflective", description: "Polarized retro-reflective sensor", brand: "banner-engineering" },
            // Encoders & Position
            { title: "Incremental Encoder 1000 PPR", description: "Shaft mounted incremental rotary encoder", brand: "sick" },
            { title: "Absolute Encoder - Single Turn", description: "SSI/BiSS absolute position encoder", brand: "sick" },
            { title: "Absolute Encoder - Multi Turn", description: "Multi-turn absolute encoder with battery backup", brand: "turck" },
            { title: "LVDT Position Sensor", description: "Linear variable differential transformer", brand: "turck" },
            // Load & Vibration
            { title: "Load Cell - Strain Gauge", description: "Industrial strain gauge load cell", brand: "wika" },
            { title: "Weighing Transmitter", description: "Load cell signal conditioner and transmitter", brand: "wika" },
            { title: "Vibration Sensor - Accelerometer", description: "Industrial vibration monitoring sensor", brand: "sick" },
            { title: "RPM Speed Sensor", description: "Magnetic pickup speed sensor", brand: "turck" }
        ]
    },
    {
        category: {
            name: "Industrial Controllers",
            description: "PLCs, PID controllers, temperature controllers, and logic relays",
            icon: "🖥️"
        },
        products: [
            { title: "PLC - Compact Controller", description: "Compact PLC with integrated I/O for small applications", brand: "siemens" },
            { title: "PLC - Modular Controller", description: "Modular PLC system with expandable I/O", brand: "siemens" },
            { title: "PLC - Micro Controller", description: "Cost-effective micro PLC for simple automation", brand: "siemens" },
            { title: "PLC - Safety Controller", description: "SIL3 rated safety PLC for critical applications", brand: "siemens" },
            { title: "PLC - Rack Mount System", description: "High performance rack-based PLC system", brand: "rockwell-automation" },
            { title: "PID Controller - Single Loop", description: "Single loop PID temperature/process controller", brand: "honeywell" },
            { title: "PID Controller - Dual Loop", description: "Dual loop controller for cascade control", brand: "honeywell" },
            { title: "PID Controller - Multi Loop", description: "Multi-channel process controller", brand: "yokogawa" },
            { title: "Temperature Controller - Basic", description: "ON/OFF temperature controller with display", brand: "omron" },
            { title: "Temperature Controller - Advanced", description: "Auto-tuning PID temperature controller", brand: "omron" },
            { title: "Temperature Controller - Programmable", description: "Ramp/soak temperature controller", brand: "honeywell" },
            { title: "Logic Relay - 8 I/O", description: "Compact logic relay for simple control", brand: "siemens" },
            { title: "Logic Relay - 16 I/O", description: "Expandable logic relay module", brand: "siemens" },
            { title: "Mini PLC with Display", description: "All-in-one mini PLC with built-in HMI", brand: "mitsubishi-electric" }
        ]
    },
    {
        category: {
            name: "HMI & SCADA Systems",
            description: "Human Machine Interfaces, Industrial PCs, SCADA software and data logging systems",
            icon: "📺"
        },
        products: [
            { title: "HMI Panel - 7 inch Basic", description: "7-inch basic HMI panel with touch screen", brand: "siemens" },
            { title: "HMI Panel - 10 inch Comfort", description: "10-inch comfort panel with advanced features", brand: "siemens" },
            { title: "HMI Panel - 15 inch Unified", description: "15-inch unified comfort panel", brand: "siemens" },
            { title: "HMI Panel - 22 inch Industrial", description: "22-inch wide screen industrial HMI", brand: "siemens" },
            { title: "Industrial PC - Panel Mount", description: "Panel mount industrial PC with fanless design", brand: "siemens" },
            { title: "Industrial PC - Box Type", description: "Rugged box PC for harsh environments", brand: "beckhoff" },
            { title: "Operator Workstation", description: "Complete operator workstation with dual monitors", brand: "honeywell" },
            { title: "SCADA Software - WinCC", description: "Siemens WinCC SCADA software license", brand: "siemens" },
            { title: "SCADA Software - iFix", description: "GE iFix SCADA platform", brand: "emerson" },
            { title: "SCADA Software - Wonderware", description: "AVEVA Wonderware InTouch license", brand: "schneider-electric" },
            { title: "Data Logger - 6 Channel", description: "6-channel paperless recorder", brand: "yokogawa" },
            { title: "Data Logger - 12 Channel", description: "12-channel data logger with USB", brand: "yokogawa" },
            { title: "Circular Chart Recorder", description: "Traditional circular chart recorder", brand: "honeywell" },
            { title: "IIoT Gateway - Edge Controller", description: "Industrial IoT edge gateway with MQTT", brand: "siemens" },
            { title: "IIoT Gateway - Protocol Converter", description: "Multi-protocol IIoT gateway", brand: "phoenix-contact" }
        ]
    },
    {
        category: {
            name: "Motors & Drives",
            description: "VFDs, soft starters, servo systems, stepper motors and DC drives",
            icon: "⚡"
        },
        products: [
            { title: "VFD - 0.75kW / 1HP", description: "Compact variable frequency drive for small motors", brand: "siemens" },
            { title: "VFD - 2.2kW / 3HP", description: "General purpose AC drive", brand: "siemens" },
            { title: "VFD - 5.5kW / 7.5HP", description: "Industrial VFD with advanced features", brand: "abb" },
            { title: "VFD - 11kW / 15HP", description: "Heavy duty variable frequency drive", brand: "abb" },
            { title: "VFD - 22kW / 30HP", description: "High power VFD with vector control", brand: "siemens" },
            { title: "VFD - 45kW / 60HP", description: "Large capacity industrial drive", brand: "abb" },
            { title: "VFD - 75kW / 100HP", description: "High power process drive", brand: "schneider-electric" },
            { title: "Soft Starter - 15kW", description: "Soft starter for smooth motor starting", brand: "abb" },
            { title: "Soft Starter - 30kW", description: "Medium power soft starter", brand: "siemens" },
            { title: "Soft Starter - 55kW", description: "Heavy duty soft starter with bypass", brand: "schneider-electric" },
            { title: "Servo Motor - 400W", description: "AC servo motor with high torque", brand: "mitsubishi-electric" },
            { title: "Servo Motor - 750W", description: "Medium power servo motor", brand: "siemens" },
            { title: "Servo Motor - 1.5kW", description: "High performance servo motor", brand: "mitsubishi-electric" },
            { title: "Servo Drive - Single Axis", description: "Single axis servo drive controller", brand: "siemens" },
            { title: "Servo Drive - Multi Axis", description: "Multi-axis servo controller", brand: "mitsubishi-electric" },
            { title: "Stepper Motor - NEMA 17", description: "NEMA 17 stepper motor for precision motion", brand: "omron" },
            { title: "Stepper Motor - NEMA 23", description: "NEMA 23 high torque stepper", brand: "omron" },
            { title: "Stepper Motor - NEMA 34", description: "NEMA 34 heavy duty stepper motor", brand: "delta-electronics" },
            { title: "Stepper Drive Controller", description: "Microstepping stepper drive", brand: "delta-electronics" },
            { title: "DC Drive - 5HP", description: "DC motor speed controller", brand: "abb" },
            { title: "DC Drive - 10HP", description: "Regenerative DC drive", brand: "siemens" },
            { title: "Gearbox Mounted Drive Package", description: "Integrated gearmotor with VFD", brand: "sew-eurodrive" }
        ]
    },
    {
        category: {
            name: "Actuators",
            description: "Pneumatic cylinders, electric actuators, solenoid valves and control valves",
            icon: "🔧"
        },
        products: [
            { title: "Pneumatic Cylinder - 32mm Bore", description: "ISO standard pneumatic cylinder", brand: "festo" },
            { title: "Pneumatic Cylinder - 50mm Bore", description: "Medium bore air cylinder", brand: "festo" },
            { title: "Pneumatic Cylinder - 80mm Bore", description: "Large bore pneumatic actuator", brand: "festo" },
            { title: "Pneumatic Cylinder - Compact", description: "Compact short stroke cylinder", brand: "festo" },
            { title: "Pneumatic Cylinder - Guided", description: "Twin rod guided cylinder", brand: "festo" },
            { title: "Pneumatic Rotary Actuator - 90°", description: "Rack and pinion rotary actuator", brand: "festo" },
            { title: "Pneumatic Rotary Actuator - 180°", description: "Double acting rotary actuator", brand: "festo" },
            { title: "Electric Linear Actuator - 100mm", description: "Electric linear actuator 100mm stroke", brand: "festo" },
            { title: "Electric Linear Actuator - 300mm", description: "Servo driven linear actuator", brand: "festo" },
            { title: "Electric Linear Actuator - 500mm", description: "Long stroke electric actuator", brand: "parker-hannifin" },
            { title: "Solenoid Valve 2/2 Way", description: "2-way 2-position solenoid valve", brand: "festo" },
            { title: "Solenoid Valve 3/2 Way", description: "3-way 2-position directional valve", brand: "festo" },
            { title: "Solenoid Valve 5/2 Way", description: "5-way 2-position double solenoid", brand: "festo" },
            { title: "Solenoid Valve 5/3 Way", description: "5-way 3-position center closed", brand: "festo" },
            { title: "Motorized Ball Valve - 2 inch", description: "Electric actuated ball valve", brand: "siemens" },
            { title: "Motorized Butterfly Valve - 4 inch", description: "Electric butterfly valve actuator", brand: "siemens" },
            { title: "Pneumatic Control Valve - Globe", description: "Pneumatic globe control valve with positioner", brand: "emerson" },
            { title: "Pneumatic Control Valve - Butterfly", description: "Butterfly valve with pneumatic actuator", brand: "emerson" }
        ]
    },
    {
        category: {
            name: "Industrial Networking",
            description: "Industrial Ethernet switches, protocol converters, remote I/O and wireless solutions",
            icon: "🌐"
        },
        products: [
            { title: "Industrial Switch - 5 Port Unmanaged", description: "5-port unmanaged industrial Ethernet switch", brand: "phoenix-contact" },
            { title: "Industrial Switch - 8 Port Unmanaged", description: "8-port gigabit industrial switch", brand: "phoenix-contact" },
            { title: "Industrial Switch - 8 Port Managed", description: "Managed Ethernet switch with PROFINET", brand: "siemens" },
            { title: "Industrial Switch - 16 Port Managed", description: "Layer 2 managed industrial switch", brand: "siemens" },
            { title: "Industrial Switch - PoE", description: "PoE industrial Ethernet switch", brand: "phoenix-contact" },
            { title: "Protocol Converter - Modbus to Profinet", description: "Modbus RTU/TCP to PROFINET gateway", brand: "phoenix-contact" },
            { title: "Protocol Converter - Modbus to Ethernet/IP", description: "Modbus to EtherNet/IP converter", brand: "turck" },
            { title: "Protocol Converter - Serial to Ethernet", description: "RS-232/485 to Ethernet converter", brand: "wago" },
            { title: "Remote I/O Module - 16 DI", description: "16 channel digital input module", brand: "turck" },
            { title: "Remote I/O Module - 16 DO", description: "16 channel digital output module", brand: "turck" },
            { title: "Remote I/O Module - 8 AI", description: "8 channel analog input module", brand: "turck" },
            { title: "Remote I/O Module - 4 AO", description: "4 channel analog output module", brand: "turck" },
            { title: "Wireless Access Point - Industrial", description: "Industrial wireless AP with WLAN", brand: "siemens" },
            { title: "Wireless I/O Gateway", description: "Wireless sensor network gateway", brand: "phoenix-contact" },
            { title: "Fiber Media Converter - MM", description: "Multimode fiber optic converter", brand: "phoenix-contact" },
            { title: "Fiber Media Converter - SM", description: "Single mode fiber converter", brand: "siemens" },
            { title: "IIoT Edge Device - MQTT", description: "MQTT broker edge computing device", brand: "siemens" },
            { title: "OPC UA Server Gateway", description: "OPC UA communication gateway", brand: "siemens" }
        ]
    },
    {
        category: {
            name: "Control Panel Components",
            description: "Power supplies, contactors, circuit breakers, relays, terminals and panel accessories",
            icon: "🔌"
        },
        products: [
            { title: "SMPS Power Supply - 24V 5A", description: "24V DC 5A switched mode power supply", brand: "phoenix-contact" },
            { title: "SMPS Power Supply - 24V 10A", description: "24V DC 10A industrial power supply", brand: "phoenix-contact" },
            { title: "SMPS Power Supply - 24V 20A", description: "24V DC 20A high capacity SMPS", brand: "siemens" },
            { title: "SMPS Power Supply - 48V 10A", description: "48V DC power supply", brand: "phoenix-contact" },
            { title: "Contactor - 9A AC3", description: "9A AC3 rated contactor", brand: "schneider-electric" },
            { title: "Contactor - 18A AC3", description: "18A industrial contactor", brand: "schneider-electric" },
            { title: "Contactor - 32A AC3", description: "32A power contactor", brand: "siemens" },
            { title: "Contactor - 65A AC3", description: "65A heavy duty contactor", brand: "siemens" },
            { title: "Overload Relay - 1-1.6A", description: "Thermal overload relay", brand: "schneider-electric" },
            { title: "Overload Relay - 4-6A", description: "Motor protection relay", brand: "schneider-electric" },
            { title: "Overload Relay - 9-13A", description: "Adjustable overload relay", brand: "siemens" },
            { title: "MCB - 6A C Curve", description: "Miniature circuit breaker 6A", brand: "schneider-electric" },
            { title: "MCB - 16A C Curve", description: "MCB 16A single pole", brand: "schneider-electric" },
            { title: "MCB - 32A C Curve", description: "MCB 32A industrial", brand: "siemens" },
            { title: "MCCB - 100A", description: "Molded case circuit breaker 100A", brand: "schneider-electric" },
            { title: "MCCB - 250A", description: "MCCB with adjustable settings", brand: "siemens" },
            { title: "Control Relay - 4 C/O", description: "4 changeover control relay", brand: "phoenix-contact" },
            { title: "Timer Relay - On Delay", description: "On-delay timer relay", brand: "siemens" },
            { title: "Timer Relay - Off Delay", description: "Off-delay timer relay", brand: "siemens" },
            { title: "Timer Relay - Star-Delta", description: "Star-delta timer", brand: "schneider-electric" },
            { title: "Terminal Block - 2.5mm²", description: "Screw terminal block 2.5mm²", brand: "phoenix-contact" },
            { title: "Terminal Block - 4mm²", description: "Feed-through terminal 4mm²", brand: "phoenix-contact" },
            { title: "Terminal Block - 10mm²", description: "Power terminal block 10mm²", brand: "wago" },
            { title: "Surge Protection Device - Type 2", description: "SPD Type 2 for panel protection", brand: "phoenix-contact" },
            { title: "Control Transformer - 250VA", description: "Single phase control transformer", brand: "siemens" },
            { title: "Push Button - Green Start", description: "22mm green start push button", brand: "schneider-electric" },
            { title: "Push Button - Red Stop", description: "22mm red stop push button", brand: "schneider-electric" },
            { title: "Selector Switch - 2 Position", description: "2-position selector switch", brand: "schneider-electric" },
            { title: "Indicator Light - LED", description: "22mm LED indicator lamp", brand: "schneider-electric" },
            { title: "DIN Rail - 1 Meter", description: "Standard 35mm DIN rail", brand: "phoenix-contact" },
            { title: "Cable Gland - M20", description: "Nickel plated cable gland M20", brand: "weidmller" }
        ]
    },
    {
        category: {
            name: "Safety Components",
            description: "Safety relays, safety PLCs, emergency stops, light curtains and interlock switches",
            icon: "🛡️"
        },
        products: [
            { title: "Safety Relay - 2 Channel", description: "Dual channel safety relay for E-stop", brand: "siemens" },
            { title: "Safety Relay - Configurable", description: "Configurable safety relay module", brand: "siemens" },
            { title: "Safety Relay - Light Curtain", description: "Safety relay for light curtain", brand: "sick" },
            { title: "Safety PLC - Compact", description: "Compact safety PLC controller", brand: "siemens" },
            { title: "Safety PLC - Modular", description: "Modular safety controller system", brand: "rockwell-automation" },
            { title: "Emergency Stop Button - 40mm", description: "40mm mushroom head E-stop", brand: "schneider-electric" },
            { title: "Emergency Stop Button - Illuminated", description: "Illuminated emergency stop with LED", brand: "siemens" },
            { title: "Emergency Stop - Rope Pull", description: "Rope pull emergency stop switch", brand: "sick" },
            { title: "Light Curtain - Type 2", description: "Type 2 safety light curtain", brand: "sick" },
            { title: "Light Curtain - Type 4", description: "Type 4 finger protection light curtain", brand: "sick" },
            { title: "Light Curtain - Muting", description: "Light curtain with muting function", brand: "banner-engineering" },
            { title: "Safety Mat - 500x500mm", description: "Pressure sensitive safety mat", brand: "sick" },
            { title: "Safety Mat - 1000x1000mm", description: "Large area safety mat system", brand: "sick" },
            { title: "Two Hand Control Unit", description: "Two hand safety control device", brand: "siemens" },
            { title: "Interlock Switch - Mechanical", description: "Mechanical door interlock switch", brand: "sick" },
            { title: "Interlock Switch - Magnetic", description: "Magnetic safety interlock", brand: "sick" },
            { title: "Interlock Switch - RFID", description: "RFID coded safety switch", brand: "sick" },
            { title: "Safety Scanner - Laser", description: "Safety laser scanner for area monitoring", brand: "sick" }
        ]
    },
    {
        category: {
            name: "Pneumatics & Hydraulics",
            description: "FRL units, pneumatic fittings, hydraulic power packs, cylinders and valves",
            icon: "💨"
        },
        products: [
            // Pneumatics
            { title: "FRL Unit - 1/4 inch", description: "Filter-Regulator-Lubricator combo", brand: "festo" },
            { title: "FRL Unit - 1/2 inch", description: "Air preparation unit with gauge", brand: "festo" },
            { title: "Air Filter - 1/4 inch", description: "Compressed air filter", brand: "festo" },
            { title: "Pressure Regulator - 1/4 inch", description: "Air pressure regulator with gauge", brand: "festo" },
            { title: "Lubricator - 1/4 inch", description: "Airline lubricator", brand: "festo" },
            { title: "Pneumatic Tubing - 6mm", description: "Polyurethane tubing 6mm OD", brand: "festo" },
            { title: "Pneumatic Tubing - 8mm", description: "PU tubing 8mm OD", brand: "festo" },
            { title: "Pneumatic Tubing - 10mm", description: "Polyurethane tube 10mm", brand: "festo" },
            { title: "Push-in Fitting - Straight", description: "Push-in straight connector", brand: "festo" },
            { title: "Push-in Fitting - Elbow", description: "90° elbow push-in fitting", brand: "festo" },
            { title: "Push-in Fitting - Tee", description: "Tee connector push-in", brand: "festo" },
            { title: "Quick Exhaust Valve", description: "Quick exhaust for fast cylinder return", brand: "festo" },
            { title: "Flow Control Valve", description: "One-way flow control valve", brand: "festo" },
            // Hydraulics
            { title: "Hydraulic Power Pack - 3HP", description: "3HP hydraulic power unit", brand: "parker-hannifin" },
            { title: "Hydraulic Power Pack - 5HP", description: "5HP hydraulic power pack", brand: "parker-hannifin" },
            { title: "Hydraulic Power Pack - 10HP", description: "10HP industrial hydraulic unit", brand: "bosch-rexroth" },
            { title: "Hydraulic Cylinder - 50mm Bore", description: "Double acting hydraulic cylinder", brand: "parker-hannifin" },
            { title: "Hydraulic Cylinder - 80mm Bore", description: "Heavy duty hydraulic cylinder", brand: "bosch-rexroth" },
            { title: "Directional Control Valve - 4/3", description: "4-way 3-position directional valve", brand: "bosch-rexroth" },
            { title: "Hydraulic Flow Control Valve", description: "Adjustable flow control valve", brand: "parker-hannifin" },
            { title: "Pressure Relief Valve", description: "Hydraulic pressure relief valve", brand: "bosch-rexroth" },
            { title: "Hydraulic Filter", description: "Return line hydraulic filter", brand: "parker-hannifin" }
        ]
    },
    {
        category: {
            name: "Measurement & Calibration",
            description: "Calibrators, multimeters, clamp meters, thermal imagers and test equipment",
            icon: "📏"
        },
        products: [
            { title: "Pressure Calibrator - Handheld", description: "Portable pressure calibrator with pump", brand: "wika" },
            { title: "Temperature Calibrator - Dry Block", description: "Dry block temperature calibrator", brand: "wika" },
            { title: "Multifunction Calibrator", description: "Multifunction process calibrator", brand: "wika" },
            { title: "Loop Calibrator", description: "4-20mA loop calibrator", brand: "wika" },
            { title: "Digital Multimeter - Industrial", description: "True RMS industrial multimeter", brand: "emerson" },
            { title: "Digital Multimeter - HVAC", description: "HVAC technician multimeter", brand: "emerson" },
            { title: "Clamp Meter - AC/DC", description: "AC/DC clamp meter 1000A", brand: "emerson" },
            { title: "Clamp Meter - Leakage Current", description: "Leakage current clamp meter", brand: "emerson" },
            { title: "Thermal Imager - Entry Level", description: "160x120 thermal imaging camera", brand: "emerson" },
            { title: "Thermal Imager - Professional", description: "320x240 professional thermal camera", brand: "emerson" },
            { title: "Digital Oscilloscope - 100MHz", description: "2-channel 100MHz digital scope", brand: "keyence" },
            { title: "Digital Oscilloscope - 200MHz", description: "4-channel 200MHz oscilloscope", brand: "keyence" },
            { title: "Pressure Gauge - 0-10 bar", description: "Analog pressure gauge", brand: "wika" },
            { title: "Pressure Gauge - 0-25 bar", description: "Industrial pressure gauge", brand: "wika" },
            { title: "Pressure Gauge - Digital", description: "Digital pressure gauge with display", brand: "wika" },
            { title: "RTD Simulator", description: "RTD/Thermocouple simulator", brand: "wika" }
        ]
    },
    {
        category: {
            name: "Automation Software",
            description: "PLC programming, SCADA configuration, HMI tools, MES and factory simulation",
            icon: "💻"
        },
        products: [
            { title: "TIA Portal - Basic License", description: "Siemens TIA Portal Basic license", brand: "siemens" },
            { title: "TIA Portal - Professional", description: "TIA Portal Professional license", brand: "siemens" },
            { title: "Studio 5000 - Standard", description: "Rockwell Studio 5000 Standard", brand: "rockwell-automation" },
            { title: "Studio 5000 - Professional", description: "Studio 5000 Full license", brand: "rockwell-automation" },
            { title: "GX Works3 - Standard", description: "Mitsubishi GX Works3 license", brand: "mitsubishi-electric" },
            { title: "WinCC SCADA - Runtime", description: "WinCC SCADA runtime license", brand: "siemens" },
            { title: "WinCC SCADA - Engineering", description: "WinCC engineering license", brand: "siemens" },
            { title: "FactoryTalk View SE", description: "Rockwell FactoryTalk View", brand: "rockwell-automation" },
            { title: "GT Designer3", description: "GOT HMI configuration software", brand: "mitsubishi-electric" },
            { title: "WinCC Unified", description: "Unified Comfort Panel software", brand: "siemens" },
            { title: "MES System - Basic", description: "Manufacturing Execution System", brand: "siemens" },
            { title: "Historian Database - 500 Tags", description: "Process historian 500 tag license", brand: "honeywell" },
            { title: "Historian Database - 2000 Tags", description: "Industrial historian 2000 tags", brand: "honeywell" },
            { title: "Digital Twin - Factory Simulation", description: "Factory digital twin software", brand: "siemens" },
            { title: "Plant Simulation", description: "Tecnomatix Plant Simulation", brand: "siemens" }
        ]
    },
    {
        category: {
            name: "Electrical Components",
            description: "LT panels, control cables, high power contactors, capacitor banks and harmonic filters",
            icon: "⚡"
        },
        products: [
            { title: "PCC Panel - 100A", description: "Power Control Center 100A", brand: "siemens" },
            { title: "PCC Panel - 250A", description: "Power Control Center 250A", brand: "schneider-electric" },
            { title: "MCC Panel - Draw Out Type", description: "Motor Control Center draw-out", brand: "siemens" },
            { title: "MCC Panel - Fixed Type", description: "Fixed type MCC panel", brand: "schneider-electric" },
            { title: "Control Cable - 1.5mm² 4C", description: "4-core 1.5mm² control cable", brand: "lt-electrical-automation" },
            { title: "Control Cable - 2.5mm² 4C", description: "4-core 2.5mm² control wire", brand: "lt-electrical-automation" },
            { title: "Shielded Signal Cable - 2C", description: "2-core shielded instrument cable", brand: "lt-electrical-automation" },
            { title: "Shielded Signal Cable - 4C", description: "4-core shielded signal cable", brand: "lt-electrical-automation" },
            { title: "Thermocouple Extension Wire", description: "K-type thermocouple extension", brand: "lt-electrical-automation" },
            { title: "High Power Contactor - 150A", description: "150A power contactor", brand: "siemens" },
            { title: "High Power Contactor - 250A", description: "250A heavy duty contactor", brand: "schneider-electric" },
            { title: "High Power Contactor - 400A", description: "400A industrial contactor", brand: "siemens" },
            { title: "Capacitor Bank - 50 kVAR", description: "Power factor correction 50kVAR", brand: "schneider-electric" },
            { title: "Capacitor Bank - 100 kVAR", description: "APFC panel 100kVAR", brand: "schneider-electric" },
            { title: "Capacitor Bank - Auto APFC", description: "Automatic PF correction panel", brand: "siemens" },
            { title: "Harmonic Filter - Passive", description: "Passive harmonic filter 5th/7th", brand: "schneider-electric" },
            { title: "Harmonic Filter - Active", description: "Active harmonic filter", brand: "siemens" },
            { title: "Busbar - Copper 100A", description: "Copper busbar 100A rated", brand: "siemens" },
            { title: "Busbar - Copper 250A", description: "Copper busbar 250A rated", brand: "siemens" },
            { title: "Busduct - 400A", description: "400A aluminum busduct", brand: "schneider-electric" },
            { title: "ACB - 800A", description: "Air circuit breaker 800A", brand: "siemens" },
            { title: "ACB - 1600A", description: "Air circuit breaker 1600A", brand: "schneider-electric" }
        ]
    }
];

async function seedData() {
    const mongoUrl = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/ecommerce1";
    
    try {
        await mongoose.connect(mongoUrl);
        console.log('Connected to MongoDB');

        // Clear existing categories (optional - comment out if you want to keep existing)
        // await Category.deleteMany({});
        // await Product.deleteMany({});
        // console.log('Cleared existing data');

        let totalProducts = 0;
        let totalCategories = 0;

        for (const item of categoriesWithProducts) {
            // Check if category exists
            let category = await Category.findOne({ name: item.category.name });
            
            if (!category) {
                category = new Category(item.category);
                await category.save();
                console.log(`✅ Created category: ${category.name}`);
                totalCategories++;
            } else {
                console.log(`⏭️ Category exists: ${category.name}`);
            }

            // Add products for this category
            for (const prod of item.products) {
                const existingProduct = await Product.findOne({ title: prod.title });
                
                if (!existingProduct) {
                    const product = new Product({
                        ...prod,
                        category: category.slug,
                        image: "", // Add images later
                        price: Math.floor(Math.random() * 50000) + 1000, // Random price 1000-51000
                        totalStock: Math.floor(Math.random() * 100) + 10 // Random stock 10-110
                    });
                    await product.save();
                    totalProducts++;
                }
            }
            console.log(`   Added products for ${category.name}`);
        }

        console.log('\n========================================');
        console.log(`✅ Seeding complete!`);
        console.log(`   Categories created: ${totalCategories}`);
        console.log(`   Products created: ${totalProducts}`);
        console.log('========================================\n');

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

seedData();
