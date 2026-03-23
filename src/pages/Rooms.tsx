import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Room } from '../types';
import { Users, Star, SlidersHorizontal, Search, ChevronRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';

const Rooms = () => {
  const [searchParams] = useSearchParams();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get('capacity') || 'all');

  useEffect(() => {
    const capacity = searchParams.get('capacity');
    if (capacity) setFilter(capacity);
  }, [searchParams]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const q = query(collection(db, 'rooms'), where('status', '==', 'active'));
        const snap = await getDocs(q);
        setRooms(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room)));
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const filteredRooms = filter === 'all' 
    ? rooms 
    : rooms.filter(r => r.capacity >= parseInt(filter));

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <section className="bg-stone-900 text-white py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30">
          <img 
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1920" 
            alt="Quartos" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tighter">Nossas Acomodações</h1>
            <p className="text-stone-400 max-w-2xl mx-auto mt-4 text-lg">
              Escolha o espaço perfeito para sua estadia. Do rústico ao luxo, 
              temos a opção ideal para você e sua família.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-stone-100">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 text-stone-400">
              <SlidersHorizontal size={18} />
              <span className="text-sm font-bold uppercase tracking-widest">Filtrar por:</span>
            </div>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-stone-50 border-none rounded-lg px-4 py-2 text-sm font-medium outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">Todas as capacidades</option>
              <option value="2">Mínimo 2 pessoas</option>
              <option value="4">Mínimo 4 pessoas</option>
            </select>
          </div>
          <div className="text-sm text-stone-500 font-medium">
            Exibindo <span className="text-stone-900 font-bold">{filteredRooms.length}</span> opções
          </div>
        </div>
      </section>

      {/* Rooms Grid */}
      <section className="max-w-7xl mx-auto px-4 mt-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-3xl h-[500px] animate-pulse"></div>
            ))}
          </div>
        ) : filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredRooms.map((room, i) => (
              <motion.div 
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all group border border-stone-100"
              >
                <div className="h-72 overflow-hidden relative">
                  <img 
                    src={room.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800'} 
                    alt={room.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-6 left-6 bg-stone-900/80 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-white">
                    R$ {room.basePrice} / noite
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-bold tracking-tight">{room.name}</h3>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star size={16} fill="currentColor" />
                      <span className="text-sm font-bold text-stone-800">4.9</span>
                    </div>
                  </div>
                  <p className="text-sm text-stone-500 leading-relaxed line-clamp-3">{room.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {room.amenities?.slice(0, 3).map((amenity, idx) => (
                      <span key={idx} className="bg-stone-50 text-stone-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-stone-100">
                        {amenity}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-stone-100">
                    <div className="flex items-center gap-2 text-sm font-medium text-stone-600">
                      <Users size={18} className="text-amber-600" />
                      Até {room.capacity} Pessoas
                    </div>
                    <Link 
                      to={`/reservar?roomId=${room.id}`}
                      className="bg-stone-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/10"
                    >
                      Reservar
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 space-y-6">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-300">
              <Search size={40} />
            </div>
            <h3 className="text-2xl font-bold">Nenhum quarto encontrado</h3>
            <p className="text-stone-500">Tente ajustar seus filtros ou crie acomodações de teste.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => setFilter('all')}
                className="text-amber-600 font-bold hover:underline"
              >
                Limpar filtros
              </button>
              <button 
                onClick={async () => {
                  const { seedInitialData } = await import('../utils/seed');
                  const success = await seedInitialData(true);
                  if (success) window.location.reload();
                }}
                className="bg-stone-900 text-white px-6 py-2 rounded-full text-sm font-bold"
              >
                Criar Acomodações de Teste
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Rooms;
