import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { Room, Reservation } from '../types';
import { useAuth } from '../context/AuthContext';
import { Calendar, Users, CheckCircle2, Loader2, ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, differenceInDays, addDays, startOfToday } from 'date-fns';
import { toast } from 'sonner';

const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    roomId: searchParams.get('roomId') || '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    guestName: profile?.name || user?.displayName || '',
    guestEmail: profile?.email || user?.email || '',
    guestPhone: '',
  });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const q = query(collection(db, 'rooms'), where('status', '==', 'active'));
        const snap = await getDocs(q);
        const roomsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
        setRooms(roomsData);
        
        const roomId = searchParams.get('roomId');
        if (roomId) {
          const room = roomsData.find(r => r.id === roomId);
          if (room) setSelectedRoom(room);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [searchParams]);

  useEffect(() => {
    if (formData.roomId) {
      const room = rooms.find(r => r.id === formData.roomId);
      if (room) setSelectedRoom(room);
    }
  }, [formData.roomId, rooms]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateTotal = () => {
    if (!selectedRoom || !formData.checkIn || !formData.checkOut) return 0;
    const days = differenceInDays(new Date(formData.checkOut), new Date(formData.checkIn));
    return days > 0 ? days * selectedRoom.basePrice : 0;
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para realizar uma reserva.');
      return;
    }

    if (!formData.checkIn || !formData.checkOut || !formData.roomId) {
      toast.error('Por favor, preencha todas as informações.');
      return;
    }

    setIsSubmitting(true);
    try {
      const reservationData: Omit<Reservation, 'id'> = {
        roomId: formData.roomId,
        userId: user.uid,
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        totalAmount: calculateTotal(),
        status: 'pending',
        paymentStatus: 'unpaid',
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'reservations'), reservationData);
      setStep(4);
      toast.success('Reserva solicitada com sucesso!');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reservations');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !formData.roomId) {
      toast.error('Selecione uma acomodação.');
      return;
    }
    if (step === 2 && (!formData.checkIn || !formData.checkOut)) {
      toast.error('Selecione as datas de check-in e check-out.');
      return;
    }
    if (step === 2 && differenceInDays(new Date(formData.checkOut), new Date(formData.checkIn)) <= 0) {
      toast.error('A data de check-out deve ser após o check-in.');
      return;
    }
    setStep(prev => prev + 1);
  };

  const prevStep = () => setStep(prev => prev - 1);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            {['Acomodação', 'Datas', 'Dados Pessoais', 'Confirmação'].map((label, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  step > i + 1 ? 'bg-green-500 text-white' : 
                  step === i + 1 ? 'bg-stone-900 text-white scale-110 shadow-lg' : 
                  'bg-stone-200 text-stone-500'
                }`}>
                  {step > i + 1 ? <CheckCircle2 size={20} /> : i + 1}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${
                  step === i + 1 ? 'text-stone-900' : 'text-stone-400'
                }`}>{label}</span>
              </div>
            ))}
          </div>
          <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-amber-600"
              initial={{ width: '0%' }}
              animate={{ width: `${((step - 1) / 3) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 space-y-6"
                >
                  <h2 className="text-2xl font-serif font-bold tracking-tight">Escolha sua acomodação</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {rooms.map(room => (
                      <button
                        key={room.id}
                        onClick={() => setFormData(prev => ({ ...prev, roomId: room.id }))}
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                          formData.roomId === room.id 
                            ? 'border-amber-600 bg-amber-50/50 shadow-md' 
                            : 'border-stone-100 hover:border-stone-200'
                        }`}
                      >
                        <img 
                          src={room.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=100'} 
                          alt={room.name} 
                          className="w-20 h-20 rounded-xl object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-grow">
                          <h3 className="font-bold text-stone-900">{room.name}</h3>
                          <p className="text-xs text-stone-500 line-clamp-1">{room.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs font-bold text-amber-700">R$ {room.basePrice}/noite</span>
                          </div>
                        </div>
                        {formData.roomId === room.id && <CheckCircle2 className="text-amber-600" size={24} />}
                      </button>
                    ))}
                  </div>
                  <div className="pt-6 flex justify-end">
                    <button 
                      onClick={nextStep}
                      className="bg-stone-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-stone-800 transition-all"
                    >
                      Próximo Passo <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 space-y-8"
                >
                  <h2 className="text-2xl font-serif font-bold tracking-tight">Quando você vem?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Check-in</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                        <input 
                          type="date" 
                          name="checkIn"
                          min={format(startOfToday(), 'yyyy-MM-dd')}
                          value={formData.checkIn}
                          onChange={handleInputChange}
                          className="w-full bg-stone-50 border-none rounded-xl pl-12 pr-4 py-4 text-sm focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Check-out</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                        <input 
                          type="date" 
                          name="checkOut"
                          min={formData.checkIn || format(addDays(startOfToday(), 1), 'yyyy-MM-dd')}
                          value={formData.checkOut}
                          onChange={handleInputChange}
                          className="w-full bg-stone-50 border-none rounded-xl pl-12 pr-4 py-4 text-sm focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 p-4 rounded-2xl flex items-start gap-3 text-amber-800 text-sm">
                    <Info size={20} className="flex-shrink-0 mt-0.5" />
                    <p>O check-in inicia às 14:00 e o check-out deve ser realizado até as 12:00.</p>
                  </div>

                  <div className="pt-6 flex justify-between">
                    <button 
                      onClick={prevStep}
                      className="text-stone-500 font-bold flex items-center gap-2 hover:text-stone-900 transition-colors"
                    >
                      <ArrowLeft size={18} /> Voltar
                    </button>
                    <button 
                      onClick={nextStep}
                      className="bg-stone-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-stone-800 transition-all"
                    >
                      Próximo Passo <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 space-y-8"
                >
                  <h2 className="text-2xl font-serif font-bold tracking-tight">Seus dados</h2>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Nome Completo</label>
                      <input 
                        type="text" 
                        name="guestName"
                        value={formData.guestName}
                        onChange={handleInputChange}
                        placeholder="Como devemos te chamar?"
                        className="w-full bg-stone-50 border-none rounded-xl px-4 py-4 text-sm focus:ring-1 focus:ring-amber-500 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-stone-400">E-mail</label>
                        <input 
                          type="email" 
                          name="guestEmail"
                          value={formData.guestEmail}
                          onChange={handleInputChange}
                          placeholder="seu@email.com"
                          className="w-full bg-stone-50 border-none rounded-xl px-4 py-4 text-sm focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-stone-400">WhatsApp / Telefone</label>
                        <input 
                          type="tel" 
                          name="guestPhone"
                          value={formData.guestPhone}
                          onChange={handleInputChange}
                          placeholder="(00) 00000-0000"
                          className="w-full bg-stone-50 border-none rounded-xl px-4 py-4 text-sm focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-between">
                    <button 
                      onClick={prevStep}
                      className="text-stone-500 font-bold flex items-center gap-2 hover:text-stone-900 transition-colors"
                    >
                      <ArrowLeft size={18} /> Voltar
                    </button>
                    <button 
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="bg-amber-600 text-white px-10 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-amber-500 transition-all shadow-lg shadow-amber-900/20 disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                      Finalizar Reserva
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl p-12 shadow-sm border border-stone-100 text-center space-y-8"
                >
                  <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={48} />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-3xl font-serif font-bold">Reserva Solicitada!</h2>
                    <p className="text-stone-500 max-w-sm mx-auto">
                      Sua solicitação foi enviada com sucesso. Em breve você receberá um e-mail com as instruções de pagamento para confirmar sua estadia.
                    </p>
                  </div>
                  <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                      onClick={() => navigate('/')}
                      className="bg-stone-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-stone-800 transition-colors"
                    >
                      Voltar para Início
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 sticky top-28 space-y-6">
              <h3 className="text-lg font-bold border-b border-stone-100 pb-4">Resumo da Reserva</h3>
              
              {selectedRoom ? (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <img 
                      src={selectedRoom.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=100'} 
                      alt={selectedRoom.name} 
                      className="w-16 h-16 rounded-xl object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="font-bold text-sm">{selectedRoom.name}</p>
                      <p className="text-xs text-stone-500">R$ {selectedRoom.basePrice} / noite</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-stone-50">
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-400">Check-in</span>
                      <span className="font-bold">{formData.checkIn ? format(new Date(formData.checkIn), 'dd/MM/yyyy') : '--/--/----'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-400">Check-out</span>
                      <span className="font-bold">{formData.checkOut ? format(new Date(formData.checkOut), 'dd/MM/yyyy') : '--/--/----'}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Total Estimado</span>
                      <span className="text-2xl font-serif font-bold text-amber-600">R$ {calculateTotal()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center space-y-4">
                  <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center mx-auto text-stone-300">
                    <Info size={24} />
                  </div>
                  <p className="text-xs text-stone-400">Selecione uma acomodação para ver o resumo.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
