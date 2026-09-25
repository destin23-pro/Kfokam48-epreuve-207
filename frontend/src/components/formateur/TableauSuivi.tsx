import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  Download,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { TableauLigne, Promotion } from '../../types';

interface TableauSuiviProps {
  lignes: TableauLigne[];
  loading: boolean;
  promotion?: Promotion;
  onRefresh: () => void;
}

type SortField = 'nom' | 'presences' | 'exercicesDeposes' | 'moyenne' | 'relecturesEnAttente';
type SortDirection = 'asc' | 'desc';

export const TableauSuivi: React.FC<TableauSuiviProps> = ({
  lignes,
  loading,
  promotion,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('nom');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Gestion du tri
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'nom' ? 'asc' : 'desc');
    }
  };

  // Filtrage et Tri
  const filteredAndSortedLignes = useMemo(() => {
    let result = [...lignes];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) => l.nom.toLowerCase().includes(q) || String(l.etudiantId).includes(q)
      );
    }

    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string' && typeof valB === 'string') {
        const cmp = valA.localeCompare(valB, 'fr');
        return sortDirection === 'asc' ? cmp : -cmp;
      }

      // RG14 : une moyenne null (aucune note) est classée en dernier.
      valA = valA == null ? -1 : Number(valA);
      valB = valB == null ? -1 : Number(valB);

      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });

    return result;
  }, [lignes, searchQuery, sortField, sortDirection]);

  // Statistiques de synthèse : seules des sommes brutes des champs de l'API sont
  // affichées. F3 : la moyenne (par étudiant) vient de l'API, jamais recalculée ici.
  const stats = useMemo(() => {
    if (!lignes || lignes.length === 0) {
      return { totalEtudiants: 0, totalPresences: 0, totalDevoirs: 0, enAttente: 0 };
    }
    return {
      totalEtudiants: lignes.length,
      totalPresences: lignes.reduce((acc, curr) => acc + curr.presences, 0),
      totalDevoirs: lignes.reduce((acc, curr) => acc + curr.exercicesDeposes, 0),
      enAttente: lignes.filter((l) => l.relecturesEnAttente > 0).length,
    };
  }, [lignes]);

  // Export CSV académique
  const handleExportCSV = () => {
    const headers = [
      'Identifiant',
      'Nom et Prenom',
      'Presences',
      'Exercices Deposes',
      'Moyenne Generales',
      'Relectures en Attente',
    ];
    const rows = filteredAndSortedLignes.map((l) => [
      l.etudiantId,
      `"${l.nom}"`,
      l.presences,
      l.exercicesDeposes,
      l.moyenne == null ? '' : l.moyenne.toFixed(1),
      l.relecturesEnAttente,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tableau_suivi_${(promotion?.nom ?? 'promotion').replace(/[^a-z0-9]+/gi, '-')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* En-tête du tableau & contrôles */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Tableau de Suivi & Évaluations
            </h2>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              GET /api/tableau?promotionId={promotion?.id ?? '—'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi académique consolidé : présences, devoirs, relectures et moyennes
          </p>
        </div>

        {/* Barre d'outils : Recherche, Actualisation & Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un étudiant..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
            title="Rafraîchir les données depuis l'API"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors"
            title="Télécharger le fichier CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Cartes Métriques Synthétiques (SaaS style épuré, zéro-pill) */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-100 bg-slate-50/50 divide-x divide-y md:divide-y-0 divide-slate-100 text-xs">
        <div className="p-4">
          <span className="text-[11px] text-slate-500 block">Effectif affiché</span>
          <span className="font-mono tabular-nums font-bold text-lg text-slate-900">
            {filteredAndSortedLignes.length} / {stats.totalEtudiants}
          </span>
        </div>
        <div className="p-4">
          <span className="text-[11px] text-slate-500 block">Total présences (API)</span>
          <span className="font-mono tabular-nums font-bold text-lg text-emerald-700">
            {stats.totalPresences} émargements
          </span>
        </div>
        <div className="p-4">
          <span className="text-[11px] text-slate-500 block">Relectures en attente</span>
          <span className="font-mono tabular-nums font-bold text-lg text-indigo-700">
            {stats.enAttente} étudiants
          </span>
        </div>
        <div className="p-4">
          <span className="text-[11px] text-slate-500 block">Total devoirs déposés</span>
          <span className="font-mono tabular-nums font-bold text-lg text-slate-900">
            {stats.totalDevoirs} rendus
          </span>
        </div>
      </div>

      {/* Grille de données / Tableau Stylisé */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th
                onClick={() => handleSort('nom')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Étudiant & Identifiant</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('presences')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors select-none text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Présences</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('exercicesDeposes')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors select-none text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Devoirs Rendus</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('moyenne')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors select-none text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Moyenne (/20)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('relecturesEnAttente')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors select-none text-center"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Relectures en attente</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-center">Statut d'assiduité</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              // État de chargement (Squelettes propres delta <= 2px)
              Array.from({ length: 6 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-3.5 px-4">
                    <div className="h-4 bg-slate-200 rounded w-36 mb-1" />
                    <div className="h-3 bg-slate-100 rounded w-20" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="h-4 bg-slate-200 rounded w-12 ml-auto" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="h-4 bg-slate-200 rounded w-12 ml-auto" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="h-4 bg-slate-200 rounded w-16 ml-auto" />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="h-4 bg-slate-200 rounded w-8 mx-auto" />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="h-4 bg-slate-200 rounded w-20 mx-auto" />
                  </td>
                </tr>
              ))
            ) : filteredAndSortedLignes.length === 0 ? (
              // État Vide
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700 text-sm">Aucun étudiant trouvé</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {searchQuery
                        ? `Aucun résultat pour le filtre "${searchQuery}".`
                        : 'Aucune donnée enregistrée pour cette promotion.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              // Données Populées
              filteredAndSortedLignes.map((ligne) => {
                const isRegular = ligne.presences >= 10;
                const isWarning = ligne.presences < 8;

                return (
                  <tr
                    key={ligne.etudiantId}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Nom & Identifiant */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{ligne.nom}</div>
                      <div className="text-[11px] font-mono text-slate-500">
                        ID: {ligne.etudiantId} {ligne.email && `· ${ligne.email}`}
                      </div>
                    </td>

                    {/* Présences */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-800">
                      {ligne.presences}
                    </td>

                    {/* Devoirs Déposés */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-800">
                      {ligne.exercicesDeposes}
                    </td>

                    {/* Moyenne */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold">
                      {ligne.moyenne == null ? (
                        <span className="text-slate-400" title="Aucune note reçue (RG14)">—</span>
                      ) : (
                      <span
                        className={
                          ligne.moyenne >= 16
                            ? 'text-emerald-700'
                            : ligne.moyenne >= 12
                            ? 'text-indigo-700'
                            : ligne.moyenne >= 10
                            ? 'text-slate-800'
                            : 'text-rose-600'
                        }
                      >
                        {ligne.moyenne.toFixed(1)}
                      </span>
                      )}
                    </td>

                    {/* Relectures en attente */}
                    <td className="py-3 px-4 text-center font-mono tabular-nums">
                      {ligne.relecturesEnAttente > 0 ? (
                        <span className="font-semibold text-amber-600">
                          {ligne.relecturesEnAttente} en attente
                        </span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>

                    {/* Statut d'assiduité (Anti-slop : texte épuré non enfermé dans une pilule criarde) */}
                    <td className="py-3 px-4 text-center">
                      {isRegular ? (
                        <span className="text-[11px] font-medium text-emerald-700">
                          Assidu ✓
                        </span>
                      ) : isWarning ? (
                        <span className="text-[11px] font-medium text-rose-600">
                          Attention (Absences)
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-600">
                          Régulier
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
