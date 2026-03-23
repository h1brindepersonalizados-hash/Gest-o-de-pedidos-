import React, { useState, useEffect } from 'react';
import { Building2, Upload, Save, CheckCircle } from 'lucide-react';
import { CompanySettings } from '../types';

export function SettingsView() {
  const [settings, setSettings] = useState<CompanySettings>({
    name: 'H1 Brindes Personalizados',
    document: '',
    phone: '',
    email: 'h1brindepersonalizados@gmail.com',
    logo: ''
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('companySettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('companySettings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('A imagem é muito grande. O limite é 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setSettings({ ...settings, logo: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
          <div className="bg-sky-100 p-3 rounded-xl text-sky-500">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Configurações da Empresa</h2>
            <p className="text-sm text-gray-500">Estes dados aparecerão nos orçamentos e fichas de impressão.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                placeholder="Ex: Minha Empresa"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ / CPF</label>
              <input
                type="text"
                value={settings.document}
                onChange={(e) => setSettings({ ...settings, document: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                placeholder="contato@empresa.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Logotipo</label>
              <div className="flex items-start gap-6">
                <div className="flex-1">
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 hover:bg-gray-100 transition-colors">
                    <Upload className="mb-2 h-8 w-8 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">Clique para fazer upload</span>
                    <span className="text-xs text-gray-500 mt-1">PNG, JPG até 2MB</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                </div>
                {settings.logo && (
                  <div className="relative h-32 w-48 rounded-lg border border-gray-200 bg-gray-50 p-2 flex items-center justify-center">
                    <img src={settings.logo} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                    <button
                      onClick={() => setSettings({ ...settings, logo: '' })}
                      className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                      title="Remover logo"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center gap-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3 font-medium text-white transition-colors hover:bg-sky-600 shadow-sm"
            >
              <Save className="h-5 w-5" />
              Salvar Configurações
            </button>
            {saved && (
              <span className="flex items-center gap-1 text-emerald-600 font-medium animate-in fade-in duration-300">
                <CheckCircle className="h-5 w-5" />
                Salvo com sucesso!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
