

import React, { useState, useCallback, useEffect } from 'react';
import { Alert, AlertSeverity, AlertAIAnalysis } from '../types';
import { AlertTriangleIcon, InformationCircleIcon, BellIcon, ZapIcon, ClosePhosphorIcon } from '../components/icons';
import { geminiService } from '../services/geminiService';
import { apiService } from '../services/apiService';
import { DEFAULT_ERROR_MESSAGE } from '../constants';

const initialMockAlerts: Alert[] = [
  { id: 'ALERT001', timestamp: '2024-07-30 10:15:00', message: 'Envío SMRTCGO-003: Detección de apertura de puerta no autorizada en Baquedano.', severity: AlertSeverity.CRITICAL, relatedShipmentId: 'SMRTCGO-003' },
  { id: 'ALERT002', timestamp: '2024-07-30 09:30:00', message: 'Vehículo VEH002: Temperatura fuera de rango (-2°C) para carga refrigerada.', severity: AlertSeverity.WARNING, relatedShipmentId: 'SMRTCGO-002' },
  { id: 'ALERT003', timestamp: '2024-07-30 08:00:00', message: 'Ruta para SMRTCGO-001 optimizada, ahorro de 15 min estimado.', severity: AlertSeverity.INFO, relatedShipmentId: 'SMRTCGO-001' },
  { id: 'ALERT004', timestamp: '2024-07-29 17:45:00', message: 'Pronóstico de fuertes lluvias en ruta de VEH001 para mañana.', severity: AlertSeverity.WARNING, relatedShipmentId: 'SMRTCGO-001' },
  { id: 'ALERT005', timestamp: '2024-07-29 16:00:00', message: 'Mantenimiento preventivo para VEH003 completado.', severity: AlertSeverity.INFO },
];

const AlertsPage: React.FC = () => {
  const cardBaseStyle = "bg-[#1a1f25] border border-[#40474f] shadow-lg rounded-xl p-4 sm:p-6 text-white";
  const buttonModalStyle = "w-full bg-[#3f7fbf] hover:bg-[#3f7fbf]/80 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md transition duration-150 disabled:opacity-60 flex items-center justify-center text-sm mobile-tap-target"; 

  const [alertsList, setAlertsList] = useState<Alert[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [selectedAlertDetails, setSelectedAlertDetails] = useState<Alert | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertAiAnalysis, setAlertAiAnalysis] = useState<AlertAIAnalysis | null>(null);
  const [isAnalyzingAlertWithAI, setIsAnalyzingAlertWithAI] = useState(false);
  const [errorAlertAIAnalysis, setErrorAlertAIAnalysis] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsPageLoading(true);
      const res = await apiService.getData<Alert[]>('alerts');
      if (res.success && res.data!.length === 0) {
        apiService.initializeData('alerts', initialMockAlerts);
        const newRes = await apiService.getData<Alert[]>('alerts');
        if(newRes.success) setAlertsList(newRes.data!);
      } else if (res.success) {
        setAlertsList(res.data!);
      }
      setIsPageLoading(false);
    };
    loadData();
  }, []);

  const createNewAlert = async (message: string, severity: AlertSeverity, relatedShipmentId?: string) => {
    const newAlert: Alert = {
        id: `ALERT${(Date.now() % 10000).toString().padStart(3, '0')}${Math.floor(Math.random()*10)}`, // Simple unique ID
        timestamp: new Date().toISOString(),
        message,
        severity,
        relatedShipmentId
    };
    const newAlerts = [newAlert, ...alertsList];
    setAlertsList(newAlerts);
    await apiService.updateData('alerts', newAlerts);

    if (severity === AlertSeverity.CRITICAL) {
        apiService.addBlockchainEvent({
            eventType: 'CRITICAL_ALERT_TRIGGERED',
            details: { alertId: newAlert.id, message: newAlert.message, severity: newAlert.severity, relatedShipmentId },
            relatedEntityId: newAlert.id,
            actorId: 'system_monitor'
        });
    }
  };


  const getAlertStyles = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return {
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          iconColor: 'text-red-400',
          IconComponent: AlertTriangleIcon,
          titleColor: 'text-red-300',
        };
      case AlertSeverity.WARNING:
        return {
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
          iconColor: 'text-yellow-400',
          IconComponent: AlertTriangleIcon,
          titleColor: 'text-yellow-300',
        };
      case AlertSeverity.INFO:
      default:
        return {
          bgColor: 'bg-sky-500/10',
          borderColor: 'border-sky-500/30',
          iconColor: 'text-sky-400',
          IconComponent: InformationCircleIcon,
          titleColor: 'text-sky-300',
        };
    }
  };

  const handleShowDetailsClick = (alert: Alert) => {
    setSelectedAlertDetails(alert);
    setAlertAiAnalysis(null);
    setIsAnalyzingAlertWithAI(false);
    setErrorAlertAIAnalysis(null);
    setIsAlertModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAlertModalOpen(false);
    setSelectedAlertDetails(null);
    setAlertAiAnalysis(null);
    setIsAnalyzingAlertWithAI(false);
    setErrorAlertAIAnalysis(null);
  };
  
  const handleAnalyzeAlertWithAI = useCallback(async () => {
    if (!selectedAlertDetails) return;

    setIsAnalyzingAlertWithAI(true);
    setErrorAlertAIAnalysis(null);
    setAlertAiAnalysis(null);

    try {
      const alert = selectedAlertDetails;
      const prompt = `Analiza la siguiente alerta logística: ID=${alert.id}, Mensaje='${alert.message}', Severidad=${alert.severity}, Envío Relacionado=${alert.relatedShipmentId || 'N/A'}, Timestamp=${alert.timestamp}. Proporciona un breve resumen del impacto potencial y 2-3 acciones sugeridas concisas y prácticas. Responde estrictamente en formato JSON con la siguiente estructura: {"impact": "string", "suggested_actions": ["string", "string"]}`;
      
      const result = await geminiService.generateText(prompt, { responseMimeType: "application/json" });
      const parsedData = geminiService.parseJsonFromGeminiResponse<AlertAIAnalysis>(result);

      if (parsedData) {
        setAlertAiAnalysis(parsedData);
      } else {
        setErrorAlertAIAnalysis("Error al procesar la respuesta de la IA. El formato no es el esperado.");
      }

    } catch (err) {
      console.error("Error al analizar alerta con IA:", err);
      setErrorAlertAIAnalysis(err instanceof Error ? err.message : DEFAULT_ERROR_MESSAGE);
    } finally {
      setIsAnalyzingAlertWithAI(false);
    }
  }, [selectedAlertDetails]);

  if (isPageLoading) {
    return <div className="text-center p-10 text-white">Cargando alertas...</div>;
  }

  return (
    <div className="space-y-6 sm:space-y-8 text-[#a2abb3]">
      <section className={cardBaseStyle}>
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6 flex items-center">
          <BellIcon className="h-6 w-6 sm:h-7 sm:w-7 mr-2 text-yellow-400" /> Historial y Gestión de Alertas
        </h2>

        {alertsList.length === 0 ? (
          <p className="text-center text-[#a2abb3]/80 py-5 text-sm sm:text-base">No hay alertas para mostrar.</p>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {alertsList.map((alert) => {
              const styles = getAlertStyles(alert.severity);
              return (
                <div 
                  key={alert.id} 
                  className={`p-3 sm:p-4 rounded-xl border ${styles.borderColor} ${styles.bgColor} flex flex-col sm:flex-row sm:items-start gap-2 sm:space-x-3 shadow-sm`}
                >
                  <styles.IconComponent className={`h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 mt-0.5 ${styles.iconColor}`} />
                  <div className="flex-1">
                    <p className={`text-xs sm:text-sm font-medium ${styles.titleColor}`}>{alert.severity.toUpperCase()}{alert.relatedShipmentId ? ` (Envío: ${alert.relatedShipmentId})` : ''}</p>
                    <p className="text-sm sm:text-base text-white mt-0.5">{alert.message}</p>
                    <p className="text-xs text-[#a2abb3]/80 mt-1">{new Date(alert.timestamp).toLocaleString('es-CL')}</p>
                  </div>
                   <button 
                      onClick={() => handleShowDetailsClick(alert)}
                      className="w-full sm:w-auto mt-2 sm:mt-0 text-xs bg-[#2c3035] hover:bg-[#40474f] text-[#a2abb3] py-2 px-3 sm:py-1 sm:px-2.5 rounded-md transition-colors mobile-tap-target"
                    >
                      Detalles
                    </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {isAlertModalOpen && selectedAlertDetails && (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="alert-details-title"
            onClick={handleCloseModal} 
        >
            <div 
                className={`${cardBaseStyle} w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col`}
                onClick={(e) => e.stopPropagation()} 
            >
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <h3 id="alert-details-title" className="text-lg sm:text-xl font-semibold text-white">Alerta: {selectedAlertDetails.id}</h3>
                    <button
                        onClick={handleCloseModal}
                        aria-label="Cerrar modal"
                        className="text-[#a2abb3] hover:text-white transition-colors p-1 -mr-1 rounded-full focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                        <ClosePhosphorIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                </div>

                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5 text-xs sm:text-sm">
                    <p><strong>ID:</strong> {selectedAlertDetails.id}</p>
                    <p><strong>Timestamp:</strong> {new Date(selectedAlertDetails.timestamp).toLocaleString('es-CL')}</p>
                    <p><strong>Mensaje:</strong> {selectedAlertDetails.message}</p>
                    <p><strong>Severidad:</strong> <span style={{color: getAlertStyles(selectedAlertDetails.severity).titleColor}}>{selectedAlertDetails.severity}</span></p>
                    {selectedAlertDetails.relatedShipmentId && <p><strong>Envío Relacionado:</strong> {selectedAlertDetails.relatedShipmentId}</p>}
                </div>

                <div className="border-t border-[#40474f] pt-3 sm:pt-4 mt-auto">
                    <button
                        onClick={handleAnalyzeAlertWithAI}
                        disabled={isAnalyzingAlertWithAI}
                        className={buttonModalStyle}
                    >
                        {isAnalyzingAlertWithAI ? (
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : <ZapIcon className="h-5 w-5 mr-2" />}
                        {isAnalyzingAlertWithAI ? 'Analizando...' : 'Analizar Alerta con IA'}
                    </button>

                    {errorAlertAIAnalysis && <p className="text-red-400 text-xs bg-red-500/10 p-2 rounded-md border border-red-500/20 my-2 sm:my-3">{errorAlertAIAnalysis}</p>}
                    
                    {alertAiAnalysis && (
                        <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm p-3 mt-2 sm:mt-3 bg-[#1f2328] border border-[#40474f] rounded-lg">
                            <h4 className="font-semibold text-white">Análisis IA:</h4>
                            <div>
                                <strong className="text-[#a2abb3]">Impacto Potencial:</strong>
                                <p className="text-white mt-0.5">{alertAiAnalysis.impact}</p>
                            </div>
                            <div>
                                <strong className="text-[#a2abb3]">Acciones Sugeridas:</strong>
                                <ul className="list-disc list-inside mt-0.5 text-white space-y-1 pl-4">
                                    {alertAiAnalysis.suggested_actions.map((action, index) => (
                                        <li key={index}>{action}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AlertsPage;