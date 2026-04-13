import React, { useState, useEffect } from 'react';
import { Search, X, Check, AlertCircle, ImagePlus, Share2, Instagram, Linkedin } from 'lucide-react';

const ConstellationApp = () => {
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('constellation'); // 'constellation' or 'admin'
  const [stars, setStars] = useState([]);

  // Generate random star positions on mount
  useEffect(() => {
    const generatedStars = [
      { id: 1, name: 'Juan García', family: 'Paterna', color: '#9B59B6', x: 200, y: 150, bio: 'Ingeniero jubilado' },
      { id: 2, name: 'María Rodríguez', family: 'Materna', color: '#3498DB', x: 400, y: 300, bio: 'Profesora de primaria' },
      { id: 3, name: 'Carlos', family: 'Política 1', color: '#F39C12', x: 600, y: 200, bio: 'Empresario' },
      { id: 4, name: 'Ana García', family: 'Paterna', color: '#9B59B6', x: 300, y: 450, bio: 'Médica' },
      { id: 5, name: 'Luis', family: 'Política 2', color: '#27AE60', x: 500, y: 380, bio: 'Fotógrafo' },
    ];
    setStars(generatedStars);
  }, []);

  const pendingItems = [
    { id: 1, type: 'person', name: 'Roberto Navarro', family: 'Materna', suggested_by: 'Carlos', date: '2 hours ago' },
    { id: 2, type: 'photo', person: 'Juan García', caption: 'Wedding 1975', suggested_by: 'María', date: '1 hour ago' },
    { id: 3, type: 'relationship', persons: 'Juan García ↔ María Rodríguez', type_rel: 'spouse', suggested_by: 'Ana', date: '30 min ago' },
  ];

  const selectedData = stars.find(s => s.id === selectedPerson);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-[#080C18] to-slate-900 font-sans overflow-hidden">
      {/* STARFIELD BACKGROUND */}
      <div className="fixed inset-0 z-0">
        <svg className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {[...Array(120)].map((_, i) => {
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const duration = 3 + Math.random() * 2;
            const delay = Math.random() * 3;
            return (
              <circle
                key={i}
                cx={`${x}%`}
                cy={`${y}%`}
                r={Math.random() * 0.5 + 0.2}
                fill="white"
                opacity={Math.random() * 0.6 + 0.2}
                filter="url(#glow)"
                style={{
                  animation: `twinkle ${duration}s ease-in-out ${delay}s infinite`,
                }}
              />
            );
          })}
        </svg>
        <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 0.8; }
          }
        `}</style>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 h-screen flex flex-col">
        {/* HEADER */}
        <div className="bg-gradient-to-b from-slate-950/80 to-transparent backdrop-blur-sm border-b border-slate-800/50 px-8 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 flex items-center justify-center">
                <span className="text-sm font-bold text-white">✦</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">FamilyStars</h1>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setViewMode('constellation')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'constellation'
                    ? 'bg-purple-500/20 border border-purple-400/50 text-purple-200'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Constelación
              </button>
              <button
                onClick={() => setViewMode('admin')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'admin'
                    ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-200'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {/* SEARCH BAR */}
          {viewMode === 'constellation' && (
            <div className="max-w-7xl mx-auto mt-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Busca persona, familia, lugar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/20 transition-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* CANVAS AREA */}
        {viewMode === 'constellation' && (
          <div className="flex-1 relative overflow-hidden">
            <div className="absolute inset-0">
              {/* CONSTELLATION NODES */}
              {stars.map((star) => (
                <div
                  key={star.id}
                  className="absolute group cursor-pointer"
                  style={{ left: `${star.x}px`, top: `${star.y}px` }}
                  onClick={() => setSelectedPerson(star.id)}
                >
                  {/* HALO */}
                  <div
                    className="absolute inset-0 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"
                    style={{
                      backgroundColor: star.color,
                      width: '120px',
                      height: '120px',
                      left: '-50px',
                      top: '-50px',
                    }}
                  />

                  {/* STAR */}
                  <div
                    className="relative w-16 h-16 rounded-full border-2 shadow-lg overflow-hidden transition-transform duration-300 group-hover:scale-110"
                    style={{
                      borderColor: star.color,
                      backgroundColor: star.color + '20',
                    }}
                  >
                    {/* Fallback avatar - initials */}
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-transparent">
                      <span className="text-white font-bold text-lg">
                        {star.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>

                  {/* LABEL */}
                  <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <p className="text-sm font-semibold text-white">{star.name}</p>
                    <p className="text-xs text-slate-400">{star.family}</p>
                  </div>
                </div>
              ))}

              {/* CONNECTION LINES SVG */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Parent-child lines */}
                {[[1, 4], [1, 2], [2, 5], [3, 1]].map((conn, i) => {
                  const s1 = stars.find(s => s.id === conn[0]);
                  const s2 = stars.find(s => s.id === conn[1]);
                  if (!s1 || !s2) return null;
                  return (
                    <path
                      key={`line-${i}`}
                      d={`M ${s1.x + 32} ${s1.y + 32} Q ${(s1.x + s2.x) / 2} ${(s1.y + s2.y) / 2 - 40} ${s2.x + 32} ${s2.y + 32}`}
                      stroke={s1.color}
                      strokeWidth="1.5"
                      fill="none"
                      opacity="0.35"
                      strokeDasharray={conn[0] === 1 && conn[1] === 3 ? '5,5' : 'none'}
                    />
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* ADMIN VIEW */}
        {viewMode === 'admin' && (
          <div className="flex-1 overflow-auto p-8">
            <div className="max-w-5xl">
              <h2 className="text-2xl font-bold text-white mb-8">Contenido Pendiente</h2>

              <div className="space-y-4">
                {pendingItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-slate-800"
                          style={{
                            borderLeft: `4px solid ${item.type === 'person' ? '#9B59B6' : item.type === 'photo' ? '#3498DB' : '#F39C12'}`,
                          }}
                        >
                          {item.type === 'person' && <AlertCircle className="w-6 h-6 text-purple-400" />}
                          {item.type === 'photo' && <ImagePlus className="w-6 h-6 text-cyan-400" />}
                          {item.type === 'relationship' && <Share2 className="w-6 h-6 text-orange-400" />}
                        </div>

                        <div>
                          <p className="text-white font-semibold">
                            {item.type === 'person' && `Nueva persona: ${item.name}`}
                            {item.type === 'photo' && `Foto de ${item.person}`}
                            {item.type === 'relationship' && `Relación: ${item.persons}`}
                          </p>
                          <p className="text-sm text-slate-400 mt-1">
                            Sugerido por <span className="text-slate-300">{item.suggested_by}</span> • {item.date}
                          </p>
                          {item.type === 'photo' && (
                            <p className="text-sm text-slate-400 mt-1">"{item.caption}"</p>
                          )}
                          {item.type === 'relationship' && (
                            <p className="text-sm text-slate-400 mt-1">Tipo: {item.type_rel}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 rounded-lg text-emerald-200 font-medium flex items-center gap-2 transition-all">
                          <Check className="w-4 h-4" />
                          Aprobar
                        </button>
                        <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 rounded-lg text-red-200 font-medium flex items-center gap-2 transition-all">
                          <X className="w-4 h-4" />
                          Rechazar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT PANEL - PROFILE */}
      {selectedPerson && selectedData && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-gradient-to-b from-slate-950/95 to-slate-900/95 backdrop-blur-xl border-l border-slate-800/50 shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right-80 duration-300">
          {/* CLOSE BUTTON */}
          <button
            onClick={() => setSelectedPerson(null)}
            className="absolute top-6 right-6 p-2 hover:bg-slate-800/50 rounded-lg transition-colors z-10"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>

          {/* CONTENT */}
          <div className="p-8">
            {/* AVATAR & NAME */}
            <div className="text-center mb-8">
              <div
                className="w-24 h-24 rounded-full border-2 mx-auto mb-4 flex items-center justify-center font-bold text-2xl text-white shadow-lg"
                style={{
                  borderColor: selectedData.color,
                  backgroundColor: selectedData.color + '20',
                }}
              >
                {selectedData.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h2 className="text-2xl font-bold text-white">{selectedData.name}</h2>
              <p className="text-sm text-slate-400 mt-1">{selectedData.bio}</p>
            </div>

            {/* FAMILY BADGE */}
            <div className="mb-8">
              <div
                className="inline-block px-4 py-2 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: selectedData.color + '20',
                  borderLeft: `3px solid ${selectedData.color}`,
                  color: selectedData.color,
                }}
              >
                {selectedData.family}
              </div>
            </div>

            {/* RELATIONSHIPS */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Relaciones</h3>
              <div className="space-y-3">
                {['Padre: Juan García', 'Hermana: Ana García', 'Primo: Luis'].map((rel, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700" />
                    <span className="text-sm text-slate-300">{rel}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* GALLERY */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Fotos</h3>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 cursor-pointer hover:shadow-lg transition-shadow flex items-center justify-center"
                  >
                    <ImagePlus className="w-5 h-5 text-slate-500" />
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-lg text-slate-300 text-sm font-medium transition-all">
                + Añadir foto
              </button>
            </div>

            {/* SOCIAL LINKS */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Conectar</h3>
              <div className="flex gap-3">
                {[
                  { icon: Instagram, name: 'Instagram' },
                  { icon: Linkedin, name: 'LinkedIn' },
                ].map((social, i) => {
                  const Icon = social.icon;
                  return (
                    <button
                      key={i}
                      className="p-3 bg-slate-800/30 hover:bg-slate-800/60 rounded-lg text-slate-400 hover:text-slate-200 transition-all"
                      title={social.name}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* EDIT BUTTON */}
            <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl">
              Editar Perfil
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConstellationApp;
