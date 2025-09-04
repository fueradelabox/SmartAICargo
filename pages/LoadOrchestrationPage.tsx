

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
    CargoOffer, 
    Vehicle, 
    GeminiRouteSuggestion, 
    ConsolidationSuggestion,
    LtlConsolidationSuggestion,
    FtlBackhaulSuggestion,
    GeminiLtlConsolidationResponse,
    GeminiFtlBackhaulResponse,
    GeminiForwardHaulResponse
} from '../types';
import { geminiService } from '../services/geminiService';
import { apiService } from '../services/apiService';
import { PackageIconPhosphor, TruckIconPhosphor, RouteIcon, ZapIcon, AlertTriangleIcon, CheckCircleIcon, InformationCircleIcon } from '../components/icons';
import { DEFAULT_ERROR_MESSAGE } from '../constants';

const initialMockCargoOffers: CargoOffer[] = [
  { id: 'CGO001', origin: 'Santiago', destination: 'Valparaíso', cargoType: 'Electrónicos', weightKg: 500, volumeM3: 2, pickupDate: '2024-08-15', deliveryDate: '2024-08-16', status: 'Pending', shipperId: 'shipper' },
  { id: 'CGO002', origin: 'Concepción', destination: 'Puerto Montt', cargoType: 'Alimentos Perecederos', weightKg: 1200, volumeM3: 10, pickupDate: '2024-08-18', deliveryDate: '2024-08-19', status: 'Pending', shipperId: 'shipper' },
  { id: 'CGO003', origin: 'Antofagasta', destination: 'Calama', cargoType: 'Material de Construcción', weightKg: 25000, volumeM3: 30, pickupDate: '2024-08-17', deliveryDate: '2024-08-17', status: 'Matched', shipperId: 'shipper' },
  { id: 'CGO004', origin: 'Santiago', destination: 'Valparaíso', cargoType: 'Textiles', weightKg: 300, volumeM3: 1.5, pickupDate: '2024-08-15', deliveryDate: '2024-08-16', status: 'Pending', shipperId: 'shipper' },
  { id: 'CGO005', origin: 'Valparaíso', destination: 'Santiago', cargoType: 'Devoluciones', weightKg: 400, volumeM3: 2.5, pickupDate: '2024-08-20', deliveryDate: '2024-08-20', status: 'Pending', shipperId: 'shipper' },
  { id: 'CGO006', origin: 'Santiago', destination: 'Rancagua', cargoType: 'Herramientas', weightKg: 700, volumeM3: 3, pickupDate: '2024-08-19', deliveryDate: '2024-08-19', status: 'Pending', shipperId: 'shipper' },
  { id: 'CGO007', origin: 'Santiago', destination: 'Talca', cargoType: 'Maquinaria Ligera', weightKg: 1500, volumeM3: 8, pickupDate: '2024-08-22', deliveryDate: '2024-08-23', status: 'Pending', shipperId: 'shipper' },
  { id: 'CGO008', origin: 'La Serena', destination: 'Copiapó', cargoType: 'Insumos Agrícolas', weightKg: 900, volumeM3: 5, pickupDate: '2024-08-21', deliveryDate: '2024-08-21', status: 'Pending', shipperId: 'shipper' },
  { id: 'CGO009', origin: 'Santiago', destination: 'Antofagasta', cargoType: 'Repuestos Minería', weightKg: 3000, volumeM3: 10, pickupDate: '2024-08-25', deliveryDate: '2024-08-27', status: 'Pending', shipperId: 'shipper' },
  { id: 'CGO010', origin: 'Santiago', destination: 'La Serena', cargoType: 'Equipamiento Hotelero', weightKg: 1500, volumeM3: 7, pickupDate: '2024-08-26', deliveryDate: '2024-08-26', status: 'Pending', shipperId: 'shipper' },
  { id: 'CGO011', origin: 'Rancagua', destination: 'Temuco', cargoType: 'Productos Agrícolas', weightKg: 5000, volumeM3: 20, pickupDate: '2024-08-28', deliveryDate: '2024-08-29', status: 'Pending', shipperId: 'shipper' },
  { id: 'CGO012', origin: 'Valparaíso', destination: 'Concepción', cargoType: 'Mercancía General', weightKg: 800, volumeM3: 4, pickupDate: '2024-08-29', deliveryDate: '2024-08-30', status: 'Pending', shipperId: 'shipper' },
  { id: 'CGO013', origin: 'Santiago', destination: 'Copiapó', cargoType: 'Materiales Peligrosos (simulado)', weightKg: 2000, volumeM3: 5, pickupDate: '2024-08-30', deliveryDate: '2024-08-31', status: 'Pending', shipperId: 'shipper' },
  // Additional Pending Offers for robust simulation
  { id: 'CGO014', origin: 'Arica', destination: 'Iquique', cargoType: 'Electrónicos', weightKg: 1200, volumeM3: 6, pickupDate: '2024-09-01', deliveryDate: '2024-09-01', status: 'Pending', shipperId: 'shipper' },
  { id: 'CGO015', origin: 'Santiago', destination: 'Temuco', cargoType: 'Muebles', weightKg: 2500, volumeM3: 15, pickupDate: '2024-09-02', deliveryDate: '2024-09-03', status: 'Pending', shipperId: 'shipper' },
  { id: 'CGO016', origin: 'Puerto Montt', destination: 'Punta Arenas', cargoType: 'Alimentos Congelados', weightKg: 8000, volumeM3: 25, pickupDate: '2024-09-03', deliveryDate: '2024-09-06', status: 'Pending', shipperId: 'shipper' },
  { id: 'CGO017', origin: 'Calama', destination: 'Antofagasta', cargoType: 'Insumos Mineros', weightKg: 15000, volumeM3: 20, pickupDate: '2024-09-04', deliveryDate: '2024-09-04', status: 'Pending', shipperId: 'shipper' },
  { id: 'CGO018', origin: 'Valdivia', destination: 'Osorno', cargoType: 'Cerveza Artesanal', weightKg: 1000, volumeM3: 7, pickupDate: '2024-09-05', deliveryDate: '2024-09-05', status: 'Pending', shipperId: 'shipper' },
  { id: 'CGO019', origin: 'Santiago', destination: 'Mendoza', cargoType: 'Vinos de Exportación', weightKg: 4000, volumeM3: 12, pickupDate: '2024-09-06', deliveryDate: '2024-09-07', status: 'Pending', shipperId: 'shipper' },
  { id: 'CGO020', origin: 'La Serena', destination: 'Santiago', cargoType: 'Frutas Frescas', weightKg: 3000, volumeM3: 18, pickupDate: '2024-09-07', deliveryDate: '2024-09-07', status: 'Pending', shipperId: 'shipper' },
  { id: 'CGO021', origin: 'Talca', destination: 'Chillán', cargoType: 'Repuestos Automotrices', weightKg: 600, volumeM3: 3, pickupDate: '2024-09-08', deliveryDate: '2024-09-08', status: 'Pending', shipperId: 'shipper' },
  { id: 'CGO022', origin: 'Santiago', destination: 'Arica', cargoType: 'Textiles Importados', weightKg: 1800, volumeM3: 9, pickupDate: '2024-09-09', deliveryDate: '2024-09-11', status: 'Pending', shipperId: 'shipper' },
  { id: 'CGO023', origin: 'Iquique', destination: 'Santiago', cargoType: 'Productos Electrónicos (Retorno)', weightKg: 700, volumeM3: 4, pickupDate: '2024-09-10', deliveryDate: '2024-09-12', status: 'Pending', shipperId: 'shipper' },
  { id: 'CGO024', origin: 'Rancagua', destination: 'Valparaíso', cargoType: 'Materiales de Embalaje', weightKg: 900, volumeM3: 10, pickupDate: '2024-09-11', deliveryDate: '2024-09-11', status: 'Pending', shipperId: 'shipper' },
  { id: 'CGO025', origin: 'Copiapó', destination: 'La Serena', cargoType: 'Minerales Procesados', weightKg: 20000, volumeM3: 15, pickupDate: '2024-09-12', deliveryDate: '2024-09-12', status: 'Pending', shipperId: 'shipper' },
  { id: 'CGO026', origin: 'Santiago', destination: 'Punta Arenas', cargoType: 'Equipamiento Médico', weightKg: 500, volumeM3: 3, pickupDate: '2024-09-13', deliveryDate: '2024-09-16', status: 'Pending', shipperId: 'shipper' },
  { id: 'CGO027', origin: 'Valparaíso', destination: 'Viña del Mar', cargoType: 'Suministros de Oficina', weightKg: 200, volumeM3: 1, pickupDate: '2024-09-14', deliveryDate: '2024-09-14', status: 'Pending', shipperId: 'shipper' },
  { id: 'CGO028', origin: 'Antofagasta', destination: 'Santiago', cargoType: 'Productos Pesqueros (Congelado)', weightKg: 6000, volumeM3: 20, pickupDate: '2024-09-15', deliveryDate: '2024-09-17', status: 'Pending', shipperId: 'shipper' },
  { id: 'CGO029', origin: 'Santiago', destination: 'Lima', cargoType: 'Productos Farmacéuticos', weightKg: 1000, volumeM3: 5, pickupDate: '2024-09-16', deliveryDate: '2024-09-19', status: 'Pending', shipperId: 'shipper' },
  { id: 'CGO030', origin: 'Puerto Varas', destination: 'Bariloche', cargoType: 'Artesanías Locales', weightKg: 300, volumeM3: 2, pickupDate: '2024-09-17', deliveryDate: '2024-09-18', status: 'Pending', shipperId: 'shipper' },
];

const initialMockVehicles: Vehicle[] = [
  { id: 'VEH001', type: 'Truck (LTL)', capacityKg: 1000, capacityM3: 5, currentLocation: 'Santiago', availability: 'Available', driverName: 'Juan Pérez' },
  { id: 'VEH002', type: 'Refrigerated Truck', capacityKg: 2000, capacityM3: 15, currentLocation: 'Rancagua', availability: 'Available', driverName: 'Maria González' },
  { id: 'VEH003', type: 'Truck (FTL)', capacityKg: 30000, capacityM3: 40, currentLocation: 'Calama', availability: 'On Trip', driverName: 'Carlos Silva' },
  { id: 'VEH004', type: 'Van', capacityKg: 800, capacityM3: 4, currentLocation: 'Valparaíso', availability: 'Available', driverName: 'Luisa Martinez' },
  { id: 'VEH005', type: 'Truck (FTL)', capacityKg: 28000, capacityM3: 35, currentLocation: 'Santiago', availability: 'Available', driverName: 'Pedro Araya' },
  { id: 'VEH006', type: 'Truck (LTL)', capacityKg: 1200, capacityM3: 6, currentLocation: 'La Serena', availability: 'Available', driverName: 'Sofia Castro' },
  { id: 'VEH007', type: 'Truck (FTL)', capacityKg: 25000, capacityM3: 70, currentLocation: 'Santiago', availability: 'Available', driverName: 'Ricardo Lagos' },
  { id: 'VEH008', type: 'Truck (LTL)', capacityKg: 6000, capacityM3: 25, currentLocation: 'Rancagua', availability: 'Available', driverName: 'Ana Silva' },
  { id: 'VEH009', type: 'Van', capacityKg: 900, capacityM3: 5, currentLocation: 'Valparaíso', availability: 'Available', driverName: 'Jorge Herrera' },
  // Additional Available Vehicles
  { id: 'VEH010', type: 'Refrigerated Truck', capacityKg: 10000, capacityM3: 30, currentLocation: 'Puerto Montt', availability: 'Available', driverName: 'Laura Fernández' },
  { id: 'VEH011', type: 'Truck (FTL)', capacityKg: 22000, capacityM3: 60, currentLocation: 'Antofagasta', availability: 'Available', driverName: 'Miguel Soto' },
  { id: 'VEH012', type: 'Truck (LTL)', capacityKg: 3000, capacityM3: 12, currentLocation: 'Concepción', availability: 'Available', driverName: 'Carolina Rojas' },
  { id: 'VEH013', type: 'Van', capacityKg: 1000, capacityM3: 7, currentLocation: 'Temuco', availability: 'Available', driverName: 'Andrés Vidal' },
  { id: 'VEH014', type: 'Truck (FTL)', capacityKg: 27000, capacityM3: 85, currentLocation: 'Santiago', availability: 'Maintenance' }, // One in maintenance
  { id: 'VEH015', type: 'Refrigerated Truck', capacityKg: 1500, capacityM3: 8, currentLocation: 'Arica', availability: 'Available', driverName: 'Patricia Nuñez' },
  { id: 'VEH016', type: 'Truck (LTL)', capacityKg: 8000, capacityM3: 30, currentLocation: 'Copiapó', availability: 'Available', driverName: 'Roberto Gomez' },
];

type ForwardHaulSuggestionItem = {
    cargoOffer: CargoOffer;
    aiAnalysis: GeminiForwardHaulResponse;
};

const LoadOrchestrationPage: React.FC = () => {
  const [cargoOffersList, setCargoOffersList] = useState<CargoOffer[]>([]);
  const [vehiclesList, setVehiclesList] = useState<Vehicle[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  const [selectedCargoForMatching, setSelectedCargoForMatching] = useState<CargoOffer | null>(null);
  const [isVehicleFilterActive, setIsVehicleFilterActive] = useState(false);

  const [consolidationSuggestions, setConsolidationSuggestions] = useState<ConsolidationSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [errorSuggestions, setErrorSuggestions] = useState<string | null>(null);

  const [routeOrigin, setRouteOrigin] = useState('Santiago');
  const [routeDestination, setRouteDestination] = useState('Valparaíso');
  const [optimizedRoute, setOptimizedRoute] = useState<GeminiRouteSuggestion | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [errorRoute, setErrorRoute] = useState<string | null>(null);

  // State for Forward Haul Feature
  const [selectedVehicleForForwardHaul, setSelectedVehicleForForwardHaul] = useState<string>(''); // Store vehicle ID
  const [vehicleIntendedDestination, setVehicleIntendedDestination] = useState<string>('');
  const [forwardHaulSuggestions, setForwardHaulSuggestions] = useState<ForwardHaulSuggestionItem[]>([]);
  const [isLoadingForwardHaul, setIsLoadingForwardHaul] = useState(false);
  const [errorForwardHaul, setErrorForwardHaul] = useState<string | null>(null);


  const cardBaseStyle = "bg-[#1a1f25] border border-[#40474f] shadow-lg rounded-xl p-4 sm:p-6 text-white";
  const inputStyle = "mt-1 block w-full px-3 py-2 border border-[#40474f] rounded-md shadow-sm focus:outline-none focus:ring-[#3f7fbf] focus:border-[#3f7fbf] sm:text-sm bg-[#1f2328] text-white placeholder-[#a2abb3]/70";
  const labelStyle = "block text-sm font-medium text-[#a2abb3]";
  const buttonPrimaryStyle = "w-full sm:w-auto bg-[#3f7fbf] hover:bg-[#3f7fbf]/80 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md transition duration-150 disabled:opacity-60 flex items-center justify-center mobile-tap-target";
  const buttonSecondaryStyle = "w-full sm:w-auto bg-[#2c3035] hover:bg-[#40474f] text-white font-semibold py-2.5 px-4 rounded-xl shadow-md transition duration-150 disabled:opacity-60 flex items-center justify-center mobile-tap-target";

  useEffect(() => {
    const loadData = async () => {
        setIsPageLoading(true);
        const [cargoRes, vehicleRes] = await Promise.all([
            apiService.getData<CargoOffer[]>('cargo'),
            apiService.getData<Vehicle[]>('vehicles')
        ]);

        if (cargoRes.success && cargoRes.data!.length === 0) {
            apiService.initializeData('cargo', initialMockCargoOffers);
            const newCargoRes = await apiService.getData<CargoOffer[]>('cargo');
            if (newCargoRes.success) setCargoOffersList(newCargoRes.data!);
        } else if (cargoRes.success) {
            setCargoOffersList(cargoRes.data!);
        }

        if (vehicleRes.success && vehicleRes.data!.length === 0) {
            apiService.initializeData('vehicles', initialMockVehicles);
            const newVehicleRes = await apiService.getData<Vehicle[]>('vehicles');
            if (newVehicleRes.success) setVehiclesList(newVehicleRes.data!);
        } else if (vehicleRes.success) {
            setVehiclesList(vehicleRes.data!);
        }
        setIsPageLoading(false);
    };
    loadData();
  }, []);


  const handleSearchVehicleClick = (cargoOffer: CargoOffer) => {
    if (cargoOffer.status !== 'Pending') return;
    setSelectedCargoForMatching(cargoOffer);
    setIsVehicleFilterActive(true);
  };

  const assignCargoToVehicle = async (cargoOfferId: string, vehicleId: string) => {
    const newOffers = cargoOffersList.map(offer =>
        offer.id === cargoOfferId ? { ...offer, status: 'Matched' as const } : offer
    );
    setCargoOffersList(newOffers);

    const newVehicles = vehiclesList.map(v =>
        v.id === vehicleId ? { ...v, availability: 'On Trip' as const } : v
    );
    setVehiclesList(newVehicles);

    await Promise.all([
        apiService.updateData('cargo', newOffers),
        apiService.updateData('vehicles', newVehicles)
    ]);

    apiService.addBlockchainEvent({
        eventType: 'CARGO_ASSIGNED',
        details: { cargoOfferId, vehicleId, status: 'Matched' },
        relatedEntityId: cargoOfferId,
        actorId: 'system' // Or a user ID if available
    });
  };

  const handleAssignCargoClick = async (vehicle: Vehicle) => {
    if (!selectedCargoForMatching) return;
    await assignCargoToVehicle(selectedCargoForMatching.id, vehicle.id);
    setSelectedCargoForMatching(null);
    setIsVehicleFilterActive(false);
  };

  const handleClearVehicleFilter = () => {
    setSelectedCargoForMatching(null);
    setIsVehicleFilterActive(false);
  };
  
  const displayedVehicles = useMemo(() => {
    if (!isVehicleFilterActive || !selectedCargoForMatching) {
      return vehiclesList.filter(v => v.availability === 'Available');
    }
    return vehiclesList.filter(vehicle => {
      const cargo = selectedCargoForMatching;
      const isCapacitySufficient = vehicle.capacityKg >= cargo.weightKg && vehicle.capacityM3 >= cargo.volumeM3;
      const isTypeCompatible = cargo.cargoType.toLowerCase().includes('perecedero') || cargo.cargoType.toLowerCase().includes('congelado') ? vehicle.type === 'Refrigerated Truck' : true;
      return vehicle.availability === 'Available' && isCapacitySufficient && isTypeCompatible;
    });
  }, [vehiclesList, selectedCargoForMatching, isVehicleFilterActive]);

  const handleFindConsolidationOpportunities = useCallback(async () => {
    setIsLoadingSuggestions(true);
    setErrorSuggestions(null);
    setConsolidationSuggestions([]);
    let localCurrentSuggestions: ConsolidationSuggestion[] = [];

    const pendingCargo = cargoOffersList.filter(c => c.status === 'Pending' || c.status === 'Consolidating');

    // LTL Consolidation part
    const ltlCandidates: CargoOffer[][] = [];
    const groupedByRoute: Record<string, CargoOffer[]> = {};
    pendingCargo.forEach(offer => {
        const routeKey = `${offer.origin}-${offer.destination}`;
        if (!groupedByRoute[routeKey]) groupedByRoute[routeKey] = [];
        groupedByRoute[routeKey].push(offer);
    });

    Object.values(groupedByRoute).forEach(group => {
        if (group.length >= 2) {
            for (let i = 0; i < group.length; i++) {
                for (let j = i + 1; j < group.length; j++) {
                    if (group[i].status === 'Consolidating' && group[j].status === 'Consolidating' && group[i].id === group[j].id) continue;
                     // Avoid consolidating an offer with itself if it was duplicated for some reason.
                    if (group[i].id === group[j].id) continue;
                    ltlCandidates.push([group[i], group[j]]);
                }
            }
        }
    });

    for (const pair of ltlCandidates) {
        const [offerA, offerB] = pair;
        const prompt = `Analiza si las siguientes ofertas LTL son buenas candidatas para consolidar en un envío FTL.
        Oferta A: ID=${offerA.id}, Origen=${offerA.origin}, Destino=${offerA.destination}, Tipo=${offerA.cargoType}, Peso=${offerA.weightKg}kg, Volumen=${offerA.volumeM3}m³, Fecha Recogida=${offerA.pickupDate}.
        Oferta B: ID=${offerB.id}, Origen=${offerB.origin}, Destino=${offerB.destination}, Tipo=${offerB.cargoType}, Peso=${offerB.weightKg}kg, Volumen=${offerB.volumeM3}m³, Fecha Recogida=${offerB.pickupDate}.
        Considera compatibilidad de ruta, fechas, tipo de carga (perecederos separados), y si la suma de peso/volumen justifica un FTL.
        Responde estrictamente en formato JSON con la siguiente estructura: {"is_good_candidate": boolean, "reasoning": "string", "suggestion_description": "string", "potential_benefit": "string"}`;
        
        try {
            const result = await geminiService.generateText(prompt, { responseMimeType: "application/json" });
            const aiAnalysis = geminiService.parseJsonFromGeminiResponse<GeminiLtlConsolidationResponse>(result);

            if (aiAnalysis && aiAnalysis.is_good_candidate) {
                localCurrentSuggestions.push({
                    id: crypto.randomUUID(),
                    type: 'LTL_CONSOLIDATION',
                    involvedOfferIds: [offerA.id, offerB.id],
                    combinedWeightKg: offerA.weightKg + offerB.weightKg,
                    combinedVolumeM3: offerA.volumeM3 + offerB.volumeM3,
                    aiAnalysis,
                    status: 'SUGGESTED',
                });
            }
        } catch (err) { 
            console.error(`Error analizando consolidación LTL para ${offerA.id} y ${offerB.id}:`, err);
        }
    }
    
    // FTL Backhaul part
    const availableVehiclesForBackhaul = vehiclesList.filter(v => v.availability === 'Available' && v.type.includes('Truck'));
    for (const vehicle of availableVehiclesForBackhaul) {
        for (const offer of pendingCargo) {
            // Ensure vehicle capacity is sufficient and it's a true backhaul (vehicle at offer origin)
            if (vehicle.currentLocation === offer.origin && vehicle.capacityKg >= offer.weightKg && vehicle.capacityM3 >= offer.volumeM3) {
                 const prompt = `Analiza si la Oferta de Carga ID=${offer.id} (Origen=${offer.origin}, Destino=${offer.destination}, Tipo=${offer.cargoType}, Peso=${offer.weightKg}kg, Volumen=${offer.volumeM3}m³) es una buena oportunidad de backhaul para el Vehículo ID=${vehicle.id} (Tipo=${vehicle.type}, Capacidad=${vehicle.capacityKg}kg, ${vehicle.capacityM3}m³, Ubicación Actual=${vehicle.currentLocation}). Considera si el destino de la oferta es una ruta lógica de retorno o hacia un hub principal desde la ubicación del vehículo.
                 Responde estrictamente en formato JSON con la siguiente estructura: {"is_good_candidate": boolean, "reasoning": "string", "suggestion_description": "string", "potential_benefit": "string"}`;
                
                try {
                    const result = await geminiService.generateText(prompt, { responseMimeType: "application/json" });
                    const aiAnalysis = geminiService.parseJsonFromGeminiResponse<GeminiFtlBackhaulResponse>(result);
                    if (aiAnalysis && aiAnalysis.is_good_candidate) {
                        localCurrentSuggestions.push({
                            id: crypto.randomUUID(),
                            type: 'FTL_BACKHAUL',
                            vehicleId: vehicle.id,
                            offerId: offer.id,
                            aiAnalysis,
                            status: 'SUGGESTED',
                        });
                    }
                } catch (err) {
                     console.error(`Error analizando backhaul FTL para vehículo ${vehicle.id} y oferta ${offer.id}:`, err);
                }
            }
        }
    }

    setConsolidationSuggestions(localCurrentSuggestions);
    if (localCurrentSuggestions.length === 0) {
        setErrorSuggestions("No se encontraron oportunidades claras de consolidación o backhaul en este momento.");
    }
    setIsLoadingSuggestions(false);

  }, [cargoOffersList, vehiclesList]);

  const updateSuggestionStatus = async (suggestionId: string, newStatus: ConsolidationSuggestion['status']) => {
    setConsolidationSuggestions(prev => prev.map(s => s.id === suggestionId ? {...s, status: newStatus} : s));
    if (newStatus === 'ACTIONED') {
        const suggestion = consolidationSuggestions.find(s => s.id === suggestionId);
        if (suggestion?.type === 'LTL_CONSOLIDATION') {
            const newOffers = cargoOffersList.map(offer => 
                    (suggestion as LtlConsolidationSuggestion).involvedOfferIds.includes(offer.id) ? { ...offer, status: 'Consolidating' as const } : offer
                );
            setCargoOffersList(newOffers);
            await apiService.updateData('cargo', newOffers);
             apiService.addBlockchainEvent({
                eventType: 'LTL_CONSOLIDATION_ACTIONED',
                details: { suggestionId, involvedOfferIds: (suggestion as LtlConsolidationSuggestion).involvedOfferIds },
                relatedEntityId: suggestionId,
                actorId: 'system'
            });
        }
        // Similar event could be logged for FTL_BACKHAUL if an offer is assigned
    }
  };

  const handleOptimizeRoute = useCallback(async () => {
    if (!routeOrigin || !routeDestination) {
      setErrorRoute('Por favor, ingrese origen y destino.');
      return;
    }
    setIsLoadingRoute(true);
    setErrorRoute(null);
    setOptimizedRoute(null);

    try {
      const prompt = `Eres un experto en logística de transporte terrestre en Chile. Optimiza una ruta para un camión de carga desde ${routeOrigin} hasta ${routeDestination}. Considera factores como distancia, tiempo estimado de viaje, posibles peajes, condiciones de carretera típicas, y seguridad. Adicionalmente, incluye un resumen de la ruta, consideraciones clave, posibles riesgos y una alternativa breve si es relevante. Formato JSON: {"route_name": "string", "summary_description": "string", "estimated_distance_km": "string", "estimated_duration_hours": "string", "estimated_fuel_liters": "string", "estimated_savings_fuel_percent": number, "estimated_time_reduction_hours": number, "key_considerations": ["string"], "potential_risks_on_route": ["string"], "alternative_route_brief_summary": "string"}`;
      const result = await geminiService.generateText(prompt, { 
          responseMimeType: "application/json",
          disableThinking: true 
      });
      const parsedData = geminiService.parseJsonFromGeminiResponse<GeminiRouteSuggestion>(result);
      
      if (parsedData) {
        setOptimizedRoute(parsedData);
      } else {
        setErrorRoute("Error al procesar la respuesta de la IA para la ruta. Formato no esperado.");
      }
    } catch (err) {
      console.error("Error al optimizar la ruta:", err);
      setErrorRoute(DEFAULT_ERROR_MESSAGE);
    } finally {
      setIsLoadingRoute(false);
    }
  }, [routeOrigin, routeDestination]);

  const handleFindForwardHaulOpportunities = useCallback(async () => {
    const vehicle = vehiclesList.find(v => v.id === selectedVehicleForForwardHaul);
    if (!vehicle || !vehicleIntendedDestination) {
        setErrorForwardHaul("Por favor, seleccione un vehículo disponible e ingrese su destino deseado.");
        return;
    }
    if (vehicle.availability !== 'Available') {
        setErrorForwardHaul("El vehículo seleccionado no está disponible actualmente.");
        return;
    }

    setIsLoadingForwardHaul(true);
    setErrorForwardHaul(null);
    setForwardHaulSuggestions([]);

    const pendingOffers = cargoOffersList.filter(offer => offer.status === 'Pending');
    if (pendingOffers.length === 0) {
        setErrorForwardHaul("No hay ofertas de carga pendientes para analizar.");
        setIsLoadingForwardHaul(false);
        return;
    }
    
    let foundSuggestions: ForwardHaulSuggestionItem[] = [];

    for (const offer of pendingOffers) {
        if (vehicle.capacityKg < offer.weightKg || vehicle.capacityM3 < offer.volumeM3) {
            continue;
        }
         if ((offer.cargoType.toLowerCase().includes('perecedero') || offer.cargoType.toLowerCase().includes('congelado')) && vehicle.type !== 'Refrigerated Truck') {
            continue;
        }

        const prompt = `Analiza si la Oferta de Carga ID=${offer.id} (Origen=${offer.origin}, Destino=${offer.destination}, Tipo Carga=${offer.cargoType}, Peso=${offer.weightKg}kg, Volumen=${offer.volumeM3}m³, Recogida=${offer.pickupDate}) es compatible como carga de IDA (forward haul) para el Vehículo ID=${vehicle.id} (Tipo=${vehicle.type}, Capacidad=${vehicle.capacityKg}kg / ${vehicle.capacityM3}m³, Ubicación Actual=${vehicle.currentLocation}) cuyo destino final deseado es ${vehicleIntendedDestination}.
        Considera lo siguiente:
        1. ¿El origen de la carga (${offer.origin}) es razonablemente cercano a la ubicación actual del vehículo (${vehicle.currentLocation}) para ser recogido *como primera etapa de un viaje que inicia desde ${vehicle.currentLocation}*?
        2. ¿El destino de la carga (${offer.destination}) está en una ruta lógica hacia el destino final del vehículo (${vehicleIntendedDestination}), es un punto intermedio, o coincide con él?
        3. Esta NO debe ser una carga de retorno (backhaul). Se busca una carga para el viaje principal de ida.
        4. ¿Las fechas de recogida y entrega son razonables en este contexto?
        Responde estrictamente en formato JSON con la siguiente estructura: {"is_compatible_for_forward_haul": boolean, "reasoning": "string detallando por qué es o no compatible", "pickup_feasibility_notes": "string sobre la recogida", "delivery_alignment_notes": "string sobre la alineación de la entrega con la ruta del vehículo"}`;

        try {
            const result = await geminiService.generateText(prompt, { responseMimeType: "application/json" });
            const aiAnalysis = geminiService.parseJsonFromGeminiResponse<GeminiForwardHaulResponse>(result);

            if (aiAnalysis && aiAnalysis.is_compatible_for_forward_haul) {
                foundSuggestions.push({ cargoOffer: offer, aiAnalysis });
            }
        } catch (err) {
            console.error(`Error analizando forward haul para oferta ${offer.id}:`, err);
        }
    }

    setForwardHaulSuggestions(foundSuggestions);
    if (foundSuggestions.length === 0 && !errorForwardHaul) { // Only set this if no other error occurred
        setErrorForwardHaul("No se encontraron cargas de ida compatibles según el análisis de IA. Pruebe con otro destino o vehículo.");
    }
    setIsLoadingForwardHaul(false);

  }, [selectedVehicleForForwardHaul, vehicleIntendedDestination, vehiclesList, cargoOffersList]);

  const handleAssignForwardHaul = async (cargoOfferId: string) => {
    const vehicle = vehiclesList.find(v => v.id === selectedVehicleForForwardHaul);
    if (!vehicle) {
        setErrorForwardHaul("No se pudo encontrar el vehículo seleccionado para asignar la carga.");
        return;
    }
    await assignCargoToVehicle(cargoOfferId, vehicle.id); 
    
    setForwardHaulSuggestions([]); 
    setSelectedVehicleForForwardHaul('');
    setVehicleIntendedDestination('');
  };

  const getStatusColor = (status: CargoOffer['status'] | Vehicle['availability']) => {
    switch (status) {
      case 'Pending': return 'text-yellow-400';
      case 'Matched': return 'text-sky-400';
      case 'Consolidating': return 'text-purple-400';
      case 'In Transit': return 'text-blue-400';
      case 'Delivered': return 'text-green-400';
      case 'Available': return 'text-green-400';
      case 'On Trip': return 'text-orange-400';
      case 'Maintenance': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (isPageLoading) {
    return <div className="text-center p-10 text-white">Cargando datos de orquestación...</div>;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Ofertas de Carga Disponibles */}
      <section className={cardBaseStyle}>
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
          <PackageIconPhosphor className="h-6 w-6 sm:h-7 sm:w-7 mr-2 text-blue-400" /> Ofertas de Carga Disponibles
        </h2>
        {cargoOffersList.filter(offer => offer.status === 'Pending' || offer.status === 'Consolidating').length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-h-[500px] overflow-y-auto pr-2">
            {cargoOffersList.filter(offer => offer.status === 'Pending' || offer.status === 'Consolidating').map(offer => (
              <div key={offer.id} className={`p-3 sm:p-4 rounded-xl border transition-all ${selectedCargoForMatching?.id === offer.id ? 'bg-blue-500/20 border-blue-500' : 'bg-[#1f2328] border-[#40474f] hover:border-blue-500/50'}`}>
                <h3 className="font-semibold text-blue-300 text-base sm:text-lg">{offer.id} - {offer.origin} a {offer.destination}</h3>
                <p className="text-xs sm:text-sm text-[#a2abb3]">Tipo: {offer.cargoType}</p>
                <p className="text-xs sm:text-sm text-[#a2abb3]">Peso: {offer.weightKg} kg, Volumen: {offer.volumeM3} m³</p>
                <p className="text-xs sm:text-sm text-[#a2abb3]">Recogida: {offer.pickupDate}</p>
                <p className={`text-xs sm:text-sm font-medium mt-1 ${getStatusColor(offer.status)}`}>Estado: {offer.status}</p>
                <button
                  onClick={() => handleSearchVehicleClick(offer)}
                  disabled={offer.status !== 'Pending'}
                  className={`${buttonSecondaryStyle} mt-2 sm:mt-3 text-xs sm:text-sm w-full`}
                >
                  <TruckIconPhosphor className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" /> Buscar Vehículo
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#a2abb3]/80 text-sm sm:text-base">No hay ofertas de carga pendientes o en consolidación en este momento.</p>
        )}
      </section>

      {/* Vehículos Disponibles */}
      <section className={cardBaseStyle}>
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
          <TruckIconPhosphor className="h-6 w-6 sm:h-7 sm:w-7 mr-2 text-green-400" /> 
          {isVehicleFilterActive && selectedCargoForMatching ? `Vehículos Compatibles para ${selectedCargoForMatching.id}` : 'Vehículos Disponibles'}
        </h2>
        {isVehicleFilterActive && (
             <button onClick={handleClearVehicleFilter} className={`${buttonSecondaryStyle} mb-3 sm:mb-4 text-xs sm:text-sm w-full sm:w-auto`}>
                Limpiar Filtro y ver todos los disponibles
            </button>
        )}
        {displayedVehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-h-[400px] overflow-y-auto pr-2">
            {displayedVehicles.map(vehicle => (
              <div key={vehicle.id} className="p-3 sm:p-4 rounded-xl bg-[#1f2328] border border-[#40474f] hover:border-green-500/50 transition-colors">
                <h3 className="font-semibold text-green-300 text-base sm:text-lg">{vehicle.id} - {vehicle.type}</h3>
                <p className="text-xs sm:text-sm text-[#a2abb3]">Capacidad: {vehicle.capacityKg} kg / {vehicle.capacityM3} m³</p>
                <p className="text-xs sm:text-sm text-[#a2abb3]">Ubicación: {vehicle.currentLocation}</p>
                {vehicle.driverName && <p className="text-xs sm:text-sm text-[#a2abb3]">Conductor: {vehicle.driverName}</p>}
                <p className={`text-xs sm:text-sm font-medium mt-1 ${getStatusColor(vehicle.availability)}`}>Disponibilidad: {vehicle.availability}</p>
                {isVehicleFilterActive && selectedCargoForMatching && (
                  <button
                    onClick={() => handleAssignCargoClick(vehicle)}
                    disabled={selectedCargoForMatching.status !== 'Pending'}
                    className={`${buttonPrimaryStyle} mt-2 sm:mt-3 text-xs sm:text-sm w-full`}
                  >
                    <PackageIconPhosphor className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" /> Asignar a {selectedCargoForMatching.id}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#a2abb3]/80 text-sm sm:text-base">
            {isVehicleFilterActive ? 'No se encontraron vehículos compatibles para la carga seleccionada.' : 'No hay vehículos disponibles en este momento.'}
          </p>
        )}
      </section>

      {/* Consolidación Inteligente de Carga */}
      <section className={cardBaseStyle}>
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
            <ZapIcon className="h-6 w-6 sm:h-7 sm:w-7 mr-2 text-purple-400" /> Consolidación Inteligente
        </h2>
        <button
            onClick={handleFindConsolidationOpportunities}
            disabled={isLoadingSuggestions}
            className={`${buttonPrimaryStyle} bg-purple-600 hover:bg-purple-700 mb-3 sm:mb-4 w-full`}
        >
            {isLoadingSuggestions ? (
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : <ZapIcon className="h-5 w-5 mr-2" />}
            {isLoadingSuggestions ? 'Buscando Oportunidades...' : 'Analizar Oportunidades con IA'}
        </button>
        {errorSuggestions && <p className="text-red-400 text-xs sm:text-sm mb-2 sm:mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded-md">{errorSuggestions}</p>}
        
        {consolidationSuggestions.length > 0 ? (
            <div className="space-y-3 sm:space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {consolidationSuggestions.map(suggestion => (
                    <div key={suggestion.id} className="p-3 sm:p-4 rounded-xl bg-[#1f2328] border border-purple-500/30">
                        <h3 className="font-semibold text-purple-300 text-base sm:text-lg">
                            {suggestion.type === 'LTL_CONSOLIDATION' ? 'Sugerencia: Consolidación LTL' : 'Sugerencia: Backhaul FTL'}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#a2abb3] mt-1 italic">"{suggestion.aiAnalysis.suggestion_description}"</p>
                        <div className="mt-2 text-xs sm:text-sm space-y-1">
                            <p><strong className="text-purple-200">Beneficio Potencial:</strong> {suggestion.aiAnalysis.potential_benefit}</p>
                            <p><strong className="text-purple-200/80">Análisis IA:</strong> {suggestion.aiAnalysis.reasoning}</p>
                            {suggestion.type === 'LTL_CONSOLIDATION' && (
                                <p><strong className="text-purple-200/80">Cargas Involucradas:</strong> {(suggestion as LtlConsolidationSuggestion).involvedOfferIds.join(', ')}</p>
                            )}
                            {suggestion.type === 'FTL_BACKHAUL' && (
                                <p><strong className="text-purple-200/80">Activos:</strong> Vehículo {(suggestion as FtlBackhaulSuggestion).vehicleId}, Carga {(suggestion as FtlBackhaulSuggestion).offerId}</p>
                            )}
                        </div>
                        <div className="mt-2 sm:mt-3 pt-2 border-t border-purple-500/20 flex flex-col sm:flex-row gap-2 items-center">
                           <p className="text-xs sm:text-sm font-medium flex-1">Estado: <span className="text-purple-200">{suggestion.status}</span></p>
                           <div className="flex gap-2 w-full sm:w-auto">
                                {suggestion.status !== 'ACTIONED' && suggestion.status !== 'DISMISSED' && (
                                    <>
                                        <button onClick={() => updateSuggestionStatus(suggestion.id, 'ACTIONED')} className={`${buttonPrimaryStyle} !bg-green-600 hover:!bg-green-700 text-xs !py-1.5 flex-1`}>Accionar</button>
                                        <button onClick={() => updateSuggestionStatus(suggestion.id, 'DISMISSED')} className={`${buttonSecondaryStyle} !bg-red-800 hover:!bg-red-700 text-xs !py-1.5 flex-1`}>Descartar</button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
           !isLoadingSuggestions && !errorSuggestions &&
            <p className="text-[#a2abb3]/80 text-sm sm:text-base text-center py-3">Presione el botón para buscar oportunidades de consolidación.</p>
        )}
      </section>

      {/* Planificador de Rutas con IA */}
      <section className={cardBaseStyle}>
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
          <RouteIcon className="h-6 w-6 sm:h-7 sm:w-7 mr-2 text-teal-400" /> Planificador de Rutas con IA
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div>
            <label htmlFor="routeOrigin" className={labelStyle}>Origen:</label>
            <input type="text" id="routeOrigin" value={routeOrigin} onChange={(e) => setRouteOrigin(e.target.value)} className={inputStyle} placeholder="Ej: Santiago"/>
          </div>
          <div>
            <label htmlFor="routeDestination" className={labelStyle}>Destino:</label>
            <input type="text" id="routeDestination" value={routeDestination} onChange={(e) => setRouteDestination(e.target.value)} className={inputStyle} placeholder="Ej: Valparaíso"/>
          </div>
        </div>
        <button
          onClick={handleOptimizeRoute}
          disabled={isLoadingRoute}
          className={`${buttonPrimaryStyle} bg-teal-600 hover:bg-teal-700 w-full`}
        >
          {isLoadingRoute ? (
             <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
          ): <ZapIcon className="h-5 w-5 mr-2"/>}
          {isLoadingRoute ? 'Optimizando...' : 'Buscar Ruta Optimizada con IA'}
        </button>
        {errorRoute && <p className="text-red-400 text-xs sm:text-sm mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-md">{errorRoute}</p>}
        {optimizedRoute && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-teal-500/10 border border-teal-500/30 rounded-xl">
            <h3 className="text-base sm:text-lg font-semibold text-teal-300 mb-2">
              Ruta Sugerida: {optimizedRoute.route_name || `${routeOrigin} a ${routeDestination}`}
            </h3>
            <p className="text-xs sm:text-sm text-[#a2abb3] mb-3 italic">
              {optimizedRoute.summary_description}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm border-t border-teal-500/20 pt-3">
              {optimizedRoute.estimated_distance_km && <div className="flex justify-between"><span>Distancia:</span><strong className="text-white">{optimizedRoute.estimated_distance_km}</strong></div>}
              {optimizedRoute.estimated_duration_hours && <div className="flex justify-between"><span>Duración:</span><strong className="text-white">{optimizedRoute.estimated_duration_hours}</strong></div>}
              {optimizedRoute.estimated_fuel_liters && <div className="flex justify-between"><span>Combustible Est.:</span><strong className="text-white">{optimizedRoute.estimated_fuel_liters}</strong></div>}
              {optimizedRoute.estimated_savings_fuel_percent && <div className="flex justify-between text-green-400"><span>Ahorro Combustible:</span><strong>{optimizedRoute.estimated_savings_fuel_percent}%</strong></div>}
              {optimizedRoute.estimated_time_reduction_hours && <div className="flex justify-between text-green-400"><span>Ahorro Tiempo:</span><strong>{optimizedRoute.estimated_time_reduction_hours} hrs</strong></div>}
            </div>

            {optimizedRoute.key_considerations && optimizedRoute.key_considerations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-teal-500/20">
                    <h4 className="font-medium text-teal-200 mb-1 text-sm">Consideraciones Clave:</h4>
                    <ul className="list-disc list-inside text-xs sm:text-sm text-[#a2abb3] space-y-1">
                        {optimizedRoute.key_considerations.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
            )}
            {optimizedRoute.potential_risks_on_route && optimizedRoute.potential_risks_on_route.length > 0 && (
                 <div className="mt-3 pt-3 border-t border-teal-500/20">
                    <h4 className="font-medium text-yellow-300 mb-1 text-sm">Riesgos Potenciales:</h4>
                    <ul className="list-disc list-inside text-xs sm:text-sm text-[#a2abb3] space-y-1">
                        {optimizedRoute.potential_risks_on_route.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
            )}
            {optimizedRoute.alternative_route_brief_summary && (
                <div className="mt-3 pt-3 border-t border-teal-500/20">
                    <h4 className="font-medium text-teal-200 mb-1 text-sm">Ruta Alternativa:</h4>
                    <p className="text-xs sm:text-sm text-[#a2abb3] italic">{optimizedRoute.alternative_route_brief_summary}</p>
                </div>
            )}
          </div>
        )}
      </section>

       {/* Nueva Sección: Buscar Carga de Ida para Mi Ruta (Forward Haul) */}
      <section className={cardBaseStyle}>
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
          <RouteIcon className="h-6 w-6 sm:h-7 sm:w-7 mr-2 text-orange-400" /> Buscar Carga de Ida para Mi Ruta
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div>
            <label htmlFor="selectedVehicleForwardHaul" className={labelStyle}>Seleccione su Vehículo (Disponible):</label>
            <select
              id="selectedVehicleForwardHaul"
              value={selectedVehicleForForwardHaul}
              onChange={(e) => setSelectedVehicleForForwardHaul(e.target.value)}
              className={inputStyle}
            >
              <option value="">-- Elija un vehículo --</option>
              {vehiclesList.filter(v => v.availability === 'Available').map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.id} - {vehicle.type} (En: {vehicle.currentLocation})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="vehicleIntendedDestination" className={labelStyle}>Destino Final Deseado del Vehículo:</label>
            <input
              type="text"
              id="vehicleIntendedDestination"
              value={vehicleIntendedDestination}
              onChange={(e) => setVehicleIntendedDestination(e.target.value)}
              className={inputStyle}
              placeholder="Ej: Arica, Puerto Montt, etc."
            />
          </div>
        </div>
        <button
          onClick={handleFindForwardHaulOpportunities}
          disabled={isLoadingForwardHaul || !selectedVehicleForForwardHaul || !vehicleIntendedDestination}
          className={`${buttonPrimaryStyle} bg-orange-600 hover:bg-orange-700 w-full`}
        >
          {isLoadingForwardHaul ? (
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : <ZapIcon className="h-5 w-5 mr-2" />}
          {isLoadingForwardHaul ? 'Buscando Cargas...' : 'Buscar Cargas de Ida con IA'}
        </button>
        {errorForwardHaul && <p className="text-red-400 text-xs sm:text-sm mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-md">{errorForwardHaul}</p>}
        
        {forwardHaulSuggestions.length > 0 && (
          <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-orange-300 mb-2">Cargas de Ida Sugeridas:</h3>
            {forwardHaulSuggestions.map(({ cargoOffer, aiAnalysis }) => (
              <div key={cargoOffer.id} className="p-3 sm:p-4 rounded-xl bg-[#1f2328] border border-orange-500/30">
                <h4 className="font-semibold text-orange-200 text-sm sm:text-base">{cargoOffer.id}: {cargoOffer.origin} &rarr; {cargoOffer.destination}</h4>
                <p className="text-xs text-[#a2abb3]">Tipo: {cargoOffer.cargoType}, Peso: {cargoOffer.weightKg}kg, Vol: {cargoOffer.volumeM3}m³</p>
                <p className="text-xs text-[#a2abb3]">Recogida: {cargoOffer.pickupDate}, Entrega: {cargoOffer.deliveryDate}</p>
                <div className="mt-2 p-2 bg-orange-500/10 border border-orange-500/20 rounded-md text-xs">
                    <p className="font-medium text-orange-200">Análisis IA de Compatibilidad:</p>
                    <p className="text-[#a2abb3]">{aiAnalysis.reasoning}</p>
                    {aiAnalysis.pickup_feasibility_notes && <p className="mt-1">Recogida: {aiAnalysis.pickup_feasibility_notes}</p>}
                    {aiAnalysis.delivery_alignment_notes && <p className="mt-1">Entrega: {aiAnalysis.delivery_alignment_notes}</p>}
                </div>
                <button
                  onClick={() => handleAssignForwardHaul(cargoOffer.id)}
                  className={`${buttonSecondaryStyle} mt-2 sm:mt-3 text-xs sm:text-sm w-full !bg-orange-500 hover:!bg-orange-600`}
                >
                  <PackageIconPhosphor className="h-4 w-4 mr-1"/> Asignar esta Carga a Mi Viaje
                </button>
              </div>
            ))}
          </div>
        )}
         { !isLoadingForwardHaul && forwardHaulSuggestions.length === 0 && !errorForwardHaul && selectedVehicleForForwardHaul && vehicleIntendedDestination &&
            <p className="text-[#a2abb3]/80 text-sm sm:text-base text-center py-3">Presione el botón para buscar cargas de ida compatibles.</p>
        }
      </section>

    </div>
  );
};

export default LoadOrchestrationPage;