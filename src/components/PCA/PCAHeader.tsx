
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Eye, Upload } from 'lucide-react';

interface PCAHeaderProps {
  selectedYear: string;
  onYearChange: (year: string) => void;
  pcaPublished: boolean;
  onExportClick: () => void;
  onVisualizeClick: () => void;
  onPublishClick: () => void;
}

const PCAHeader = ({
  selectedYear,
  onYearChange,
  pcaPublished,
  onExportClick,
  onVisualizeClick,
  onPublishClick
}: PCAHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">PCA - Plano de Contratações Anual</h1>
        <p className="text-gray-600">Consolidação das contratações planejadas</p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Ano:</label>
          <Select value={selectedYear} onValueChange={onYearChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 6 }, (_, i) => {
                const year = (new Date().getFullYear() + i).toString();
                return (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                );
              })}
              {/* Mantém 2024 e 2025 para histórico se necessário, ou ajusta o range acima */}
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={onExportClick}>
          <Download size={16} className="mr-2" />
          Exportar PCA
        </Button>
        <Button variant="outline" onClick={onVisualizeClick}>
          <Eye size={16} className="mr-2" />
          Visualizar PCA
        </Button>
        <Button
          className="bg-orange-500 hover:bg-orange-600"
          onClick={onPublishClick}
        >
          <Upload size={16} className="mr-2" />
          {pcaPublished ? 'Atualizar no PNCP' : 'Publicar no PNCP'}
        </Button>
      </div>
    </div>
  );
};

export default PCAHeader;
