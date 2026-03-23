import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Room, FAQ } from '../types';

export const seedInitialData = async (force = false) => {
  try {
    if (force) {
      const roomsSnap = await getDocs(collection(db, 'rooms'));
      for (const d of roomsSnap.docs) {
        await deleteDoc(doc(db, 'rooms', d.id));
      }
      const faqSnap = await getDocs(collection(db, 'faqs'));
      for (const d of faqSnap.docs) {
        await deleteDoc(doc(db, 'faqs', d.id));
      }
    }

    // Check if rooms already exist
    const roomsSnap = await getDocs(collection(db, 'rooms'));
    if (roomsSnap.empty) {
      const initialRooms: Omit<Room, 'id'>[] = [
        {
          name: 'Suíte Master com Hidro',
          description: 'Nossa suíte mais luxuosa, perfeita para casais. Possui banheira de hidromassagem, cama king size, lareira e vista panorâmica para o vale. Decoração sofisticada com enxoval de 400 fios.',
          capacity: 2,
          basePrice: 450,
          amenities: ['Hidromassagem', 'Lareira', 'Ar Condicionado', 'Frigobar', 'Smart TV', 'Wi-fi', 'Cafeteira Nespresso'],
          images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1200'],
          status: 'active'
        },
        {
          name: 'Chalé Família Premium',
          description: 'Espaçoso e aconchegante, ideal para famílias. Dois quartos, sala de estar com lareira, cozinha compacta e varanda privativa com rede e vista para o jardim.',
          capacity: 5,
          basePrice: 780,
          amenities: ['Cozinha', 'Lareira', 'Varanda com Rede', 'Ar Condicionado', 'Smart TV', 'Wi-fi', 'Churrasqueira'],
          images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1200'],
          status: 'active'
        },
        {
          name: 'Quarto Standard Casal',
          description: 'Conforto e praticidade para sua estadia. Equipado com cama de casal, banheiro privativo e decoração rústica charmosa. Ideal para quem busca custo-benefício sem abrir mão do conforto.',
          capacity: 2,
          basePrice: 280,
          amenities: ['Ar Condicionado', 'Frigobar', 'Smart TV', 'Wi-fi'],
          images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=1200'],
          status: 'active'
        },
        {
          name: 'Suíte Loft Industrial',
          description: 'Design moderno com pegada industrial. Pé direito alto, janelas amplas, cama queen e espaço para home office. Perfeito para nômades digitais ou casais modernos.',
          capacity: 2,
          basePrice: 350,
          amenities: ['Cozinha Americana', 'Smart TV 55"', 'Wi-fi 500mbps', 'Ar Condicionado', 'Mesa de Trabalho'],
          images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=1200'],
          status: 'active'
        },
        {
          name: 'Bangalô Vista da Montanha',
          description: 'Localizado no ponto mais alto da propriedade. Oferece total privacidade e uma vista inesquecível do pôr do sol. Deck externo privativo.',
          capacity: 2,
          basePrice: 520,
          amenities: ['Deck Privativo', 'Lareira Externa', 'Ar Condicionado', 'Frigobar', 'Wi-fi'],
          images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=1200'],
          status: 'active'
        },
        {
          name: 'Suíte Presidencial Imperial',
          description: 'O ápice do luxo e exclusividade. Dois andares, piscina privativa aquecida no deck, adega climatizada, sistema de som integrado e serviço de mordomo opcional.',
          capacity: 4,
          basePrice: 1250,
          amenities: ['Piscina Privativa', 'Adega', 'Deck Duplo', 'Cama Super King', 'Banheira Dupla', 'Automação Residencial'],
          images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=1200'],
          status: 'active'
        },
        {
          name: 'Chalé Eco-Sustentável',
          description: 'Construído com materiais de reflorestamento e energia solar. Experiência de imersão total na natureza com conforto moderno e baixo impacto ambiental.',
          capacity: 2,
          basePrice: 320,
          amenities: ['Energia Solar', 'Horta Orgânica Privativa', 'Ventilação Natural', 'Wi-fi', 'Produtos Biodegradáveis'],
          images: ['https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=1200'],
          status: 'active'
        },
        {
          name: 'Suíte Garden Acessível',
          description: 'Localizada no térreo, totalmente adaptada para pessoas com mobilidade reduzida. Amplo espaço de circulação, barras de apoio e acesso facilitado a todas as áreas comuns.',
          capacity: 3,
          basePrice: 380,
          amenities: ['Acessibilidade Total', 'Banheiro Adaptado', 'Térreo', 'Ar Condicionado', 'Smart TV', 'Wi-fi'],
          images: ['https://images.unsplash.com/photo-1566115327231-93c21be12ce0?auto=format&fit=crop&q=80&w=1200'],
          status: 'active'
        }
      ];

      for (const room of initialRooms) {
        await addDoc(collection(db, 'rooms'), room);
      }
    }

    // Check if FAQs already exist
    const faqSnap = await getDocs(collection(db, 'faqs'));
    if (faqSnap.empty) {
      const initialFAQs: Omit<FAQ, 'id'>[] = [
        { question: 'Qual o horário de check-in e check-out?', answer: 'O check-in inicia às 14:00 e o check-out deve ser realizado até as 12:00.' },
        { question: 'A pousada aceita pets?', answer: 'Sim! Somos pet-friendly. Cobramos uma taxa única de R$ 50 por pet para limpeza adicional.' },
        { question: 'O café da manhã está incluso?', answer: 'Sim, oferecemos um café da manhã artesanal completo incluso em todas as nossas diárias.' },
        { question: 'Como funciona o cancelamento?', answer: 'Cancelamentos realizados até 7 dias antes do check-in têm reembolso total. Após esse prazo, cobramos 50% do valor total.' },
        { question: 'Tem estacionamento?', answer: 'Sim, possuímos estacionamento privativo e gratuito para todos os nossos hóspedes.' }
      ];

      for (const faq of initialFAQs) {
        await addDoc(collection(db, 'faqs'), faq);
      }
    }

    return true;
  } catch (error) {
    console.error('Seed error:', error);
    return false;
  }
};
