import React, { useState, useCallback, useEffect } from 'react';
import { LeafIcon, ZapIcon, PackageIconPhosphor, RouteIcon, CheckCircleIcon, BookOpenIcon } from '../components/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { geminiService } from '../services/geminiService';
import { apiService } from '../services/apiService';
import { DEFAULT_ERROR_MESSAGE, INDUSTRY_BENCHMARKS, PLATFORM_AVERAGES } from '../constants';
import { 
    CarbonFootprintAIAnalysis, 
    EcoRoutesAIAnalysis, 
    BackhaulAIAnalysis,
    OtherSustainabilityInitiative,
    OtherInitiativeAIAnalysis,
    EsgReport,
    Certification,
    EsgReportAIAnalysis,
    CertificationAIValidation
} from '../types';


const initialOtherInitiativesData: OtherSustainabilityInitiative[] = [
  {
    id: 'low_emission_vehicles',
    title: 'Vehículos de Bajas Emisiones en Red',
    description: 'Colaboración con transportistas que usan 25+ vehículos eléctricos y 40+ híbridos. Se priorizan en asignaciones cuando es factible.',
    dataForAI: { electricVehicles: 25, hybridVehicles: 40, priorityAssignment: 'factible' },
    aiAnalysis: null, isLoadingAI: false, errorAI: null,
  },
  {
    id: 'reverse_logistics_packaging',
    title: 'Logística Inversa y Optimización de Embalajes',
    description: 'Programas piloto para recolección y reciclaje de embalajes y fomento de uso de materiales sostenibles.',
    dataForAI: { programStatus: 'piloto activo', focusAreas: 'recolección, reciclaje, materiales sostenibles en embalajes' },
    aiAnalysis: null, isLoadingAI: false, errorAI: null,
  },
];

const mockEsgReportsData: EsgReport[] = [
    {
        id: 'ESG2023', title: 'Reporte Anual de Sostenibilidad 2023', type: 'ESG Annual Report', year: 2023, publicationDate: '2024-03-15',
        summaryDescription: 'Informe integral sobre el desempeño ambiental, social y de gobernanza de la empresa durante el año 2023, destacando avances en reducción de emisiones y programas comunitarios.',
        documentLink: 'simulated-esg-report-2023.html', aiAnalysis: null, isLoadingAI: false, errorAI: null,
    },
    {
        id: 'CDP2023', title: 'Reporte de Divulgación de Carbono (CDP) 2023', type: 'Carbon Disclosure Report', year: 2023, publicationDate: '2024-05-20',
        summaryDescription: 'Detalla las emisiones de GEI de Alcance 1, 2 y 3, así como las estrategias de mitigación y adaptación al cambio climático.',
        documentLink: 'simulated-cdp-report-2023.html', aiAnalysis: null, isLoadingAI: false, errorAI: null,
    }
];

const mockCertificationsData: Certification[] = [
    {
        id: 'ISO14001', name: 'ISO 14001:2015 - Sistema de Gestión Ambiental', issuingBody: 'SGS Global', issueDate: '2023-01-20', expiryDate: '2026-01-19',
        status: 'Active', verificationDetailsLink: '#', aiValidation: null, isLoadingAI: false, errorAI: null,
    },
    {
        id: 'BCORP', name: 'Certificación B Corporation', issuingBody: 'B Lab', issueDate: '2022-11-01', expiryDate: '2025-10-31',
        status: 'Pending AI Validation', aiValidation: null, isLoadingAI: false, errorAI: null,
    }
];


// Simplified data simulation for a general platform view
const getGenericSustainabilityData = () => {
  return {
    totalTrips: 250, 
    ecoOptimizedTrips: 180,
    fuelSavedByEcoRoutesPercent: 12,
    backhaulsFacilitated: 75,
    avgEmptyLegKmPerBackhaul: 280,
    co2ePerKmStandardKg: 0.65,
    monthlyEmissions: [ 
      { month: 'Ene', actualCo2eKg: 5500, baselineCo2eKg: 6000 },
      { month: 'Feb', actualCo2eKg: 5200, baselineCo2eKg: 5800 },
      { month: 'Mar', actualCo2eKg: 5800, baselineCo2eKg: 6200 },
      { month: 'Abr', actualCo2eKg: 5600, baselineCo2eKg: 6100 },
      { month: 'May', actualCo2eKg: 5300, baselineCo2eKg: 5900 },
      { month: 'Jun', actualCo2eKg: 5000, baselineCo2eKg: 5500 },
    ],
    platform_co2PerKm_kg: PLATFORM_AVERAGES.CARRIER.co2PerKm_kg, 
    platform_emptyRunPercentage: PLATFORM_AVERAGES.CARRIER.emptyRunPercentage,
    platform_averageLoadFactor_percent: PLATFORM_AVERAGES.CARRIER.averageLoadFactor_percent,
    platform_co2PerTonKm_kg: PLATFORM_AVERAGES.SHIPPER.co2PerTonKm_kg, 
    platform_onTimeDelivery_percent: PLATFORM_AVERAGES.SHIPPER.onTimeDelivery_percent,
  };
};


const AnalyticsPage: React.FC = () => {
  const simulatedSustainabilityData = getGenericSustainabilityData();

  const cardBaseStyle = "bg-[#1a1f25] border border-[#40474f] shadow-lg rounded-xl p-4 sm:p-6 text-white";
  const buttonPrimaryStyle = "w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md transition duration-150 disabled:opacity-60 flex items-center justify-center mobile-tap-target";
  const sectionTitleStyle = "text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6"; 
  const subSectionTitleStyle = "text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4"; 
  
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isLoadingCarbonAnalysis, setIsLoadingCarbonAnalysis] = useState(false);
  const [errorCarbonAnalysis, setErrorCarbonAnalysis] = useState<string | null>(null);
  const [carbonFootprintAIAnalysis, setCarbonFootprintAIAnalysis] = useState<CarbonFootprintAIAnalysis | null>(null);

  const [isLoadingEcoRouteImpact, setIsLoadingEcoRouteImpact] = useState(false);
  const [errorEcoRouteImpact, setErrorEcoRouteImpact] = useState<string | null>(null);
  const [ecoRoutesAIImpact, setEcoRoutesAIImpact] = useState<EcoRoutesAIAnalysis | null>(null);

  const [isLoadingBackhaulImpact, setIsLoadingBackhaulImpact] = useState(false);
  const [errorBackhaulImpact, setErrorBackhaulImpact] = useState<string | null>(null);
  const [backhaulAIImpact, setBackhaulAIImpact] = useState<BackhaulAIAnalysis | null>(null);

  const [otherInitiativesList, setOtherInitiativesList] = useState<OtherSustainabilityInitiative[]>([]);
  const [esgReportsList, setEsgReportsList] = useState<EsgReport[]>([]);
  const [certificationsList, setCertificationsList] = useState<Certification[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setIsPageLoading(true);
      const [initiativesRes, reportsRes, certsRes] = await Promise.all([
        apiService.getData<OtherSustainabilityInitiative[]>('otherInitiatives'),
        apiService.getData<EsgReport[]>('esgReports'),
        apiService.getData<Certification[]>('certifications')
      ]);

      if (initiativesRes.success && initiativesRes.data!.length === 0) {
        apiService.initializeData('otherInitiatives', initialOtherInitiativesData);
        const newRes = await apiService.getData<OtherSustainabilityInitiative[]>('otherInitiatives');
        if(newRes.success) setOtherInitiativesList(newRes.data!);
      } else if (initiativesRes.success) {
        setOtherInitiativesList(initiativesRes.data!);
      }

      if (reportsRes.success && reportsRes.data!.length === 0) {
        apiService.initializeData('esgReports', mockEsgReportsData);
        const newRes = await apiService.getData<EsgReport[]>('esgReports');
        if(newRes.success) setEsgReportsList(newRes.data!);
      } else if (reportsRes.success) {
        setEsgReportsList(reportsRes.data!);
      }
      
      if (certsRes.success && certsRes.data!.length === 0) {
        apiService.initializeData('certifications', mockCertificationsData);
        const newRes = await apiService.getData<Certification[]>('certifications');
        if(newRes.success) setCertificationsList(newRes.data!);
      } else if (certsRes.success) {
        setCertificationsList(certsRes.data!);
      }

      setIsPageLoading(false);
    };
    loadData();
  }, []);


  const totalCo2eSavedByOptimizationsKg = React.useMemo(() => {
    return simulatedSustainabilityData.monthlyEmissions.reduce((sum, data) => sum + (data.baselineCo2eKg - data.actualCo2eKg), 0);
  }, [simulatedSustainabilityData.monthlyEmissions]);

  const emptyKmSavedByBackhauls = React.useMemo(() => {
    return simulatedSustainabilityData.backhaulsFacilitated * simulatedSustainabilityData.avgEmptyLegKmPerBackhaul;
  }, [simulatedSustainabilityData]);

  const co2eSavedByBackhaulsKg = React.useMemo(() => {
    return emptyKmSavedByBackhauls * simulatedSustainabilityData.co2ePerKmStandardKg;
  }, [emptyKmSavedByBackhauls, simulatedSustainabilityData.co2ePerKmStandardKg]);


  const fetchCarbonFootprintAnalysis = useCallback(async () => {
    setIsLoadingCarbonAnalysis(true);
    setErrorCarbonAnalysis(null);
    setCarbonFootprintAIAnalysis(null);
    try {
      const emissionsSummary = simulatedSustainabilityData.monthlyEmissions.map(e => `${e.month}: ${e.actualCo2eKg}kg (Base: ${e.baselineCo2eKg}kg)`).join(', ');
      
      const prompt = `Analiza los datos mensuales de emisiones de CO2e (kg) de la plataforma (real vs. base sin optimización): ${emissionsSummary}. Total viajes en el período: ${simulatedSustainabilityData.totalTrips}.
      Impacto total de optimizaciones: ${totalCo2eSavedByOptimizationsKg.toFixed(0)} kg CO2e ahorrados.
      Contexto de benchmarks (plataforma general): CO2/km: ${simulatedSustainabilityData.platform_co2PerKm_kg}kg, CO2/ton-km: ${simulatedSustainabilityData.platform_co2PerTonKm_kg}kg.
      Identifica tendencias clave en las emisiones, comenta sobre el impacto de las optimizaciones (comparado con línea base y benchmarks si aplica), y sugiere 2 estrategias concisas y accionables para reducir aún más la huella de carbono a nivel de plataforma.
      Responde estrictamente en formato JSON con la siguiente estructura: {"trends_observed": "string", "optimization_impact_summary": "string", "reduction_strategies": ["string", "string"]}`;
      
      const result = await geminiService.generateText(prompt, { responseMimeType: "application/json" });
      const parsedData = geminiService.parseJsonFromGeminiResponse<CarbonFootprintAIAnalysis>(result);
      if (parsedData) {
        setCarbonFootprintAIAnalysis(parsedData);
      } else {
        setErrorCarbonAnalysis("Error al procesar la respuesta de la IA para huella de carbono.");
      }
    } catch (err) {
      setErrorCarbonAnalysis(DEFAULT_ERROR_MESSAGE);
    } finally {
      setIsLoadingCarbonAnalysis(false);
    }
  }, [simulatedSustainabilityData, totalCo2eSavedByOptimizationsKg]);

  const fetchEcoRoutesAIAnalysis = useCallback(async () => {
    setIsLoadingEcoRouteImpact(true);
    setErrorEcoRouteImpact(null);
    setEcoRoutesAIImpact(null);
    try {
      const percentageOptimized = Math.round((simulatedSustainabilityData.totalTrips > 0 ? simulatedSustainabilityData.ecoOptimizedTrips / simulatedSustainabilityData.totalTrips : 0) * 100);
      const prompt = `La plataforma ha optimizado el ${percentageOptimized}% de las rutas de ${simulatedSustainabilityData.totalTrips} viajes totales, resultando en un ahorro promedio de ${simulatedSustainabilityData.fuelSavedByEcoRoutesPercent}% de combustible por ruta optimizada.
      Describe brevemente el impacto positivo de estas optimizaciones en la sostenibilidad (ambiental) y en la eficiencia operativa (costos, tiempos) a nivel de plataforma.
      Responde estrictamente en formato JSON con la siguiente estructura: {"sustainability_impact_summary": "string", "operational_efficiency_summary": "string"}`;
      
      const result = await geminiService.generateText(prompt, { responseMimeType: "application/json" });
      const parsedData = geminiService.parseJsonFromGeminiResponse<EcoRoutesAIAnalysis>(result);

      if (parsedData) {
        setEcoRoutesAIImpact(parsedData);
      } else {
        setErrorEcoRouteImpact("Error al procesar la respuesta de la IA para eco-rutas.");
      }
    } catch (err) {
      setErrorEcoRouteImpact(DEFAULT_ERROR_MESSAGE);
    } finally {
      setIsLoadingEcoRouteImpact(false);
    }
  }, [simulatedSustainabilityData]);

  const fetchBackhaulAIAnalysis = useCallback(async () => {
    setIsLoadingBackhaulImpact(true);
    setErrorBackhaulImpact(null);
    setBackhaulAIImpact(null);
    try {
      const prompt = `La plataforma facilitó ${simulatedSustainabilityData.backhaulsFacilitated} viajes de retorno con carga (backhauls), evitando aproximadamente ${emptyKmSavedByBackhauls.toLocaleString()} km en vacío y ahorrando un estimado de ${co2eSavedByBackhaulsKg.toFixed(0)} kg de CO2e.
      Describe el impacto de esta reducción de viajes en vacío en la sostenibilidad general y cómo contribuye a una logística más verde a nivel de plataforma.
      Responde estrictamente en formato JSON con la siguiente estructura: {"co2e_saved_summary": "string", "empty_km_reduced_summary": "string", "overall_sustainability_contribution": "string"}`;
      
      const result = await geminiService.generateText(prompt, { responseMimeType: "application/json" });
      const parsedData = geminiService.parseJsonFromGeminiResponse<BackhaulAIAnalysis>(result);

      if (parsedData) {
        setBackhaulAIImpact(parsedData);
      } else {
        setErrorBackhaulImpact("Error al procesar la respuesta de la IA para backhauls.");
      }
    } catch (err) {
      setErrorBackhaulImpact(DEFAULT_ERROR_MESSAGE);
    } finally {
      setIsLoadingBackhaulImpact(false);
    }
  }, [simulatedSustainabilityData, emptyKmSavedByBackhauls, co2eSavedByBackhaulsKg]);
  
  const fetchOtherInitiativeAIAnalysis = useCallback(async (initiativeId: string) => {
    const initiative = otherInitiativesList.find(i => i.id === initiativeId);
    if (!initiative) return;
    
    setOtherInitiativesList(prev => prev.map(i => i.id === initiativeId ? {...i, isLoadingAI: true, errorAI: null, aiAnalysis: null} : i));

    try {
      let prompt = "";
      if (initiative.id === 'low_emission_vehicles') {
        prompt = `Analiza el impacto de tener ${initiative.dataForAI.electricVehicles} vehículos eléctricos y ${initiative.dataForAI.hybridVehicles} híbridos en nuestra red logística, con priorización de asignación cuando es ${initiative.dataForAI.priorityAssignment}. Considera la reducción de CO2e, la imagen de marca y los desafíos operativos. Sugiere un próximo paso clave para potenciar esta iniciativa. Responde estrictamente en formato JSON: {"impact_summary": "string", "challenges": ["string"], "next_steps_suggestions": ["string"]}`;
      } else if (initiative.id === 'reverse_logistics_packaging') {
        prompt = `Analiza los beneficios y desafíos de nuestros programas piloto en logística inversa y optimización de embalajes (enfocados en ${initiative.dataForAI.focusAreas}), actualmente en estado: ${initiative.dataForAI.programStatus}. Sugiere un próximo paso clave para escalar estas iniciativas efectivamente. Responde estrictamente en formato JSON: {"impact_summary": "string", "challenges": ["string"], "next_steps_suggestions": ["string"]}`;
      } else {
        throw new Error("Unknown initiative for AI analysis.");
      }
      
      const result = await geminiService.generateText(prompt, { responseMimeType: "application/json" });
      const parsedData = geminiService.parseJsonFromGeminiResponse<OtherInitiativeAIAnalysis>(result);

      if (parsedData) {
        const finalList = otherInitiativesList.map(i => i.id === initiativeId ? {...i, aiAnalysis: parsedData, isLoadingAI: false} : i);
        setOtherInitiativesList(finalList);
        await apiService.updateData('otherInitiatives', finalList);
      } else {
        throw new Error("Error al procesar la respuesta de la IA para la iniciativa.");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : DEFAULT_ERROR_MESSAGE;
      const finalList = otherInitiativesList.map(i => i.id === initiativeId ? {...i, errorAI: errorMsg, isLoadingAI: false} : i)
      setOtherInitiativesList(finalList);
      await apiService.updateData('otherInitiatives', finalList);
    }
  }, [otherInitiativesList]);

  const fetchEsgReportAIAnalysis = useCallback(async (reportId: string) => {
    const report = esgReportsList.find(r => r.id === reportId);
    if (!report) return;

    setEsgReportsList(prev => prev.map(r => r.id === reportId ? { ...r, isLoadingAI: true, errorAI: null, aiAnalysis: null } : r));

    try {
      const prompt = `Analiza el siguiente resumen de un reporte ESG: Reporte='${report.title}' del año ${report.year}. Resumen Breve: '${report.summaryDescription}'. 
      Por favor, extrae los principales logros reportados, las áreas clave para mejora continua, y ofrece una impresión general de la fortaleza del compromiso ESG de la entidad basado en este resumen (ej: Fuerte, Moderado, Necesita Mejora).
      Responde estrictamente en formato JSON con la siguiente estructura: {"key_achievements": ["string"], "areas_for_improvement": ["string"], "overall_esg_rating_impression": "Strong" | "Moderate" | "Needs Improvement" | "N/A"}`;
      
      const result = await geminiService.generateText(prompt, { responseMimeType: "application/json" });
      const parsedData = geminiService.parseJsonFromGeminiResponse<EsgReportAIAnalysis>(result);

      if (parsedData) {
        const finalList = esgReportsList.map(r => r.id === reportId ? { ...r, aiAnalysis: parsedData, isLoadingAI: false } : r);
        setEsgReportsList(finalList);
        await apiService.updateData('esgReports', finalList);
      } else {
        throw new Error("Error al procesar la respuesta de la IA para el reporte ESG.");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : DEFAULT_ERROR_MESSAGE;
      const finalList = esgReportsList.map(r => r.id === reportId ? { ...r, errorAI: errorMsg, isLoadingAI: false } : r);
      setEsgReportsList(finalList);
      await apiService.updateData('esgReports', finalList);
    }
  }, [esgReportsList]);

  const fetchCertificationAIValidation = useCallback(async (certificationId: string) => {
    const certification = certificationsList.find(c => c.id === certificationId);
    if (!certification) return;

    setCertificationsList(prev => prev.map(c => c.id === certificationId ? { ...c, isLoadingAI: true, errorAI: null, aiValidation: null, status: 'Pending AI Validation' as const } : c));
    
    try {
      const prompt = `Para la certificación '${certification.name}', emitida por '${certification.issuingBody}', con fecha de emisión ${certification.issueDate} ${certification.expiryDate ? `y expiración ${certification.expiryDate}` : ''}.
      Basado en estándares comunes para este tipo de certificación, ¿parece ser válida esta descripción? Proporciona un breve resumen de validación y lista algunos indicadores clave de cumplimiento que típicamente verificaría esta certificación.
      Responde estrictamente en formato JSON con la siguiente estructura: {"is_seemingly_valid_based_on_description": boolean, "validation_summary": "string", "key_compliance_indicators_met": ["string"]}`;

      const result = await geminiService.generateText(prompt, { responseMimeType: "application/json" });
      const parsedData = geminiService.parseJsonFromGeminiResponse<CertificationAIValidation>(result);

      if (parsedData) {
        const finalList = certificationsList.map(c => c.id === certificationId ? { ...c, aiValidation: parsedData, isLoadingAI: false, status: (parsedData.is_seemingly_valid_based_on_description ? 'AI Validated' : 'AI Validation Failed') as Certification['status'] } : c);
        setCertificationsList(finalList);
        await apiService.updateData('certifications', finalList);
      } else {
        throw new Error("Error al procesar la respuesta de la IA para la validación de certificación.");
      }
    } catch (err) {
       const errorMsg = err instanceof Error ? err.message : DEFAULT_ERROR_MESSAGE;
       const finalList = certificationsList.map(c => c.id === certificationId ? { ...c, errorAI: errorMsg, isLoadingAI: false, status: 'AI Validation Failed' as Certification['status'] } : c);
       setCertificationsList(finalList);
       await apiService.updateData('certifications', finalList);
    }
  }, [certificationsList]);


  const ecoOptimizedPercentage = Math.round((simulatedSustainabilityData.totalTrips > 0 ? simulatedSustainabilityData.ecoOptimizedTrips / simulatedSustainabilityData.totalTrips : 0) * 100);

  const renderAIAnalysisSection = (
    isLoading: boolean, 
    error: string | null, 
    analysisData: any, 
    title: string,
    dataRenderer: () => React.ReactNode
  ) => (
    <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
      <h4 className="text-sm sm:text-base font-semibold text-green-200 mb-1 sm:mb-2">{title}</h4>
      {isLoading && (
        <div className="flex items-center text-xs sm:text-sm text-green-300">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-green-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Analizando...
        </div>
      )}
      {error && <p className="text-red-400 text-xs sm:text-sm bg-red-900/30 p-2 rounded">{error}</p>}
      {analysisData && !isLoading && !error && dataRenderer()}
    </div>
  );
  
const renderPlatformMetric = (label: string, platformValue: number | undefined, unit: string, isIndustry?: boolean, industryValue?: number) => {
    if (platformValue === undefined || platformValue === 0) return null; 
    return (
        <div className="bg-gray-700/30 p-3 rounded-lg">
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-lg font-semibold text-white">{platformValue.toLocaleString()} {unit}</p>
             {isIndustry && industryValue !== undefined && (
                <p className="text-xs text-gray-500 mt-1">Prom. Industria: {industryValue.toLocaleString()}{unit}</p>
             )}
        </div>
    );
};

const handleViewSimulatedDocument = (report: EsgReport) => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
        newWindow.document.write(`
            <html>
                <head>
                    <title>${report.title}</title>
                    <style>
                        body { font-family: 'Inter', "Noto Sans", sans-serif; margin: 0; padding: 0; background-color: #f4f7f9; color: #333; }
                        .container { max-width: 800px; margin: 20px auto; padding: 30px; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                        h1 { color: #1a1f25; border-bottom: 2px solid #3f7fbf; padding-bottom: 10px; margin-bottom: 20px; font-size: 24px;}
                        h2 { color: #2c3035; font-size: 20px; margin-top: 30px; margin-bottom: 10px;}
                        p { line-height: 1.6; margin-bottom: 15px; font-size: 14px; color: #555;}
                        .meta-info { font-size: 12px; color: #777; margin-bottom: 20px; padding-bottom:10px; border-bottom: 1px solid #eee; }
                        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #aaa; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>${report.title}</h1>
                        <div class="meta-info">
                            <p><strong>Tipo:</strong> ${report.type}</p>
                            <p><strong>Año:</strong> ${report.year}</p>
                            <p><strong>Fecha de Publicación:</strong> ${report.publicationDate}</p>
                        </div>
                        
                        <h2>Resumen del Documento</h2>
                        <p>${report.summaryDescription}</p>
                        
                        <h2>Contenido Simulado</h2>
                        <p>Este es un documento simulado generado por la plataforma SmartAICargo. El contenido real de un reporte ESG sería mucho más extenso y detallado.</p>
                        <p><strong>Sección 1: Introducción y Metodología</strong></p>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                        <p><strong>Sección 2: Desempeño Ambiental</strong></p>
                        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Indicadores clave como emisiones de GEI, consumo de agua y gestión de residuos serían detallados aquí.</p>
                        <p><strong>Sección 3: Impacto Social</strong></p>
                        <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Prácticas laborales, diversidad e inclusión, relación con la comunidad, y salud y seguridad ocupacional.</p>
                        <p><strong>Sección 4: Gobernanza</strong></p>
                        <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Estructura de gobierno corporativo, ética empresarial, gestión de riesgos y cumplimiento normativo.</p>
                        
                        <div class="footer">
                            SmartAICargo - Documento Simulado
                        </div>
                    </div>
                </body>
            </html>
        `);
        newWindow.document.close();
    }
};

  if (isPageLoading) {
    return <div className="text-center p-10 text-white">Cargando análisis de sostenibilidad...</div>;
  }

  return (
    <div className="space-y-6 sm:space-y-8 text-[#a2abb3]">
      {/* Sección Huella de Carbono */}
      <section className={cardBaseStyle}>
        <h2 className={`${sectionTitleStyle} flex items-center`}>
          <LeafIcon className="h-6 w-6 sm:h-7 sm:w-7 mr-2 text-green-400" /> Huella de Carbono y Emisiones (Plataforma)
        </h2>
        
        <div className="mb-4 sm:mb-6">
          <h3 className={subSectionTitleStyle}>Evolución Mensual de Emisiones CO2e (Kg) - Plataforma (Simulado)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={simulatedSustainabilityData.monthlyEmissions} margin={{ top: 5, right: 0, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#40474f" />
              <XAxis dataKey="month" stroke="#a2abb3" fontSize="0.75rem" />
              <YAxis stroke="#a2abb3" fontSize="0.75rem" />
              <Tooltip 
                wrapperClassName="!bg-[#1f2328] !border-[#40474f] !text-white !rounded-md" 
                contentStyle={{backgroundColor: '#1f2328', border: '1px solid #40474f', borderRadius: '0.375rem'}} 
                itemStyle={{color: '#a2abb3', fontSize: '0.75rem'}}
                labelStyle={{color: '#fff', fontSize: '0.875rem', fontWeight: 'bold'}}
              />
              <Legend wrapperStyle={{color: '#a2abb3', fontSize: '0.875rem', paddingTop: '10px'}} />
              <Bar dataKey="actualCo2eKg" fill="#10B981" name="Emisiones Reales (Plataforma)" radius={[4, 4, 0, 0]} barSize={15} />
              <Bar dataKey="baselineCo2eKg" fill="#4A5568" name="Emisiones Base (Sin Optimizar, Plataforma)" radius={[4, 4, 0, 0]} barSize={15} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {renderPlatformMetric("CO2e/km (Plataforma, Sim.)", simulatedSustainabilityData.platform_co2PerKm_kg, "kg", true, INDUSTRY_BENCHMARKS.CARRIER.co2PerKm_kg)}
            {renderPlatformMetric("CO2e/Ton-km (Plataforma, Sim.)", simulatedSustainabilityData.platform_co2PerTonKm_kg, "kg", true, INDUSTRY_BENCHMARKS.SHIPPER.co2PerTonKm_kg)}
            {renderPlatformMetric("% Viajes Vacío (Plataforma, Sim.)", simulatedSustainabilityData.platform_emptyRunPercentage, "%", true, INDUSTRY_BENCHMARKS.CARRIER.emptyRunPercentage)}
            {renderPlatformMetric("% Entregas a Tiempo (Plataforma, Sim.)", simulatedSustainabilityData.platform_onTimeDelivery_percent, "%", true, INDUSTRY_BENCHMARKS.SHIPPER.onTimeDelivery_percent)}
        </div>
        <div className="text-center mb-4 sm:mb-6">
            <p className="text-lg sm:text-xl font-semibold text-green-300">
                {totalCo2eSavedByOptimizationsKg.toLocaleString()} kg de CO2e
            </p>
            <p className="text-xs sm:text-sm text-[#a2abb3]">Ahorrados en la plataforma gracias a optimizaciones (simulado, últimos 6 meses)</p>
        </div>

        <button onClick={fetchCarbonFootprintAnalysis} disabled={isLoadingCarbonAnalysis} className={`${buttonPrimaryStyle} w-full`}>
            {isLoadingCarbonAnalysis ? <ZapIcon className="animate-spin h-5 w-5 mr-2" /> : <ZapIcon className="h-5 w-5 mr-2" />}
            {isLoadingCarbonAnalysis ? "Analizando Huella..." : "Analizar Huella de Carbono (Plataforma) con IA"}
        </button>
        {renderAIAnalysisSection(isLoadingCarbonAnalysis, errorCarbonAnalysis, carbonFootprintAIAnalysis, "Análisis IA de Huella de Carbono (Plataforma):", 
            () => carbonFootprintAIAnalysis && (
                <div className="text-xs sm:text-sm space-y-2">
                    <p><strong>Tendencias Observadas:</strong> {carbonFootprintAIAnalysis.trends_observed}</p>
                    <p><strong>Impacto de Optimizaciones:</strong> {carbonFootprintAIAnalysis.optimization_impact_summary}</p>
                    <div><strong>Estrategias de Reducción Sugeridas:</strong>
                        <ul className="list-disc list-inside ml-4 mt-1">
                            {carbonFootprintAIAnalysis.reduction_strategies.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                </div>
            )
        )}
      </section>

      {/* Sección Rutas Eco-Eficientes */}
      <section className={cardBaseStyle}>
        <h2 className={`${sectionTitleStyle} flex items-center`}>
            <RouteIcon className="h-6 w-6 sm:h-7 sm:w-7 mr-2 text-blue-400" /> Impacto de Rutas Eco-Eficientes (Plataforma)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="bg-blue-500/10 p-3 sm:p-4 rounded-xl border border-blue-500/30">
                <p className="text-lg sm:text-xl font-semibold text-blue-300">{ecoOptimizedPercentage}%</p>
                <p className="text-xs sm:text-sm text-[#a2abb3]">De rutas optimizadas en plataforma ({simulatedSustainabilityData.ecoOptimizedTrips}/{simulatedSustainabilityData.totalTrips}) (simulado)</p>
            </div>
            <div className="bg-blue-500/10 p-3 sm:p-4 rounded-xl border border-blue-500/30">
                <p className="text-lg sm:text-xl font-semibold text-blue-300">{simulatedSustainabilityData.fuelSavedByEcoRoutesPercent}%</p>
                <p className="text-xs sm:text-sm text-[#a2abb3]">Ahorro promedio de combustible por rutas eco-optimizadas en plataforma (simulado)</p>
            </div>
        </div>
        <button onClick={fetchEcoRoutesAIAnalysis} disabled={isLoadingEcoRouteImpact} className={`${buttonPrimaryStyle} bg-blue-600 hover:bg-blue-700 w-full`}>
            {isLoadingEcoRouteImpact ? <ZapIcon className="animate-spin h-5 w-5 mr-2" /> : <ZapIcon className="h-5 w-5 mr-2" />}
            {isLoadingEcoRouteImpact ? "Analizando Impacto..." : "Analizar Impacto de Eco-Rutas (Plataforma) con IA"}
        </button>
        {renderAIAnalysisSection(isLoadingEcoRouteImpact, errorEcoRouteImpact, ecoRoutesAIImpact, "Análisis IA de Eco-Rutas (Plataforma):",
            () => ecoRoutesAIImpact && (
                 <div className="text-xs sm:text-sm space-y-2">
                    <p><strong>Impacto en Sostenibilidad:</strong> {ecoRoutesAIImpact.sustainability_impact_summary}</p>
                    <p><strong>Impacto en Eficiencia Operativa:</strong> {ecoRoutesAIImpact.operational_efficiency_summary}</p>
                </div>
            )
        )}
      </section>

      {/* Sección Reducción de Viajes en Vacío (Backhauls) */}
      <section className={cardBaseStyle}>
          <h2 className={`${sectionTitleStyle} flex items-center`}>
              <PackageIconPhosphor className="h-6 w-6 sm:h-7 sm:w-7 mr-2 text-purple-400" /> Reducción de Viajes en Vacío (Backhauls) (Plataforma)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="bg-purple-500/10 p-3 sm:p-4 rounded-xl border border-purple-500/30 text-center">
                  <p className="text-lg sm:text-xl font-semibold text-purple-300">{simulatedSustainabilityData.backhaulsFacilitated}</p>
                  <p className="text-xs sm:text-sm text-[#a2abb3]">Backhauls en plataforma (simulado)</p>
              </div>
              <div className="bg-purple-500/10 p-3 sm:p-4 rounded-xl border border-purple-500/30 text-center">
                  <p className="text-lg sm:text-xl font-semibold text-purple-300">~{emptyKmSavedByBackhauls.toLocaleString()}</p>
                  <p className="text-xs sm:text-sm text-[#a2abb3]">Km en vacío evitados (simulado)</p>
              </div>
              <div className="bg-purple-500/10 p-3 sm:p-4 rounded-xl border border-purple-500/30 text-center">
                  <p className="text-lg sm:text-xl font-semibold text-purple-300">~{co2eSavedByBackhaulsKg.toLocaleString()}</p>
                  <p className="text-xs sm:text-sm text-[#a2abb3]">Kg CO2e ahorrados (simulado)</p>
              </div>
          </div>
          <button onClick={fetchBackhaulAIAnalysis} disabled={isLoadingBackhaulImpact} className={`${buttonPrimaryStyle} bg-purple-600 hover:bg-purple-700 w-full`}>
              {isLoadingBackhaulImpact ? <ZapIcon className="animate-spin h-5 w-5 mr-2" /> : <ZapIcon className="h-5 w-5 mr-2" />}
              {isLoadingBackhaulImpact ? "Analizando Impacto..." : "Analizar Impacto de Backhauls (Plataforma) con IA"}
          </button>
          {renderAIAnalysisSection(isLoadingBackhaulImpact, errorBackhaulImpact, backhaulAIImpact, "Análisis IA de Impacto de Backhauls (Plataforma):",
              () => backhaulAIImpact && (
                  <div className="text-xs sm:text-sm space-y-2">
                      <p><strong>Resumen Ahorro CO2e:</strong> {backhaulAIImpact.co2e_saved_summary}</p>
                      <p><strong>Resumen Reducción Km Vacíos:</strong> {backhaulAIImpact.empty_km_reduced_summary}</p>
                      <p><strong>Contribución General a Sostenibilidad:</strong> {backhaulAIImpact.overall_sustainability_contribution}</p>
                  </div>
              )
          )}
      </section>

      {/* Otras Iniciativas de Sostenibilidad */}
      <section className={cardBaseStyle}>
        <h2 className={`${sectionTitleStyle} flex items-center`}>
            <LeafIcon className="h-6 w-6 sm:h-7 sm:w-7 mr-2 text-teal-400" /> Otras Iniciativas de Sostenibilidad (Plataforma)
        </h2>
        <div className="space-y-4 sm:space-y-6">
            {otherInitiativesList.map((initiative) => (
                <div key={initiative.id} className="p-3 sm:p-4 border border-[#40474f] rounded-xl bg-[#1f2328]">
                    <h3 className="font-semibold text-white text-base sm:text-lg mb-1 sm:mb-2">{initiative.title}</h3>
                    <p className="text-xs sm:text-sm text-[#a2abb3] mt-1 mb-2 sm:mb-3">{initiative.description}</p>
                    <button 
                        onClick={() => fetchOtherInitiativeAIAnalysis(initiative.id)} 
                        disabled={initiative.isLoadingAI} 
                        className={`${buttonPrimaryStyle} bg-teal-600 hover:bg-teal-700 w-full text-xs sm:text-sm`}
                    >
                        {initiative.isLoadingAI ? <ZapIcon className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2" /> : <ZapIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />}
                        {initiative.isLoadingAI ? "Analizando..." : "Analizar Impacto con IA"}
                    </button>
                    {renderAIAnalysisSection(
                        initiative.isLoadingAI || false,
                        initiative.errorAI || null,
                        initiative.aiAnalysis || null,
                        `Análisis IA: ${initiative.title}`,
                        () => initiative.aiAnalysis && (
                            <div className="text-xs sm:text-sm space-y-2 text-[#a2abb3]">
                                <p><strong>Impacto Resumido:</strong> <span className="text-white">{initiative.aiAnalysis.impact_summary}</span></p>
                                {initiative.aiAnalysis.challenges && initiative.aiAnalysis.challenges.length > 0 &&
                                    <div><strong>Desafíos Identificados:</strong>
                                        <ul className="list-disc list-inside ml-4 mt-1 text-white">
                                            {initiative.aiAnalysis.challenges.map((item, i) => <li key={i}>{item}</li>)}
                                        </ul>
                                    </div>
                                }
                                {initiative.aiAnalysis.next_steps_suggestions && initiative.aiAnalysis.next_steps_suggestions.length > 0 &&
                                    <div><strong>Sugerencias Próximos Pasos:</strong>
                                        <ul className="list-disc list-inside ml-4 mt-1 text-white">
                                            {initiative.aiAnalysis.next_steps_suggestions.map((item, i) => <li key={i}>{item}</li>)}
                                        </ul>
                                    </div>
                                }
                            </div>
                        )
                    )}
                </div>
            ))}
        </div>
      </section>

      {/* Reportes ESG y Certificaciones */}
      <section className={cardBaseStyle}>
        <h2 className={`${sectionTitleStyle} flex items-center`}>
          <BookOpenIcon className="h-6 w-6 sm:h-7 sm:w-7 mr-2 text-cyan-400" /> Reportes ESG y Certificaciones (Plataforma)
        </h2>
        <div className="mb-6 sm:mb-8">
          <h3 className={`${subSectionTitleStyle} flex items-center text-cyan-300`}>
            <LeafIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2" /> Reportes de Sostenibilidad (ESG)
          </h3>
          {esgReportsList.length > 0 ? (
            <div className="space-y-4">
              {esgReportsList.map((report) => (
                <div key={report.id} className="p-3 sm:p-4 border border-[#40474f] rounded-xl bg-[#1f2328]">
                  <h4 className="font-semibold text-white text-base sm:text-lg">{report.title} ({report.year})</h4>
                  <p className="text-xs sm:text-sm text-[#a2abb3]">{report.type} - Publicado: {report.publicationDate}</p>
                  <p className="text-xs sm:text-sm text-[#a2abb3] mt-1 italic">"{report.summaryDescription}"</p>
                  {report.documentLink && (
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleViewSimulatedDocument(report);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 text-xs sm:text-sm underline mt-1 inline-block cursor-pointer"
                    >
                      Ver Documento (Simulado)
                    </a>
                  )}
                  <button
                    onClick={() => fetchEsgReportAIAnalysis(report.id)}
                    disabled={report.isLoadingAI}
                    className={`${buttonPrimaryStyle} bg-cyan-600 hover:bg-cyan-700 w-full text-xs sm:text-sm mt-2 sm:mt-3`}
                  >
                    {report.isLoadingAI ? <ZapIcon className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2" /> : <ZapIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />}
                    {report.isLoadingAI ? "Analizando Reporte..." : "Analizar Reporte con IA"}
                  </button>
                  {renderAIAnalysisSection(
                    report.isLoadingAI || false,
                    report.errorAI || null,
                    report.aiAnalysis || null,
                    `Análisis IA: ${report.title}`,
                    () => report.aiAnalysis && (
                      <div className="text-xs sm:text-sm space-y-2 text-[#a2abb3]">
                        {report.aiAnalysis.key_achievements.length > 0 && <div><strong>Logros Clave:</strong> <ul className="list-disc list-inside ml-4 mt-1 text-white">{report.aiAnalysis.key_achievements.map((item, i) => <li key={i}>{item}</li>)}</ul></div>}
                        {report.aiAnalysis.areas_for_improvement.length > 0 && <div><strong>Áreas de Mejora:</strong> <ul className="list-disc list-inside ml-4 mt-1 text-white">{report.aiAnalysis.areas_for_improvement.map((item, i) => <li key={i}>{item}</li>)}</ul></div>}
                        <p><strong>Impresión General ESG:</strong> <span className="text-white">{report.aiAnalysis.overall_esg_rating_impression}</span></p>
                      </div>
                    )
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#a2abb3]/80 text-sm">No hay reportes ESG disponibles.</p>
          )}
        </div>

        <div>
          <h3 className={`${subSectionTitleStyle} flex items-center text-cyan-300`}>
            <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2" /> Certificaciones y Cumplimiento
          </h3>
          {certificationsList.length > 0 ? (
            <div className="space-y-4">
              {certificationsList.map((cert) => (
                <div key={cert.id} className="p-3 sm:p-4 border border-[#40474f] rounded-xl bg-[#1f2328]">
                  <h4 className="font-semibold text-white text-base sm:text-lg">{cert.name}</h4>
                  <p className="text-xs sm:text-sm text-[#a2abb3]">Emitido por: {cert.issuingBody}</p>
                  <p className="text-xs sm:text-sm text-[#a2abb3]">Fecha Emisión: {cert.issueDate} {cert.expiryDate ? ` - Expiración: ${cert.expiryDate}` : ''}</p>
                  <p className="text-xs sm:text-sm mt-1">Estado: <span className={`font-medium ${cert.status === 'Active' || cert.status === 'AI Validated' ? 'text-green-400' : cert.status === 'Expired' || cert.status === 'AI Validation Failed' ? 'text-red-400' : 'text-yellow-400'}`}>{cert.status}</span></p>
                  <button
                    onClick={() => fetchCertificationAIValidation(cert.id)}
                    disabled={cert.isLoadingAI}
                    className={`${buttonPrimaryStyle} bg-cyan-600 hover:bg-cyan-700 w-full text-xs sm:text-sm mt-2 sm:mt-3`}
                  >
                    {cert.isLoadingAI ? <ZapIcon className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2" /> : <ZapIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />}
                    {cert.isLoadingAI ? "Validando..." : "Validar Certificación con IA"}
                  </button>
                  {renderAIAnalysisSection(
                    cert.isLoadingAI || false,
                    cert.errorAI || null,
                    cert.aiValidation || null,
                    `Validación IA: ${cert.name}`,
                    () => cert.aiValidation && (
                      <div className="text-xs sm:text-sm space-y-2 text-[#a2abb3]">
                        <p><strong>¿Válida (según descripción)?:</strong> <span className={`font-bold ${cert.aiValidation.is_seemingly_valid_based_on_description ? 'text-green-300' : 'text-red-300'}`}>{cert.aiValidation.is_seemingly_valid_based_on_description ? 'Sí' : 'No'}</span></p>
                        <p><strong>Resumen Validación:</strong> <span className="text-white">{cert.aiValidation.validation_summary}</span></p>
                        {cert.aiValidation.key_compliance_indicators_met.length > 0 && <div><strong>Indicadores Cumplidos (típicos):</strong> <ul className="list-disc list-inside ml-4 mt-1 text-white">{cert.aiValidation.key_compliance_indicators_met.map((item, i) => <li key={i}>{item}</li>)}</ul></div>}
                      </div>
                    )
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#a2abb3]/80 text-sm">No hay certificaciones disponibles.</p>
          )}
        </div>
      </section>

    </div>
  );
};

export default AnalyticsPage;