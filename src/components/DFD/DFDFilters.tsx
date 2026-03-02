
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface DFDFiltersProps {
  filters: {
    tipoDFD: string;
    prioridade: string;
    anoContratacao: string;
    status: string;
  };
  onFilterChange: (filters: DFDFiltersProps['filters']) => void;
  tipoDFDOptions: string[];
  prioridadeOptions: string[];
}

const DFDFilters = ({
  filters,
  onFilterChange,
  tipoDFDOptions,
  prioridadeOptions
}: DFDFiltersProps) => {
  console.log('DFDFilters rendering with filters:', filters);

  const statusOptions = ['Pendente', 'Em Elaboração', 'Aprovado', 'Cancelado', 'Retirado'];
  const currentYear = new Date().getFullYear();
  const anoOptions = Array.from({ length: currentYear - 2025 + 3 }, (_, i) => String(2025 + i));

  const handleFilterChange = (key: string, value: string) => {
    console.log('Filter change:', key, value);
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    console.log('Clearing all filters');
    onFilterChange({
      tipoDFD: '',
      prioridade: '',
      anoContratacao: '',
      status: ''
    });
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="tipoDFD">Tipo de DFD</Label>
            <Select value={filters.tipoDFD} onValueChange={(value) => handleFilterChange('tipoDFD', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {tipoDFDOptions.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prioridade">Prioridade</Label>
            <Select value={filters.prioridade} onValueChange={(value) => handleFilterChange('prioridade', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {prioridadeOptions.map((prioridade) => (
                  <SelectItem key={prioridade} value={prioridade}>
                    {prioridade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ano">Ano de Contratação</Label>
            <Select value={filters.anoContratacao} onValueChange={(value) => handleFilterChange('anoContratacao', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os anos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os anos</SelectItem>
                {anoOptions.map((ano) => (
                  <SelectItem key={ano} value={ano}>
                    {ano}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Button variant="outline" onClick={clearFilters} className="w-full">
              Limpar Filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DFDFilters;
