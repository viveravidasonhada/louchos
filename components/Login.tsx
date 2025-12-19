import React, { useState } from 'react';
import { TeamMember } from '../types';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginProps {
  team: TeamMember[];
  onLogin: (user: TeamMember | 'admin') => void;
}

const Login: React.FC<LoginProps> = ({ team, onLogin }) => {
  const [email, setEmail] = useState('admin@launchos.ai');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Admin Backdoor (para o dono do projeto)
    if (email === 'admin@launchos.ai' && password === 'admin') {
      onLogin('admin');
      return;
    }

    // Check Team Members
    const member = team.find(m => m.email === email && (m.password === password || !m.password)); // Aceita sem senha se não configurada para testes
    
    if (member) {
      onLogin(member);
    } else {
      setError('Credenciais inválidas. Tente admin@launchos.ai / admin ou o email de um membro cadastrado.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl animate-fadeIn">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-indigo-500/30">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">LaunchOS Acesso</h1>
          <p className="text-slate-400 mt-2 text-sm">Entre para gerenciar suas tarefas</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Email Corporativo</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Senha de Acesso</label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-3 text-slate-500" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-xs bg-red-900/20 p-3 rounded border border-red-900/50">
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 mt-4"
          >
            Acessar Sistema <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-700 text-center">
          <p className="text-xs text-slate-500">
            Dica: Use <strong>admin@launchos.ai</strong> / <strong>admin</strong> para acesso total.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;