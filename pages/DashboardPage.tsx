
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, TruckIconPhosphor, WarningCircleIcon, UsersIcon, PackageIconPhosphor, GearIcon, IdentificationBadgeIcon, ZapIcon, LeafIcon } from '../components/icons'; 
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { UserProfile, CargoOffer } from '../types';

interface KeyMetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative';
  description?: string;
}

const KeyMetricCard: React.FC<KeyMetricCardProps> = ({ title, value, change, changeType, description }) => (
  <div className="flex w-full min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-4 sm:p-6 border border-[#40474f]">
    <p className="text-white text-sm sm:text-base font-medium leading-normal">{title}</p>
    <p className="text-white tracking-light text-xl sm:text-2xl font-bold leading-tight">{value}</p>
    {change && (
      <p className={`text-xs sm:text-base font-medium leading-normal ${changeType === 'positive' ? 'text-[#0bda5b]' : 'text-[#fa6238]'}`}>
        {change}
      </p>
    )}
    {description && <p className="text-xs text-[#a2abb3] mt-1">{description}</p>}
  </div>
);

const mockActivities: { icon: React.FC<React.SVGProps<SVGSVGElement>>; text: string; time: string; roles: Array<'Admin' | 'Shipper' | 'Carrier'>}[] = [
  { icon: CheckCircleIcon, text: "Envío #54321 - Entregado por Transportes Veloz", time: "Hace 3 horas", roles: ['Admin', 'Shipper'] }, 
  { icon: TruckIconPhosphor, text: "Nueva Carga Disponible - Ruta: Santiago a Valparaíso", time: "Hace 5 horas", roles: ['Admin', 'Carrier'] },
  { icon: WarningCircleIcon, text: "Alerta: Retraso en Envío #09876", time: "Hace 7 horas", roles: ['Admin', 'Shipper'] },
  { icon: TruckIconPhosphor, text: "Envío #65432 - En Tránsito, asignado a Camiones del Sur", time: "Hace 9 horas", roles: ['Admin', 'Shipper', 'Carrier']},
  { icon: UsersIcon, text: "Nuevo transportista 'Transportes Andes' registrado", time: "Hace 1 día", roles: ['Admin']},
];

interface QuickAction {
  label: string;
  path: string; 
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  style: string;
  roles: Array<'Admin' | 'Shipper' | 'Carrier'>;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [metrics, setMetrics] = useState<KeyMetricCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) return;
      setIsLoading(true);
      
      const userRes = await apiService.getUsers();
      const cargoRes = await apiService.getData<CargoOffer[]>('cargo');

      const userCount = userRes.success ? userRes.data!.length : 0;
      const allCargo = cargoRes.success ? cargoRes.data! : [];
      
      let keyMetrics: KeyMetricCardProps[] = [];

      // Generic metrics for all roles
      keyMetrics.push({ title: "Salud del Sistema", value: "Óptima", change: "99.9% Uptime", changeType: "positive" });

      if (currentUser.role === 'Admin') {
        const activeCargoCount = allCargo.filter(c => ['Pending', 'Matched', 'In Transit'].includes(c.status)).length;
        keyMetrics.unshift(
          { title: "Total Usuarios", value: `${userCount}`, change: "+2 hoy", changeType: "positive" },
          { title: "Cargas Activas", value: `${activeCargoCount}`, description: "Ofertas y envíos en curso" },
          { title: "Rutas Optimizadas", value: "27", description: "Mediante IA hoy" }
        );
      }
      
      if (currentUser.role === 'Shipper') {
        const myOffers = allCargo.filter(c => c.shipperId === currentUser.id);
        const myPending = myOffers.filter(c => c.status === 'Pending').length;
        const myInTransit = myOffers.filter(c => c.status === 'In Transit').length;
        keyMetrics.unshift(
          { title: "Mis Cargas Pendientes", value: `${myPending}` },
          { title: "Mis Envíos en Tránsito", value: `${myInTransit}` }
        );
      }

      if (currentUser.role === 'Carrier') {
        const pendingOffers = allCargo.filter(c => c.status === 'Pending').length;
         keyMetrics.unshift(
          { title: "Ofertas Disponibles", value: `${pendingOffers}`, description: "Cargas esperando transporte" },
          { title: "Mi Reputación", value: `${currentUser.rating} ★`, change: `${currentUser.completedTrips} viajes`, changeType: 'positive' }
        );
      }
      
      setMetrics(keyMetrics);
      setIsLoading(false);
    };

    fetchDashboardData();
  }, [currentUser]);

  const quickActions: QuickAction[] = [
      { label: "Gestionar Usuarios", path: "/settings", icon: UsersIcon, style: "bg-blue-600 hover:bg-blue-700", roles: ['Admin'] },
      { label: "Crear Oferta de Carga", path: "/loads", icon: PackageIconPhosphor, style: "bg-green-600 hover:bg-green-700", roles: ['Shipper'] },
      { label: "Buscar Cargas", path: "/loads", icon: TruckIconPhosphor, style: "bg-blue-600 hover:bg-blue-700", roles: ['Carrier'] },
      { label: "Ver Mis Envíos", path: "/shipments", icon: TruckIconPhosphor, style: "bg-[#2c3035] hover:bg-[#40474f]", roles: ['Shipper'] },
      { label: "Ver Mis Alertas", path: "/alerts", icon: WarningCircleIcon, style: "bg-yellow-600 hover:bg-yellow-700", roles: ['Admin', 'Shipper', 'Carrier'] },
      { label: "Análisis de Sostenibilidad", path: "/analytics", icon: LeafIcon, style: "bg-teal-600 hover:bg-teal-700", roles: ['Admin', 'Shipper', 'Carrier'] },
      { label: "Mi Perfil", path: "/settings", icon: GearIcon, style: "bg-[#2c3035] hover:bg-[#40474f]", roles: ['Shipper', 'Carrier'] },
  ];

  const filteredQuickActions = quickActions.filter(action => currentUser && action.roles.includes(currentUser.role));
  const filteredActivities = mockActivities.filter(activity => currentUser && activity.roles.includes(currentUser.role)); 
  
  if (isLoading) {
      return <div className="text-center p-10">Cargando panel...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div>
        <h2 className="text-white text-xl sm:text-[22px] font-bold leading-tight tracking-[-0.015em] px-0 pb-3 pt-2">Métricas Clave</h2>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
          {metrics.map(metric => (
            <KeyMetricCard key={metric.title} {...metric} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      {filteredQuickActions.length > 0 && (
        <div>
          <h2 className="text-white text-xl sm:text-[22px] font-bold leading-tight tracking-[-0.015em] px-0 pb-3 pt-5">Acciones Rápidas</h2>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-start">
            {filteredQuickActions.map(action => (
                <button
                    key={action.label}
                    onClick={() => navigate(action.path)} 
                    className={`w-full sm:w-auto flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 sm:h-10 px-4 text-white text-sm font-bold leading-normal tracking-[0.015em] mobile-tap-target ${action.style}`}
                >
                    {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                    <span className="truncate">{action.label}</span>
                </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activities */}
      {filteredActivities.length > 0 && (
        <div>
          <h2 className="text-white text-xl sm:text-[22px] font-bold leading-tight tracking-[-0.015em] px-0 pb-3 pt-5">Actividad Reciente</h2>
          <div className="grid grid-cols-[auto_1fr] gap-x-2 sm:gap-x-3">
            {filteredActivities.map((activity, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center gap-1 pt-1">
                  {index > 0 && <div className="w-[1.5px] bg-[#40474f] h-2"></div>}
                  <activity.icon className="text-white h-5 w-5 sm:h-6 sm:w-6" />
                  {index < filteredActivities.length -1 && <div className={`w-[1.5px] bg-[#40474f] h-full ${index === 0 ? 'mt-1' : ''} grow`}></div>}
                </div>
                <div className={`flex flex-1 flex-col py-1 ${index > 0 ? 'border-t border-transparent': ''}`}>
                  <p className="text-white text-sm sm:text-base font-medium leading-normal">{activity.text}</p>
                  <p className="text-[#a2abb3] text-xs sm:text-sm font-normal leading-normal">{activity.time}</p>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
