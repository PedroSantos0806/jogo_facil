import React, { useState } from 'react';
import { UserRole, COMMON_CATEGORIES, SubscriptionPlan } from '../types';
import { Button } from '../components/Button';
import { Mail, Lock, User as UserIcon, ArrowRight, Phone, MapPin, DollarSign, Key, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface AuthProps {
  onLogin: (user: any) => void;
  onCancel: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, onCancel }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.TEAM_CAPTAIN);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Common Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Field Owner Specific
  const [arenaName, setArenaName] = useState('');
  const [address, setAddress] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [cancellationFee, setCancellationFee] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [pixHolder, setPixHolder] = useState('');

  // Team Specific
  const [teamName, setTeamName] = useState('');
  const [teamCategory, setTeamCategory] = useState(COMMON_CATEGORIES[6]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegistering) {
        const payload: any = {
          email,
          password,
          role: email.includes('admin') ? UserRole.ADMIN : role,
          name,
          phoneNumber: phone,
          subscription: email.includes('admin') ? SubscriptionPlan.ANNUAL : SubscriptionPlan.NONE,
          subscriptionExpiry: email.includes('admin') ? '2099-12-31' : null,
          latitude: -23.55, // Mock geo for now
          longitude: -46.63,
          subTeams: role === UserRole.TEAM_CAPTAIN ? [{ name: teamName, category: teamCategory }] : [],
          fieldData: role === UserRole.FIELD_OWNER ? {
            name: arenaName,
            location: address,
            hourlyRate: Number(hourlyRate),
            cancellationFeePercent: Number(cancellationFee),
            pixConfig: { key: pixKey, name: pixHolder },
            contactPhone: phone
          } : undefined
        };
        const newUser = await api.register(payload);
        onLogin(newUser);
      } else {
        const user = await api.login(email, password);
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message || 'Erro na autenticação');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full pl-10 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-grass-500 outline-none text-white placeholder-gray-400";
  const simpleInputClass = "w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-grass-500 outline-none text-white placeholder-gray-400";

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden w-full max-w-2xl my-10 border border-gray-700">
        <div className="bg-grass-600 p-6 text-center">
          <h2 className="text-2xl font-bold text-white">
            {isRegistering ? 'Criar Conta' : 'Bem-vindo de volta'}
          </h2>
          <p className="text-grass-100 mt-2">Acesse o Jogo Fácil</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {!isRegistering ? (
             <div className="space-y-4">
               <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input type="email" required className={inputClass} placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input type="password" required className={inputClass} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
              </div>
             </div>
          ) : (
            <div className="space-y-6">
              
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Eu sou:</label>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => setRole(UserRole.TEAM_CAPTAIN)}
                    className={`cursor-pointer p-4 border-2 rounded-xl text-center transition ${role === UserRole.TEAM_CAPTAIN ? 'bg-grass-900 border-grass-500 text-white font-bold' : 'hover:bg-gray-700 border-gray-600 text-gray-300'}`}
                  >
                    ⚽ Capitão de Time
                  </div>
                  <div 
                    onClick={() => setRole(UserRole.FIELD_OWNER)}
                    className={`cursor-pointer p-4 border-2 rounded-xl text-center transition ${role === UserRole.FIELD_OWNER ? 'bg-grass-900 border-grass-500 text-white font-bold' : 'hover:bg-gray-700 border-gray-600 text-gray-300'}`}
                  >
                    🏟️ Dono de Campo
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Seu Nome Completo</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <input type="text" required className={inputClass} placeholder="Nome" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">WhatsApp / Celular</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <input type="tel" required className={inputClass} placeholder="(11) 99999-9999" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <input type="email" required className={inputClass} placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <input type="password" required className={inputClass} placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                 </div>
              </div>

              {/* Team Specific */}
              {role === UserRole.TEAM_CAPTAIN && (
                <div className="bg-gray-700 p-4 rounded-xl border border-gray-600">
                  <h3 className="font-bold text-white mb-3 flex items-center gap-2">🏁 Informações do Time</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Nome do Time</label>
                      <input type="text" required className={simpleInputClass} placeholder="Ex: Os Boleiros FC" value={teamName} onChange={e => setTeamName(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Categoria</label>
                      <select 
                        className={simpleInputClass}
                        value={teamCategory}
                        onChange={e => setTeamCategory(e.target.value)}
                      >
                        {COMMON_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Field Owner Specific */}
              {role === UserRole.FIELD_OWNER && (
                <div className="bg-gray-700 p-4 rounded-xl border border-gray-600 space-y-4">
                  <h3 className="font-bold text-white flex items-center gap-2">🏟️ Informações da Arena</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                     <div className="col-span-2">
                       <label className="block text-sm font-medium text-gray-300 mb-1">Nome do Local / Arena</label>
                       <input type="text" required className={simpleInputClass} placeholder="Ex: Arena Jogo Fácil" value={arenaName} onChange={e => setArenaName(e.target.value)} />
                     </div>
                     <div className="col-span-2">
                       <label className="block text-sm font-medium text-gray-300 mb-1">Endereço Completo</label>
                       <div className="relative">
                         <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                         <input type="text" required className={inputClass} placeholder="Rua, Número, Bairro, Cidade" value={address} onChange={e => setAddress(e.target.value)} />
                       </div>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-300 mb-1">Valor por Hora (R$)</label>
                       <div className="relative">
                         <DollarSign className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                         <input type="number" required className={inputClass} placeholder="150" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} />
                       </div>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-300 mb-1">Multa Cancelamento (%)</label>
                       <input type="number" required className={simpleInputClass} placeholder="30" value={cancellationFee} onChange={e => setCancellationFee(e.target.value)} />
                     </div>
                  </div>

                  <div className="pt-4 border-t border-gray-600">
                    <h4 className="font-semibold text-gray-300 mb-3 flex items-center gap-2"><Key className="w-4 h-4"/> Configuração PIX (Recebimento)</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                         <label className="block text-sm font-medium text-gray-300 mb-1">Chave PIX</label>
                         <input type="text" required className={simpleInputClass} placeholder="CPF, Email ou Aleatória" value={pixKey} onChange={e => setPixKey(e.target.value)} />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-gray-300 mb-1">Nome do Titular</label>
                         <input type="text" required className={simpleInputClass} placeholder="Nome igual no banco" value={pixHolder} onChange={e => setPixHolder(e.target.value)} />
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          <Button type="submit" isLoading={isLoading} className="w-full mt-6 justify-center text-lg py-3">
            {isRegistering ? 'Finalizar Cadastro' : 'Entrar'} <ArrowRight className="w-5 h-5" />
          </Button>

          <div className="text-center mt-4">
            <button 
              type="button"
              onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
              className="text-sm text-grass-400 hover:text-grass-300 font-semibold"
            >
              {isRegistering ? 'Já tenho conta? Entrar' : 'Não tem conta? Cadastre-se'}
            </button>
          </div>
          
          <div className="text-center">
             <button type="button" onClick={onCancel} className="text-xs text-gray-500 hover:text-gray-400">Voltar para Home</button>
          </div>
        </form>
      </div>
    </div>
  );
};