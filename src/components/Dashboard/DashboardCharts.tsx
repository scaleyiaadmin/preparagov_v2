
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const DashboardCharts = () => {
  const { user, isSuperAdmin } = useAuth();
  const [dfdData, setDfdData] = useState<any[]>([]);
  const [priorityData, setPriorityData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      let query = supabase.from('dfd').select('status, prioridade, created_at');

      if (!isSuperAdmin() && user?.prefeituraId) {
        query = query.eq('prefeitura_id', user.prefeituraId);
      }

      const { data } = await query;

      if (data) {
        // Process Status Data
        const statusMapByCount: Record<string, number> = {};
        const priorityMapByCount: Record<string, number> = {};
        
        data.forEach(item => {
          statusMapByCount[item.status] = (statusMapByCount[item.status] || 0) + 1;
          priorityMapByCount[item.prioridade] = (priorityMapByCount[item.prioridade] || 0) + 1;
        });

        setDfdData(Object.entries(statusMapByCount).map(([name, value]) => ({ name, value })));
        setPriorityData(Object.entries(priorityMapByCount).map(([name, value]) => ({ name, value })));

        // Dummy monthly data for visualization as we might not have enough spread
        setMonthlyData([
          { month: 'Jan', count: 12 },
          { month: 'Fev', count: 18 },
          { month: 'Mar', count: 25 },
          { month: 'Abr', count: 20 },
          { month: 'Mai', count: 32 },
          { month: 'Jun', count: 28 },
        ]);
      }
    };

    fetchData();
  }, [user, isSuperAdmin]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const PRIORITY_COLORS = {
    'Alta': '#ef4444',
    'Média': '#f59e0b',
    'Baixa': '#10b981'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Status das Demandas</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dfdData.length > 0 ? dfdData : [{ name: 'Sem dados', value: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {dfdData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Demandas por Prioridade</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {priorityData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS] || '#cbd5e1'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;
