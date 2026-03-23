import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Users, Star, Coffee, Wifi, Waves, ShieldCheck, ChevronRight, ArrowRight } from 'lucide-react';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Room } from '../types';
import { motion } from 'motion/react';

const Home = () => {
  const navigate = useNavigate();
  const [featuredRooms, setFeaturedRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCapacity, setSearchCapacity] = useState('2');

  const handleSearch = () => {
    navigate(`/quartos?capacity=${searchCapacity}`);
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const q = query(collection(db, 'rooms'), where('status', '==', 'active'), limit(3));
        const snap = await getDocs(q);
        setFeaturedRooms(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room)));
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1920" 
            alt="Pousada Premium" 
            className="w-full h-full object-cover brightness-50"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center text-white space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 bg-amber-600/20 backdrop-blur-md border border-amber-500/30 rounded-full text-xs font-bold tracking-widest uppercase mb-6">
              Refúgio Exclusivo na Serra
            </span>
            <h1 className="text-5xl md:text-8xl font-serif font-bold tracking-tighter leading-tight">
              Onde o conforto <br /> encontra a <span className="italic text-amber-400">natureza</span>.
            </h1>
            <p className="text-lg md:text-xl text-stone-200 max-w-2xl mx-auto mt-6 font-light">
              Desfrute de momentos inesquecíveis em uma das pousadas mais charmosas da região. 
              Gastronomia, lazer e descanso em um só lugar.
            </p>
          </motion.div>
        </div>

        {/* Quick Search Bar */}
        <div className="absolute bottom-16 left-0 right-0 z-20 px-4">
          <div className="max-w-5xl mx-auto bg-white rounded-2xl md:rounded-full shadow-[0_32px_64px_-15px_rgba(0,0,0,0.3)] p-3 flex flex-col md:flex-row items-stretch md:items-center gap-2 border border-stone-100">
            <div className="flex-1 px-6 py-3 md:py-2 md:border-r border-stone-100">
              <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1 flex items-center gap-2">
                <Calendar size={12} className="text-amber-600" /> Check-in
              </label>
              <input 
                type="date" 
                className="w-full bg-transparent border-none p-0 text-sm font-bold text-stone-800 focus:ring-0 outline-none cursor-pointer" 
              />
            </div>
            <div className="flex-1 px-6 py-3 md:py-2 md:border-r border-stone-100">
              <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1 flex items-center gap-2">
                <Calendar size={12} className="text-amber-600" /> Check-out
              </label>
              <input 
                type="date" 
                className="w-full bg-transparent border-none p-0 text-sm font-bold text-stone-800 focus:ring-0 outline-none cursor-pointer" 
              />
            </div>
            <div className="flex-1 px-6 py-3 md:py-2">
              <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1 flex items-center gap-2">
                <Users size={12} className="text-amber-600" /> Hóspedes
              </label>
              <select 
                value={searchCapacity}
                onChange={(e) => setSearchCapacity(e.target.value)}
                className="w-full bg-transparent border-none p-0 text-sm font-bold text-stone-800 focus:ring-0 outline-none appearance-none cursor-pointer"
              >
                <option value="1">1 Adulto</option>
                <option value="2">2 Adultos</option>
                <option value="4">Família (4+)</option>
              </select>
            </div>
            <button 
              onClick={handleSearch}
              className="bg-stone-900 text-white h-14 px-10 rounded-xl md:rounded-full font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20 active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              Buscar 
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 pt-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {[
            { icon: <Coffee size={32} />, title: "Café da Manhã", desc: "Artesanal e completo incluso" },
            { icon: <Wifi size={32} />, title: "Wi-Fi Fibra", desc: "Conexão estável em todo local" },
            { icon: <Waves size={32} />, title: "Piscina Aquecida", desc: "Lazer em qualquer estação" },
            { icon: <ShieldCheck size={32} />, title: "Segurança 24h", desc: "Tranquilidade para sua família" },
          ].map((item, i) => (
            <div key={i} className="text-center space-y-4 group">
              <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto text-stone-800 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                {item.icon}
              </div>
              <h3 className="font-bold text-lg">{item.title}</h3>
              <p className="text-sm text-stone-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="bg-stone-100 py-24 px-4">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <span className="text-amber-600 font-bold text-xs uppercase tracking-widest">Acomodações</span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-tighter">Escolha o seu refúgio</h2>
            </div>
            <Link to="/quartos" className="text-stone-900 font-bold flex items-center gap-2 hover:gap-4 transition-all">
              Ver todas as opções <ChevronRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-3xl h-96 animate-pulse"></div>
              ))
            ) : featuredRooms.length > 0 ? (
              featuredRooms.map((room, i) => (
                <motion.div 
                  key={room.id} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all group"
                >
                  <div className="h-64 overflow-hidden relative">
                    <img 
                      src={room.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800'} 
                      alt={room.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-stone-800">
                      R$ {room.basePrice}/noite
                    </div>
                  </div>
                  <div className="p-8 space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold">{room.name}</h3>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star size={14} fill="currentColor" />
                        <span className="text-xs font-bold text-stone-800">4.9</span>
                      </div>
                    </div>
                    <p className="text-sm text-stone-500 line-clamp-2">{room.description}</p>
                    <div className="flex items-center gap-4 pt-4 border-t border-stone-100">
                      <div className="flex items-center gap-2 text-xs text-stone-400">
                        <Users size={14} /> {room.capacity} Pessoas
                      </div>
                      <Link to={`/reservar?roomId=${room.id}`} className="ml-auto text-amber-600 text-sm font-bold hover:underline">
                        Reservar
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-1 md:col-span-3 text-center py-12 space-y-6">
                <p className="text-stone-500">Nenhuma acomodação disponível no momento.</p>
                <button 
                  onClick={async () => {
                    const { seedInitialData } = await import('../utils/seed');
                    const success = await seedInitialData(true);
                    if (success) window.location.reload();
                  }}
                  className="bg-stone-900 text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/10"
                >
                  Criar Acomodações de Teste
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1000" 
              alt="Sobre a Pousada" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-8 -right-8 bg-amber-600 text-white p-12 rounded-3xl hidden md:block">
            <p className="text-4xl font-serif font-bold">15+</p>
            <p className="text-xs uppercase tracking-widest font-bold opacity-80">Anos de História</p>
          </div>
        </div>
        
        <div className="space-y-8">
          <span className="text-amber-600 font-bold text-xs uppercase tracking-widest">Nossa História</span>
          <h2 className="text-4xl md:text-6xl font-serif font-bold tracking-tighter leading-tight">
            Tradição em bem receber e criar memórias.
          </h2>
          <p className="text-stone-600 leading-relaxed">
            Fundada com o propósito de oferecer um refúgio autêntico na Serra Gaúcha, a Pousada Premium 
            combina a hospitalidade rústica com o conforto moderno. Nossa missão é proporcionar 
            uma desconexão do caos urbano e uma reconexão com o que realmente importa.
          </p>
          <div className="grid grid-cols-2 gap-8 pt-4">
            <div>
              <h4 className="font-bold text-stone-900 mb-2">Sustentabilidade</h4>
              <p className="text-sm text-stone-500">Práticas eco-friendly e respeito à fauna local.</p>
            </div>
            <div>
              <h4 className="font-bold text-stone-900 mb-2">Gastronomia</h4>
              <p className="text-sm text-stone-500">Ingredientes locais e receitas de família.</p>
            </div>
          </div>
          <button className="bg-stone-900 text-white px-8 py-4 rounded-full font-bold hover:bg-stone-800 transition-colors">
            Conheça mais sobre nós
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
