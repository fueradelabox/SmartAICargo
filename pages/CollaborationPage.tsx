
import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, PlatformSettings, UserPreferences, MockUserCredentials, CarrierProfileDetails, BlockchainEvent } from '../types'; 
import { 
    UsersIcon, 
    LockIcon, 
    InfoIconPhosphor, 
    BriefcaseIcon,
    ClosePhosphorIcon,
    CheckCircleIcon,
    UserCircleIcon,
} from '../components/icons';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';

const initialMockUserPreferences: UserPreferences = {
  language: 'es',
  notifications: { email: true, inApp: true, sms: false },
  theme: 'dark',
};

const emptyUserForm: Partial<UserProfile & { password?: string }> = {
  name: '',
  id: '',
  email: '',
  role: 'Shipper',
  companyName: '',
  status: 'Active',
  certifications: [],
  preferences: {...initialMockUserPreferences},
  carrierProfileDetails: undefined,
  rating: 0,
  completedTrips: 0,
  avatarUrl: '',
  password: ''
};


const SettingsPage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('profile');
  
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);
  const [blockchainLog, setBlockchainLog] = useState<BlockchainEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [userFormData, setUserFormData] = useState<Partial<UserProfile & { password?: string }>>(emptyUserForm);

  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
        setIsLoading(true);
        if (currentUser?.role === 'Admin') {
            const [usersRes, settingsRes, logRes] = await Promise.all([
                apiService.getUsers(),
                apiService.getData<PlatformSettings>('settings'),
                apiService.getData<BlockchainEvent[]>('blockchain')
            ]);
            if(usersRes.success) setUsersList(usersRes.data!);
            if(settingsRes.success) setPlatformSettings(settingsRes.data!);
            if(logRes.success) setBlockchainLog(logRes.data!);
        } else {
             const settingsRes = await apiService.getData<PlatformSettings>('settings');
             if(settingsRes.success) setPlatformSettings(settingsRes.data!);
        }
        setIsLoading(false);
    };
    loadData();
  }, [currentUser]);


  const cardBaseStyle = "bg-[#1a1f25] border border-[#40474f] shadow-lg rounded-xl p-4 sm:p-6 text-white";
  const inputStyle = "mt-1 block w-full px-3 py-2 border border-[#40474f] rounded-md shadow-sm focus:outline-none focus:ring-[#3f7fbf] focus:border-[#3f7fbf] sm:text-sm bg-[#1f2328] text-white placeholder-[#a2abb3]/70";
  const labelStyle = "block text-sm font-medium text-[#a2abb3]";
  const buttonPrimaryStyle = "w-full sm:w-auto bg-[#3f7fbf] hover:bg-[#3f7fbf]/80 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md transition duration-150 disabled:opacity-60 flex items-center justify-center mobile-tap-target";
  const buttonSecondaryStyle = "w-full sm:w-auto bg-[#2c3035] hover:bg-[#40474f] text-white font-semibold py-2.5 px-4 rounded-xl shadow-md transition duration-150 disabled:opacity-60 flex items-center justify-center mobile-tap-target";

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (message: string) => setToastMessage(message);

  const adminTabs = [ 
    { id: 'users', label: 'Gestión de Usuarios', icon: UsersIcon },
    { id: 'blockchainlog', label: 'Log Blockchain (Sim.)', icon: LockIcon },
    { id: 'general', label: 'Info. Plataforma', icon: InfoIconPhosphor },
  ];

  const userTabs = [
    { id: 'profile', label: 'Mi Perfil', icon: UserCircleIcon },
    { id: 'tools', label: 'Herramientas Colab.', icon: BriefcaseIcon },
  ];

  const tabItems = currentUser?.role === 'Admin' ? adminTabs : userTabs;
  
  // Set initial tab based on role
  useEffect(() => {
      setActiveTab(currentUser?.role === 'Admin' ? 'users' : 'profile');
  }, [currentUser]);

  const handleOpenUserModal = (user: UserProfile | null = null) => {
    if (currentUser?.role !== 'Admin') return;
    if (user) {
      setEditingUser(user);
      setUserFormData({ ...user, password: '' });
    } else {
      setEditingUser(null);
      setUserFormData({ ...emptyUserForm, id: `newuser_${Math.random().toString(36).substring(2, 9)}`, preferences: {...initialMockUserPreferences} });
    }
    setIsUserModalOpen(true);
  };

  const handleCloseUserModal = () => setIsUserModalOpen(false);

  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveUser = async () => {
    if (currentUser?.role !== 'Admin') return;
    if (!userFormData.name || !userFormData.id || !userFormData.email || !userFormData.role || !userFormData.companyName) {
        showToast("Error: Complete los campos obligatorios.");
        return;
    }
     if (!editingUser && !userFormData.password) { 
        showToast("Error: La contraseña es obligatoria para nuevos usuarios.");
        return;
    }

    const finalUserData: UserProfile = {
      id: userFormData.id!, 
      name: userFormData.name!,
      email: userFormData.email!,
      role: userFormData.role!,
      companyName: userFormData.companyName!,
      status: userFormData.status as UserProfile['status'] || 'Active',
      certifications: userFormData.certifications || [],
      preferences: userFormData.preferences || { ...initialMockUserPreferences },
      rating: editingUser ? editingUser.rating : Math.round((3 + Math.random() * 2) * 10) / 10,
      completedTrips: editingUser ? editingUser.completedTrips : 0,
      avatarUrl: editingUser ? editingUser.avatarUrl : `https://ui-avatars.com/api/?name=${encodeURIComponent(userFormData.name!)}&background=random&color=FFFFFF&font-size=0.5&length=2`,
      carrierProfileDetails: userFormData.carrierProfileDetails,
    };

    if (editingUser) {
      const res = await apiService.updateUser(finalUserData);
      if (res.success) {
          setUsersList(prev => prev.map(u => u.id === editingUser.id ? finalUserData : u));
          showToast("Usuario actualizado.");
      } else {
          showToast(res.message || "Error al actualizar.");
      }
    } else { 
      const registerData: MockUserCredentials = {
          ...finalUserData,
          username: finalUserData.id,
          password: userFormData.password!
      };
      const res = await apiService.register(registerData);
      if (res.success) {
          setUsersList(prev => [...prev, res.data!]);
          showToast("Usuario creado.");
      } else {
          showToast(res.message || "Error al crear.");
      }
    }
    handleCloseUserModal();
  };
  
  const handleChangeUserStatus = async (userId: string, newStatus: UserProfile['status']) => {
    const res = await apiService.changeUserStatus(userId, newStatus);
    if(res.success) {
        setUsersList(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        showToast(`Estado del usuario actualizado.`);
    } else {
        showToast(res.message || "Error al cambiar estado.");
    }
  };

  const filteredUsers = useMemo(() => usersList.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  ), [usersList, searchTerm]);
  
  if (isLoading || !platformSettings) {
      return <div className="text-center p-10">Cargando configuración...</div>;
  }

  const renderUserProfile = () => (
    <div className="space-y-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
            <img src={currentUser?.avatarUrl} alt={currentUser?.name} className="w-20 h-20 rounded-full border-4 border-[#40474f]" />
            <div>
                <h3 className="text-2xl font-bold text-white">{currentUser?.name}</h3>
                <p className="text-lg text-[#a2abb3]">{currentUser?.companyName}</p>
                <p className="text-sm text-indigo-400 font-semibold">{currentUser?.role}</p>
            </div>
        </div>
        <div className="bg-[#1f2328] p-4 rounded-xl border border-[#40474f]">
            <h4 className="text-lg font-semibold text-white mb-2">Detalles</h4>
            <p><strong className={labelStyle}>Email:</strong> {currentUser?.email}</p>
            <p><strong className={labelStyle}>Reputación:</strong> <span className="text-yellow-400">{'★'.repeat(Math.floor(currentUser!.rating))}{'☆'.repeat(5 - Math.floor(currentUser!.rating))} ({currentUser?.rating.toFixed(1)})</span></p>
            <p><strong className={labelStyle}>Viajes Completados:</strong> {currentUser?.completedTrips}</p>
            {currentUser?.certifications && currentUser.certifications.length > 0 && 
                <p><strong className={labelStyle}>Certificaciones:</strong> {currentUser.certifications.join(', ')}</p>
            }
        </div>
        <button onClick={logout} className={`${buttonSecondaryStyle} bg-red-600 hover:bg-red-700 w-full`}>Cerrar Sesión</button>
    </div>
  );

  const renderGeneralSettings = () => (
     <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Información de la Plataforma</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-[#1f2328] p-3 rounded-lg"><strong className={labelStyle}>Nombre:</strong> {platformSettings.platformName}</div>
            <div className="bg-[#1f2328] p-3 rounded-lg"><strong className={labelStyle}>Versión:</strong> {platformSettings.platformVersion}</div>
            <div className="bg-[#1f2328] p-3 rounded-lg"><strong className={labelStyle}>Email Contacto:</strong> {platformSettings.adminContactEmail}</div>
            <div className="bg-[#1f2328] p-3 rounded-lg"><strong className={labelStyle}>Último Mantenimiento:</strong> {platformSettings.lastMaintenanceDate}</div>
        </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, email, empresa, o rol..."
                className={`${inputStyle} w-full sm:w-2/3 lg:w-1/2 text-sm`}
            />
            <button onClick={() => handleOpenUserModal(null)} className={`${buttonPrimaryStyle} w-full sm:w-auto`}>
                Crear Nuevo Usuario
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map(user => (
                <div key={user.id} className="bg-[#1f2328] p-4 rounded-xl border border-[#40474f] shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-start justify-between">
                            <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full mr-3 border-2 border-gray-600"/>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold text-indigo-300 mb-0.5 truncate">{user.name}</h3>
                                <p className="text-xs text-[#a2abb3] truncate">{user.email}</p>
                            </div>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${user.status === 'Active' ? 'bg-green-500/20 text-green-300' : user.status === 'Inactive' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                {user.status}
                            </span>
                        </div>
                        <p className="text-xs text-[#a2abb3]/80 mt-1.5">{user.companyName} - {user.role}</p>
                    </div>
                    <div className="mt-3 flex flex-col sm:flex-row gap-2">
                        <button onClick={() => handleOpenUserModal(user)} className={`${buttonSecondaryStyle} !text-xs !py-1.5 flex-1`}>Editar</button>
                        <select 
                            value={user.status} 
                            onChange={(e) => handleChangeUserStatus(user.id, e.target.value as UserProfile['status'])}
                            className={`${inputStyle} !text-xs !py-1.5 !mt-0 flex-1`}
                        >
                            <option value="Active">Activo</option>
                            <option value="Inactive">Inactivo</option>
                            <option value="PendingApproval">Pendiente</option>
                        </select>
                    </div>
                </div>
            ))}
            {filteredUsers.length === 0 && <p className="text-[#a2abb3]/80 md:col-span-2 lg:col-span-3 text-center py-5">No se encontraron usuarios.</p>}
        </div>
    </div>
  );

  const renderCollaborationTools = () => (
    <div className="text-center">
        <h3 className="text-xl font-semibold text-white">Herramientas Colaborativas</h3>
        <p className="text-[#a2abb3] mt-2">Funcionalidades como mensajería segura y resolución de disputas estarán disponibles próximamente.</p>
    </div>
  );
  
  const renderBlockchainLog = () => (
    <div>
        <h3 className="text-lg font-medium text-white mb-4">Log de Eventos Blockchain (Simulado - Últimos 100)</h3>
        {blockchainLog.length === 0 ? <p className="text-[#a2abb3]/80">No hay eventos.</p> : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {blockchainLog.map(event => (
                    <div key={event.id} className="p-3 bg-[#1f2328] border border-[#40474f] rounded-lg text-xs">
                        <p className="font-semibold text-blue-300">Tipo: {event.eventType}</p>
                        <p className="text-[#a2abb3]">Timestamp: {new Date(event.timestamp).toLocaleString('es-CL')}</p>
                        <details className="mt-1 text-[#a2abb3]">
                            <summary className="cursor-pointer text-blue-400 hover:underline text-xs">Detalles</summary>
                            <pre className="mt-1 p-2 bg-[#2c3035] rounded text-xs overflow-x-auto">{JSON.stringify(event.details, null, 2)}</pre>
                        </details>
                    </div>
                ))}
            </div>
        )}
    </div>
  );

  return (
    <div className={`${cardBaseStyle} relative`}>
      {toastMessage && <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg text-sm flex items-center"><CheckCircleIcon className="h-5 w-5 mr-2" />{toastMessage}</div>}
      <div className="mb-6 border-b border-[#40474f]">
        <nav className="-mb-px flex flex-wrap gap-x-4 gap-y-2" aria-label="Tabs">
          {tabItems.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm mobile-tap-target flex items-center gap-2 ${activeTab === tab.id ? 'border-blue-500 text-blue-400' : 'border-transparent text-[#a2abb3] hover:text-white hover:border-gray-500'}`}>
              <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-blue-400' : 'text-[#a2abb3]'}`}/> {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {activeTab === 'profile' && renderUserProfile()}
        {activeTab === 'general' && renderGeneralSettings()}
        {activeTab === 'users' && renderUserManagement()}
        {activeTab === 'tools' && renderCollaborationTools()}
        {activeTab === 'blockchainlog' && renderBlockchainLog()}
      </div>

      {isUserModalOpen && currentUser?.role === 'Admin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={handleCloseUserModal}>
          <div className={`${cardBaseStyle} w-full max-w-lg max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold text-white">{editingUser ? 'Editar Usuario' : 'Crear Usuario'}</h2>
            {/* Modal Content... */}
             <div className="space-y-4 text-sm mt-4">
              <div><label className={labelStyle}>Nombre:</label><input type="text" name="name" value={userFormData.name || ''} onChange={handleUserFormChange} className={inputStyle} /></div>
              <div><label className={labelStyle}>ID/Username:</label><input type="text" name="id" value={userFormData.id || ''} onChange={handleUserFormChange} className={inputStyle} disabled={!!editingUser} /></div>
              {!editingUser && (<div><label className={labelStyle}>Contraseña:</label><input type="password" name="password" value={userFormData.password || ''} onChange={handleUserFormChange} className={inputStyle} /></div>)}
              <div><label className={labelStyle}>Email:</label><input type="email" name="email" value={userFormData.email || ''} onChange={handleUserFormChange} className={inputStyle} /></div>
              <div><label className={labelStyle}>Compañía:</label><input type="text" name="companyName" value={userFormData.companyName || ''} onChange={handleUserFormChange} className={inputStyle} /></div>
              <div><label className={labelStyle}>Rol:</label>
                <select name="role" value={userFormData.role} onChange={handleUserFormChange} className={inputStyle}>
                  <option value="Shipper">Shipper</option><option value="Carrier">Carrier</option><option value="Admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
              <button onClick={handleCloseUserModal} className={buttonSecondaryStyle}>Cancelar</button>
              <button onClick={handleSaveUser} className={buttonPrimaryStyle}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
