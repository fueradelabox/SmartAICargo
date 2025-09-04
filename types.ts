

export interface CargoOffer {
  id: string;
  origin: string;
  destination: string;
  cargoType: string;
  weightKg: number;
  volumeM3: number;
  pickupDate: string;
  deliveryDate: string;
  status: 'Pending' | 'Matched' | 'In Transit' | 'Delivered' | 'Consolidating'; // Added 'Consolidating'
  shipperId: string; // Know who created the offer
}

export interface Vehicle {
  id: string;
  type: 'Truck (LTL)' | 'Truck (FTL)' | 'Van' | 'Refrigerated Truck';
  capacityKg: number;
  capacityM3: number;
  currentLocation: string;
  availability: 'Available' | 'On Trip' | 'Maintenance';
  driverName?: string;
  carrierId?: string; // Know which carrier owns the vehicle
}

export interface OptimizedRoute {
  id: string;
  origin: string;
  destination: string;
  distanceKm: number;
  estimatedTimeHours: number;
  fuelConsumptionLiters: number;
  tollCosts: number;
  waypoints: string[];
  summary?: string; 
}

export interface Shipment {
  id: string;
  cargoId: string;
  vehicleId: string;
  currentLocation: string;
  status: 'In Transit' | 'Delayed' | 'Delivered' | 'Issue Reported';
  estimatedDelivery: string;
  realTimeData?: ShipmentRealTimeData;
}

export interface ShipmentRealTimeData {
  latitude: number;
  longitude: number;
  speedKmh: number;
  temperatureCelsius?: number; // For refrigerated cargo
  humidityPercent?: number; // For sensitive cargo
  doorOpen: boolean;
  vibrationLevel?: 'Low' | 'Medium' | 'High';
}

export interface EmissionData {
  tripId: string;
  co2eKg: number;
  date: string;
}

// Updated UserProfile
export interface UserPreferences {
  language: 'es' | 'en';
  notifications: {
    email: boolean;
    inApp: boolean;
    sms: boolean;
  };
  theme: 'dark' | 'light' | 'system';
}

export interface UserProfile { // This type is primarily used by CollaborationPage for displaying and managing users
  id: string; // Typically username or a UUID
  name: string;
  email: string;
  role: 'Shipper' | 'Carrier' | 'Admin';
  companyName: string;
  rating: number; // 1-5 stars
  completedTrips: number;
  status: 'Active' | 'Inactive' | 'PendingApproval';
  certifications?: string[]; // IDs or names of certifications
  preferences: UserPreferences;
  avatarUrl?: string; // Optional: for profile picture
  carrierProfileDetails?: CarrierProfileDetails; // Made optional for general UserProfile
}

export interface PlatformSettings {
    platformName: string;
    platformVersion: string;
    adminContactEmail: string;
    lastMaintenanceDate: string;
    privacyPolicyLink: string;
    termsOfServiceLink: string;
    mainCurrency: 'USD' | 'CLP' | 'EUR';
    weightUnit: 'kg' | 'lb';
    volumeUnit: 'm3' | 'ft3';
}


export enum AlertSeverity {
    INFO = "Info",
    WARNING = "Warning",
    CRITICAL = "Critical",
}

export interface Alert {
    id: string;
    timestamp: string;
    message: string;
    severity: AlertSeverity;
    relatedShipmentId?: string;
    isRead?: boolean;
    recipientId?: string; // To target notifications to a user
}

export interface GeminiRouteSuggestion {
  route_name?: string;
  summary_description: string;
  estimated_distance_km?: string;
  estimated_duration_hours?: string;
  estimated_fuel_liters?: string;
  estimated_savings_fuel_percent?: number;
  estimated_time_reduction_hours?: number;
  key_considerations: string[];
  potential_risks_on_route?: string[];
  alternative_route_brief_summary?: string;
}

export interface GeminiRiskAnalysis {
  risk_level: 'Low' | 'Medium' | 'High';
  potential_risks: string[];
  mitigation_suggestions: string[];
}

// Types for Intelligent Cargo Consolidation
interface AIAnalysisResult {
  is_good_candidate: boolean;
  reasoning: string;
  suggestion_description: string;
  potential_benefit: string;
}

interface BaseSuggestion {
  id: string; // Should be unique, e.g., crypto.randomUUID()
  status: 'SUGGESTED' | 'EVALUATING' | 'ACTIONED' | 'DISMISSED';
  aiAnalysis: AIAnalysisResult;
}

export interface LtlConsolidationSuggestion extends BaseSuggestion {
  type: 'LTL_CONSOLIDATION';
  involvedOfferIds: string[];
  combinedWeightKg?: number; // Optional: if calculated
  combinedVolumeM3?: number; // Optional: if calculated
}

export interface FtlBackhaulSuggestion extends BaseSuggestion {
  type: 'FTL_BACKHAUL';
  vehicleId: string;
  offerId: string;
}

export type ConsolidationSuggestion = LtlConsolidationSuggestion | FtlBackhaulSuggestion;

// Expected JSON structure from Gemini for LTL consolidation
export interface GeminiLtlConsolidationResponse {
  is_good_candidate: boolean;
  reasoning: string;
  suggestion_description: string; // e.g., "Consolidar CGO001 y CGO004 para ruta Santiago a Valparaíso."
  potential_benefit: string; // e.g., "Ahorro de costos del 15% y optimización de espacio."
}

// Expected JSON structure from Gemini for FTL backhaul
export interface GeminiFtlBackhaulResponse {
  is_good_candidate: boolean;
  reasoning: string;
  suggestion_description: string; // e.g., "Asignar CGO005 como backhaul para VEH004 desde Valparaíso."
  potential_benefit: string; // e.g., "Reducción de viajes en vacío y aumento de utilización."
}

// Expected JSON structure from Gemini for Forward Haul
export interface GeminiForwardHaulResponse {
  is_compatible_for_forward_haul: boolean;
  reasoning: string; 
  pickup_feasibility_notes?: string;
  delivery_alignment_notes?: string; 
}


// New type for Alert AI Analysis
export interface AlertAIAnalysis {
  impact: string;
  suggested_actions: string[];
}

// New types for Sustainability AI Analysis
export interface CarbonFootprintAIAnalysis {
  trends_observed: string;
  optimization_impact_summary: string;
  reduction_strategies: string[];
}

export interface EcoRoutesAIAnalysis {
  sustainability_impact_summary: string;
  operational_efficiency_summary: string;
}

export interface BackhaulAIAnalysis {
  co2e_saved_summary: string;
  empty_km_reduced_summary: string;
  overall_sustainability_contribution: string;
}

// Types for Other Sustainability Initiatives
export interface OtherInitiativeAIAnalysis {
  impact_summary: string;
  challenges: string[];
  next_steps_suggestions: string[];
}

export interface OtherSustainabilityInitiative {
  id: string;
  title: string;
  description: string;
  dataForAI: { [key: string]: string | number };
  aiAnalysis?: OtherInitiativeAIAnalysis | null;
  isLoadingAI?: boolean;
  errorAI?: string | null;
}

// Types for ESG Reports and Certifications
export interface EsgReport {
  id: string;
  title: string;
  type: 'ESG Annual Report' | 'Carbon Disclosure Report' | 'Water Usage Report' | 'Diversity & Inclusion Report';
  year: number;
  publicationDate: string;
  summaryDescription: string;
  documentLink?: string; // Mock URL
  aiAnalysis?: EsgReportAIAnalysis | null;
  isLoadingAI?: boolean;
  errorAI?: string | null;
}

export interface Certification {
  id: string;
  name: string;
  issuingBody: string;
  issueDate: string;
  expiryDate?: string; // Optional for lifetime certs
  status: 'Active' | 'Expired' | 'Pending AI Validation' | 'AI Validated' | 'AI Validation Failed';
  verificationDetailsLink?: string; // Mock blockchain explorer link or details page
  aiValidation?: CertificationAIValidation | null;
  isLoadingAI?: boolean;
  errorAI?: string | null;
}

export interface EsgReportAIAnalysis {
  key_achievements: string[];
  areas_for_improvement: string[];
  overall_esg_rating_impression: 'Strong' | 'Moderate' | 'Needs Improvement' | 'N/A';
}

export interface CertificationAIValidation {
  is_seemingly_valid_based_on_description: boolean;
  validation_summary: string;
  key_compliance_indicators_met: string[];
}

// Detailed Carrier Information
export interface FleetVehicle {
  id: string; // For list key, e.g., crypto.randomUUID()
  vehicleType: 'Camión LTL' | 'Camión FTL' | 'Furgoneta' | 'Camión Refrigerado' | 'Otro';
  quantity: number;
  capacityKg?: number;
  capacityM3?: number;
  specialFeatures: string[]; // e.g., ["GPS", "Rampa Hidráulica"]
}

export interface CarrierProfileDetails {
  fleet: FleetVehicle[];
  serviceAreas: string; // Text area for comma-separated regions or descriptive text
  serviceTypesOffered: string[]; // e.g., ["Carga General", "Carga Refrigerada"]
  insurancePolicyNumber?: string; // Simulated
  operatingPermitIDs?: string; // Simulated, comma-separated IDs
}

// This is the structure used for MOCK_USERS and also for the user creation form in CollaborationPage
export interface MockUserCredentials {
  username: string;
  password?: string; // Password is for creation/initial mock data, not stored/displayed otherwise
  name: string; 
  role: 'Shipper' | 'Carrier' | 'Admin';
  companyName?: string; 
  certifications?: string[]; 
  carrierProfileDetails?: CarrierProfileDetails;
  id?: string; // Optional, can be same as username for mock users
  email?: string; // Can be derived or part of mock data
  status?: UserProfile['status']; // For managing user status via admin
  preferences?: UserPreferences; // For managing user preferences via admin
}

// Blockchain Event Log for TRL5
export interface BlockchainEvent {
  id: string; // crypto.randomUUID()
  timestamp: string; // ISO string
  eventType: string; // e.g., "CARGO_ASSIGNED", "SHIPMENT_DELIVERED", "ALERT_TRIGGERED", "USER_CREATED"
  details: Record<string, any>; // Flexible for event-specific data, e.g., { cargoId: 'CGO001', vehicleId: 'VEH001' }
  relatedEntityId?: string; // e.g., Shipment ID, CargoOffer ID, User ID
  actorId?: string; // User ID or system component that triggered the event
}

// --- TRL-7 Additions ---
export interface AuthContextType {
  currentUser: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: MockUserCredentials) => Promise<void>;
  logout: () => void;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface LoginResponse {
    token: string;
    user: UserProfile;
}

// Using 'Alert' type for notifications for simplicity
export type Notification = Alert;