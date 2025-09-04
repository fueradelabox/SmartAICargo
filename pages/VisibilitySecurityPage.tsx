
import React, { useState, useCallback, useEffect } from 'react';
import { Shipment, ShipmentRealTimeData, GeminiRiskAnalysis, AlertSeverity } from '../types';
import { MapPinIcon, ThermometerIcon, AlertTriangleIcon, ShieldIcon, LockIcon, ZapIcon } from '../components/icons';
import { geminiService } from '../services/geminiService';
import { apiService } from '../services/apiService';
import { DEFAULT_ERROR_MESSAGE, GOOGLE_MAPS_API_KEY } from '../constants'; 
import GoogleMapComponent from '../components/GoogleMapComponent';

const initialMockShipments: Shipment[] = [
  { 
    id: 'SMRTCGO-001', 
    cargoId: 'CGO001', 
    vehicleId: 'VEH001', 
    currentLocation: 'Ruta 68, km 50', 
    status: 'In Transit', 
    estimatedDelivery: '2024-08-01 18:00',
    realTimeData: { latitude: -33.3000, longitude: -70.9000, speedKmh: 85, doorOpen: false }
  },
  { 
    id: 'SMRTCGO-002', 
    cargoId: 'CGO002', 
    vehicleId: 'VEH002', 
    currentLocation: 'Angostura', 
    status: 'In Transit', 
    estimatedDelivery: '2024-08-03 15:00',
    realTimeData: { latitude: -33.8000, longitude: -70.7000, speedKmh: 70, temperatureCelsius: 2, humidityPercent: 60, doorOpen: false, vibrationLevel: 'Low' }
  },
  { 
    id: 'SMRTCGO-003', 
    cargoId: 'CGO003', 
    vehicleId: 'VEH003', 
    currentLocation: 'Baquedano', 
    status: 'Issue Reported', 
    estimatedDelivery: '2024-08-02 12:00',
    realTimeData: { latitude: -23.3000, longitude: -69.8000, speedKmh: 0, doorOpen: true, vibrationLevel: 'High' }
  },
];

const DEFAULT_MAP_CENTER = { lat: -33.45694, lng: -70.64827 };
const DEFAULT_MAP_ZOOM = 7; 
const SHIPMENT_MAP_ZOOM = 12; 
const PLACEHOLDER_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY_PLACEHOLDER";


const VisibilitySecurityPage: React.FC = () => {
  const [shipmentsList, setShipmentsList] = useState<Shipment[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [riskScenario, setRiskScenario] = useState<string>('Un camión transportando electrónicos valiosos por una ruta nocturna con historial de robos.');
  const [riskAnalysis, setRiskAnalysis] = useState<GeminiRiskAnalysis | null>(null);
  const [isLoadingRisk, setIsLoadingRisk] = useState(false);
  const [errorRisk, setErrorRisk] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsPageLoading(true);
      const res = await apiService.getData<Shipment[]>('shipments');
      let loadedShipments: Shipment[] = [];
      if (res.success && res.data!.length === 0) {
        apiService.initializeData('shipments', initialMockShipments);
        const newRes = await apiService.getData<Shipment[]>('shipments');
        if (newRes.success) {
          loadedShipments = newRes.data!;
        }
      } else if (res.success) {
        loadedShipments = res.data!;
      }
      setShipmentsList(loadedShipments);
      if (loadedShipments.length > 0) {
        setSelectedShipment(loadedShipments[0]);
      }
      setIsPageLoading(false);
    };
    loadData();
  }, []);

  const updateShipmentStatus = async (shipmentId: string, newStatus: Shipment['status'], newLocation?: string) => {
    const newShipments = shipmentsList.map(s => 
      s.id === shipmentId 
      ? { ...s, status: newStatus, currentLocation: newLocation || s.currentLocation } 
      : s
    );
    setShipmentsList(newShipments);
    await apiService.updateData('shipments', newShipments);

    if (newStatus === 'Issue Reported' || newStatus === 'Delivered') {
        apiService.addBlockchainEvent({
            eventType: newStatus === 'Issue Reported' ? 'SHIPMENT_ISSUE_REPORTED' : 'SHIPMENT_DELIVERED',
            details: { shipmentId, status: newStatus, location: newLocation || selectedShipment?.currentLocation },
            relatedEntityId: shipmentId,
            actorId: 'iot_simulator' // Or system
        });
    }
    // If the selected shipment is the one being updated, refresh its view
    if (selectedShipment?.id === shipmentId) {
        setSelectedShipment(prev => prev ? {...prev, status: newStatus, currentLocation: newLocation || prev.currentLocation} : null);
    }
  };


  const handleSelectShipment = (shipmentId: string) => {
    setSelectedShipment(shipmentsList.find(s => s.id === shipmentId) || null);
  };

  const handleAnalyzeRisk = useCallback(async () => {
    if (!riskScenario) {
      setErrorRisk('Por favor, ingrese un escenario de riesgo.');
      return;
    }
    setIsLoadingRisk(true);
    setErrorRisk(null);
    setRiskAnalysis(null);

    try {
      const prompt = `Analiza el siguiente escenario de riesgo en transporte de carga y proporciona una evaluación. Escenario: "${riskScenario}". Formato JSON: {"risk_level": "Low" | "Medium" | "High", "potential_risks": ["...", "..."], "mitigation_suggestions": ["...", "..."]}`;
      const result = await geminiService.generateText(prompt, { responseMimeType: "application/json" });
      
      const parsedData = geminiService.parseJsonFromGeminiResponse<GeminiRiskAnalysis>(result);
      if (parsedData) {
        setRiskAnalysis(parsedData);
      } else {
        setErrorRisk("Error al procesar la respuesta de la IA. Formato no esperado.");
      }
    } catch (err) {
      console.error("Error al analizar el riesgo:", err);
      setErrorRisk(DEFAULT_ERROR_MESSAGE);
    } finally {
      setIsLoadingRisk(false);
    }
  }, [riskScenario]);

  const cardBaseStyle = "bg-[#1a1f25] border border-[#40474f] shadow-lg rounded-xl p-4 sm:p-6 text-white"; 
  const inputStyle = "mt-1 block w-full px-3 py-2 border border-[#40474f] rounded-md shadow-sm focus:outline-none focus:ring-[#3f7fbf] focus:border-[#3f7fbf] sm:text-sm bg-[#1f2328] text-white placeholder-[#a2abb3]/70";
  const labelStyle = "block text-sm font-medium text-[#a2abb3]";
  const buttonPrimaryStyle = "w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md transition duration-150 disabled:opacity-60 flex items-center justify-center mobile-tap-target"; 


  const mapCenter = selectedShipment?.realTimeData 
    ? { lat: selectedShipment.realTimeData.latitude, lng: selectedShipment.realTimeData.longitude } 
    : DEFAULT_MAP_CENTER;
  
  const mapZoom = selectedShipment?.realTimeData ? SHIPMENT_MAP_ZOOM : DEFAULT_MAP_ZOOM;
  
  const markerPosition = selectedShipment?.realTimeData 
    ? { lat: selectedShipment.realTimeData.latitude, lng: selectedShipment.realTimeData.longitude } 
    : null;

  const isMapsApiConfigured = GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== PLACEHOLDER_API_KEY;

  if (isPageLoading) {
    return <div className="text-center p-10 text-white">Cargando datos de envíos...</div>;
  }
  
  const renderMapOrPlaceholder = () => {
    if (!isMapsApiConfigured) {
      return (
        <div className="bg-[#2c3035] rounded-xl flex flex-col items-center justify-center h-full text-center p-4">
          <MapPinIcon className="w-12 h-12 text-[#a2abb3]/50 mb-3" />
          <p className="text-[#a2abb3]/70 text-sm font-medium">Visualización de Mapa No Disponible</p>
          <p className="text-[#a2abb3]/60 text-xs mt-1">
            La clave API de Google Maps no está configurada.
          </p>
        </div>
      );
    }
    return (
      <GoogleMapComponent
        center={mapCenter}
        zoom={mapZoom}
        markerPosition={markerPosition}
        markerTitle={selectedShipment ? selectedShipment.id : undefined}
      />
    );
  };
  
  const renderDefaultMapState = () => {
     if (!isMapsApiConfigured) {
      return (
         <div className="bg-[#2c3035] rounded-xl flex flex-col items-center justify-center h-full text-center p-4">
          <MapPinIcon className="w-12 h-12 text-[#a2abb3]/50 mb-3" />
          <p className="text-[#a2abb3]/70 text-sm font-medium">Mapa No Disponible</p>
          <p className="text-[#a2abb3]/60 text-xs mt-1">Configure API Key para ver el mapa.</p>
        </div>
      );
    }
    return <GoogleMapComponent center={DEFAULT_MAP_CENTER} zoom={DEFAULT_MAP_ZOOM} />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 text-[#a2abb3]">
      {/* Seguimiento en Tiempo Real y Monitoreo IoT */}
      <section className={cardBaseStyle}>
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
          <MapPinIcon className="h-6 w-6 sm:h-7 sm:w-7 mr-2 text-sky-400" /> Seguimiento en Tiempo Real y Monitoreo IoT
        </h2>
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Lista de Envíos */}
          <div className="lg:w-1/3 w-full max-h-[300px] sm:max-h-[400px] lg:max-h-[calc(100vh-250px)] overflow-y-auto pr-0 sm:pr-2">
            <h3 className="text-base sm:text-lg font-medium text-white mb-2 sm:mb-3">Envíos Activos</h3>
            {shipmentsList.length > 0 ? shipmentsList.map(shipment => (
              <div
                key={shipment.id}
                onClick={() => handleSelectShipment(shipment.id)}
                className={`p-3 mb-2 border rounded-xl cursor-pointer transition-all duration-200 mobile-tap-target ${selectedShipment?.id === shipment.id ? 'bg-sky-500/20 border-sky-500 shadow-md' : 'border-[#40474f] hover:bg-[#2c3035]'}`}
              >
                <p className="font-semibold text-sky-300 text-sm sm:text-base">{shipment.id}</p>
                <p className="text-xs sm:text-sm text-[#a2abb3]">Vehículo: {shipment.vehicleId}</p>
                <p className={`text-xs font-medium mt-1 ${shipment.status === 'In Transit' ? 'text-green-400' : shipment.status === 'Issue Reported' ? 'text-red-400' : 'text-yellow-400'}`}>
                  {shipment.status}
                </p>
              </div>
            )) : <p className="text-sm text-[#a2abb3]/70">No hay envíos para mostrar.</p>}
          </div>

          {/* Detalles del Envío y Mapa */}
          <div className="lg:w-2/3 w-full flex flex-col">
            {selectedShipment ? (
              <>
                <h3 className="text-lg sm:text-xl font-medium text-white mb-2 sm:mb-3">Detalles para: {selectedShipment.id}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4 text-sm sm:text-base">
                  <div>
                    <p><strong>Estado:</strong> <span className={`font-semibold ${selectedShipment.status === 'In Transit' ? 'text-green-400' : selectedShipment.status === 'Issue Reported' ? 'text-red-400' : 'text-yellow-400'}`}>{selectedShipment.status}</span></p>
                    <p><strong>Ubicación Actual:</strong> {selectedShipment.currentLocation}</p>
                    <p><strong>Entrega Estimada:</strong> {selectedShipment.estimatedDelivery}</p>
                  </div>
                  {selectedShipment.realTimeData && (
                    <div className="bg-[#1f2328] p-3 rounded-xl border border-[#40474f] text-xs sm:text-sm">
                      <h4 className="font-medium text-white mb-1">Datos IoT:</h4>
                      <p>Velocidad: {selectedShipment.realTimeData.speedKmh} km/h</p>
                      {selectedShipment.realTimeData.temperatureCelsius !== undefined && <p className="flex items-center"><ThermometerIcon className="h-4 w-4 mr-1 text-blue-400"/> Temp: {selectedShipment.realTimeData.temperatureCelsius}°C</p>}
                      {selectedShipment.realTimeData.humidityPercent !== undefined && <p>Humedad: {selectedShipment.realTimeData.humidityPercent}%</p>}
                      <p className={`${selectedShipment.realTimeData.doorOpen ? 'text-red-400 font-semibold' : 'text-green-400'}`}>
                        Puertas: {selectedShipment.realTimeData.doorOpen ? 'Abiertas (¡Alerta!)' : 'Cerradas'}
                      </p>
                      {selectedShipment.realTimeData.vibrationLevel && <p>Vibración: {selectedShipment.realTimeData.vibrationLevel}</p>}
                    </div>
                  )}
                </div>
                <div className="flex-grow h-64 sm:h-80 md:h-96 mb-3 sm:mb-4">
                  {renderMapOrPlaceholder()}
                </div>
                 <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-start sm:items-center text-xs sm:text-sm">
                    <LockIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <p className="text-blue-300">Eventos clave del envío registrados en Blockchain para trazabilidad inmutable.</p>
                </div>
              </>
            ) : (
             <div className="flex-grow flex flex-col items-center justify-center text-center py-10">
                <div className="w-full h-64 sm:h-80 md:h-96">
                   {renderDefaultMapState()}
                </div>
                <p className="text-[#a2abb3]/80 text-sm sm:text-base mt-4">
                  {isMapsApiConfigured ? "Mapa de Chile. Seleccione un envío para ver los detalles y su ubicación." : "Seleccione un envío para ver detalles."}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Alertas Predictivas de Riesgo con IA */}
      <section className={cardBaseStyle}>
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
          <AlertTriangleIcon className="h-6 w-6 sm:h-7 sm:w-7 mr-2 text-red-500" /> Alertas Predictivas de Riesgo (IA)
        </h2>
        <div className="mb-3 sm:mb-4">
          <label htmlFor="riskScenario" className={labelStyle}>Describa un escenario de riesgo:</label>
          <textarea
            id="riskScenario"
            value={riskScenario}
            onChange={(e) => setRiskScenario(e.target.value)}
            rows={3}
            className={`${inputStyle} text-sm sm:text-base`}
            placeholder="Ej: Camión con carga frágil en ruta con pronóstico de tormenta."
          />
        </div>
        <button
          onClick={handleAnalyzeRisk}
          disabled={isLoadingRisk}
          className={buttonPrimaryStyle}
        >
           {isLoadingRisk ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : <ZapIcon className="h-5 w-5 mr-2"/> }
          {isLoadingRisk ? 'Analizando...' : 'Analizar Riesgo con IA'}
        </button>
        {errorRisk && <p className="text-red-400 text-xs sm:text-sm mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-md">{errorRisk}</p>}
        {riskAnalysis && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm sm:text-base">
            <h3 className="text-base sm:text-lg font-semibold text-red-300 mb-1 sm:mb-2">Análisis de Riesgo:</h3>
            <p><strong>Nivel de Riesgo:</strong> <span className={`font-bold ${
                riskAnalysis.risk_level === 'High' ? 'text-red-400' :
                riskAnalysis.risk_level === 'Medium' ? 'text-yellow-400' : 'text-green-400'
            }`}>{riskAnalysis.risk_level}</span></p>
            
            {riskAnalysis.potential_risks && riskAnalysis.potential_risks.length > 0 && (
                <>
                    <h4 className="font-medium text-red-300 mt-2 sm:mt-3 mb-1">Riesgos Potenciales:</h4>
                    <ul className="list-disc list-inside text-[#a2abb3] space-y-1">
                    {riskAnalysis.potential_risks.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </>
            )}
            {riskAnalysis.mitigation_suggestions && riskAnalysis.mitigation_suggestions.length > 0 && (
                 <>
                    <h4 className="font-medium text-red-300 mt-2 sm:mt-3 mb-1">Sugerencias de Mitigación:</h4>
                    <ul className="list-disc list-inside text-[#a2abb3] space-y-1">
                    {riskAnalysis.mitigation_suggestions.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default VisibilitySecurityPage;