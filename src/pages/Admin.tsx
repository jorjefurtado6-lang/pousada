import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, updateDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Room, Reservation, FAQ } from '../types';
import { LayoutDashboard, Bed, CalendarCheck, HelpCircle, Settings, LogOut, Plus, Trash2, Edit, Check, X, Database, Loader2 } from 'lucide-react';
import { seedInitialData } from '../utils/seed';
import { toast } from 'sonner';
import { format } from 'date-fns';

const Admin = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error('Acesso negado. Apenas administradores podem acessar esta área.');
      navigate('/');
    }
  }, [isAdmin, authLoading, navigate]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-stone-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-stone-900 text-white flex flex-col">
        <div className="p-8 border-b border-stone-800">
          <h2 className="text-xl font-serif font-bold tracking-tighter">Painel Admin</h2>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
            { id: 'rooms', label: 'Quartos', icon: <Bed size={20} /> },
            { id: 'reservations', label: 'Reservas', icon: <CalendarCheck size={20} /> },
            { id: 'faqs', label: 'FAQs', icon: <HelpCircle size={20} /> },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === item.id ? 'bg-amber-600 text-white' : 'text-stone-400 hover:bg-stone-800 hover:text-white'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-stone-800">
          <button 
            onClick={async () => {
              if (window.confirm('Isso irá apagar todos os quartos e FAQs atuais e criar novos dados de demonstração. Continuar?')) {
                const success = await seedInitialData(true);
                if (success) {
                  toast.success('Dados reiniciados e criados com sucesso!');
                  window.location.reload();
                } else {
                  toast.error('Erro ao criar dados.');
                }
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-amber-500 hover:bg-stone-800 transition-colors"
          >
            <Database size={16} /> Reset & Seed Data
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-grow p-12 overflow-y-auto">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'rooms' && <RoomsTab />}
        {activeTab === 'reservations' && <ReservationsTab />}
        {activeTab === 'faqs' && <FAQsTab />}
      </main>
    </div>
  );
};

const DashboardTab = () => {
  const [stats, setStats] = useState({ rooms: 0, reservations: 0, pending: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const roomsSnap = await getDocs(collection(db, 'rooms'));
      const resSnap = await getDocs(collection(db, 'reservations'));
      const reservations = resSnap.docs.map(d => d.data() as Reservation);
      setStats({
        rooms: roomsSnap.size,
        reservations: resSnap.size,
        pending: reservations.filter(r => r.status === 'pending').length
      });
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-serif font-bold">Visão Geral</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Total de Quartos', value: stats.rooms, icon: <Bed />, color: 'bg-blue-500' },
          { label: 'Reservas Totais', value: stats.reservations, icon: <CalendarCheck />, color: 'bg-green-500' },
          { label: 'Pendentes', value: stats.pending, icon: <Loader2 />, color: 'bg-amber-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">{stat.label}</p>
              <p className="text-4xl font-serif font-bold">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 ${stat.color} text-white rounded-2xl flex items-center justify-center`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RoomsTab = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'rooms'));
    setRooms(snap.docs.map(d => ({ id: d.id, ...d.data() } as Room)));
    setLoading(false);
  };

  useEffect(() => { fetchRooms(); }, []);

  const toggleStatus = async (room: Room) => {
    const newStatus = room.status === 'active' ? 'inactive' : 'active';
    await updateDoc(doc(db, 'rooms', room.id), { status: newStatus });
    fetchRooms();
    toast.success('Status atualizado!');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif font-bold">Gerenciar Quartos</h2>
        <button className="bg-stone-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2">
          <Plus size={18} /> Novo Quarto
        </button>
      </div>
      
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b border-stone-200 text-[10px] font-bold uppercase tracking-widest text-stone-400">
            <tr>
              <th className="px-6 py-4">Quarto</th>
              <th className="px-6 py-4">Capacidade</th>
              <th className="px-6 py-4">Preço</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rooms.map(room => (
              <tr key={room.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={room.images?.[0]} className="w-10 h-10 rounded-lg object-cover" />
                    <span className="font-bold text-sm">{room.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{room.capacity} Pessoas</td>
                <td className="px-6 py-4 text-sm">R$ {room.basePrice}</td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => toggleStatus(room)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      room.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {room.status === 'active' ? 'Ativo' : 'Inativo'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="p-2 text-stone-400 hover:text-stone-900"><Edit size={16} /></button>
                  <button className="p-2 text-stone-400 hover:text-red-600"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ReservationsTab = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    setLoading(true);
    const q = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    setReservations(snap.docs.map(d => ({ id: d.id, ...d.data() } as Reservation)));
    setLoading(false);
  };

  useEffect(() => { fetchReservations(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'reservations', id), { status });
    fetchReservations();
    toast.success('Reserva atualizada!');
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-serif font-bold">Reservas</h2>
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b border-stone-200 text-[10px] font-bold uppercase tracking-widest text-stone-400">
            <tr>
              <th className="px-6 py-4">Hóspede</th>
              <th className="px-6 py-4">Datas</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {reservations.map(res => (
              <tr key={res.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-sm">{res.guestName}</p>
                  <p className="text-xs text-stone-400">{res.guestEmail}</p>
                </td>
                <td className="px-6 py-4 text-xs">
                  {format(new Date(res.checkIn), 'dd/MM')} - {format(new Date(res.checkOut), 'dd/MM')}
                </td>
                <td className="px-6 py-4 text-sm font-bold">R$ {res.totalAmount}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    res.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                    res.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-500'
                  }`}>
                    {res.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {res.status === 'pending' && (
                    <button 
                      onClick={() => updateStatus(res.id, 'confirmed')}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button 
                    onClick={() => updateStatus(res.id, 'cancelled')}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const FAQsTab = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const fetchFaqs = async () => {
    const snap = await getDocs(collection(db, 'faqs'));
    setFaqs(snap.docs.map(d => ({ id: d.id, ...d.data() } as FAQ)));
  };
  useEffect(() => { fetchFaqs(); }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif font-bold">FAQs do Chatbot</h2>
        <button className="bg-stone-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2">
          <Plus size={18} /> Nova FAQ
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {faqs.map(faq => (
          <div key={faq.id} className="bg-white p-6 rounded-2xl border border-stone-200 space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-stone-900">{faq.question}</h4>
              <div className="flex gap-2">
                <button className="p-1.5 text-stone-400 hover:text-stone-900"><Edit size={14} /></button>
                <button className="p-1.5 text-stone-400 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
            <p className="text-sm text-stone-500">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Admin;
