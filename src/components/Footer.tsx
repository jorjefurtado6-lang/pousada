import React from 'react';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-stone-900 text-stone-400 py-16 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-6">
          <h3 className="text-white text-xl font-serif font-bold tracking-tighter">
            POUSADA<span className="text-amber-500">PREMIUM</span>
          </h3>
          <p className="text-sm leading-relaxed">
            Sua experiência de refúgio e conforto em meio à natureza. 
            Onde cada detalhe é pensado para o seu descanso.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors"><Instagram size={20} /></a>
            <a href="#" className="hover:text-white transition-colors"><Facebook size={20} /></a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-medium mb-6">Links Rápidos</h4>
          <ul className="space-y-4 text-sm">
            <li><a href="/" className="hover:text-white transition-colors">Início</a></li>
            <li><a href="/quartos" className="hover:text-white transition-colors">Acomodações</a></li>
            <li><a href="/reservar" className="hover:text-white transition-colors">Reservar</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Sobre Nós</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-medium mb-6">Contato</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-center gap-3">
              <Phone size={16} className="text-amber-500" />
              <span>(11) 99999-9999</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={16} className="text-amber-500" />
              <span>contato@pousadapremium.com.br</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin size={16} className="text-amber-500 mt-1" />
              <span>Rua das Flores, 123 - Centro<br />Serra Gaúcha, RS</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-medium mb-6">Newsletter</h4>
          <p className="text-sm mb-4">Receba ofertas exclusivas e novidades.</p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Seu e-mail" 
              className="bg-stone-800 border-none rounded-lg px-4 py-2 text-sm w-full focus:ring-1 focus:ring-amber-500 outline-none"
            />
            <button className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-500 transition-colors">
              Ok
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-stone-800 text-center text-xs">
        <p>&copy; {new Date().getFullYear()} Pousada Premium. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
