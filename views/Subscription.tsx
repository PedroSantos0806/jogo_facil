import React from 'react';
import { Check, Star, Calendar, Zap } from 'lucide-react';
import { Button } from '../components/Button';
import { SubscriptionPlan, UserRole } from '../types';

interface SubscriptionProps {
  userRole: UserRole;
  onSubscribe: (plan: SubscriptionPlan) => void;
  onBack: () => void;
}

export const Subscription: React.FC<SubscriptionProps> = ({ userRole, onSubscribe, onBack }) => {
  const plans = [
    {
      id: SubscriptionPlan.WEEKLY,
      name: 'Avulso (Semanal)',
      price: 'R$ 9,90',
      period: '/semana',
      icon: Zap,
      features: [
        'Acesso total por 7 dias',
        'Busca de adversários',
        'Suporte básico'
      ]
    },
    {
      id: SubscriptionPlan.MONTHLY,
      name: 'Mensal',
      price: 'R$ 29,90',
      period: '/mês',
      icon: Calendar,
      popular: true,
      features: [
        'Acesso total por 30 dias',
        'Prioridade na busca',
        'Verificação de pagamentos',
        'Recorrência de jogos'
      ]
    },
    {
      id: SubscriptionPlan.ANNUAL,
      name: 'Anual',
      price: 'R$ 199,90',
      period: '/ano',
      icon: Star,
      features: [
        'Acesso total por 365 dias',
        'Economia de 45%',
        'Selo de verificado',
        'Painel administrativo completo'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-4xl font-bold text-pitch mb-4">Escolha seu Plano</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Para utilizar o <span className="text-grass-600 font-bold">Jogo Fácil</span> e garantir partidas seguras, 
          escolha o plano que melhor se adapta à sua necessidade.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div key={plan.id} className={`bg-white rounded-2xl shadow-xl overflow-hidden relative border-2 ${plan.popular ? 'border-grass-500 transform scale-105 z-10' : 'border-transparent'}`}>
            {plan.popular && (
              <div className="bg-grass-500 text-white text-xs font-bold uppercase py-1 px-4 absolute top-0 right-0 rounded-bl-lg">
                Mais Popular
              </div>
            )}
            <div className="p-8">
              <div className="bg-grass-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <plan.icon className="w-6 h-6 text-grass-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                <span className="ml-1 text-gray-500">{plan.period}</span>
              </div>
              <ul className="mt-6 space-y-4">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-600">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                variant={plan.popular ? 'primary' : 'outline'} 
                className="w-full mt-8"
                onClick={() => onSubscribe(plan.id)}
              >
                Assinar Agora
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-12">
         <button onClick={onBack} className="text-gray-500 hover:underline">Voltar para login</button>
      </div>
    </div>
  );
};
