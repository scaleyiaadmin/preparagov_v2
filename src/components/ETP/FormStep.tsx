
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Sparkles, CheckCircle } from 'lucide-react';

interface FormStepProps {
  title: string;
  description: string;
  value: string;
  onValueChange: (value: string) => void;
  onGenerateAI: () => void;
  hasCondition?: boolean;
  conditionLabel?: string;
  conditionValue?: boolean;
  onConditionChange?: (value: boolean) => void;
  placeholder?: string;
  rows?: number;
}

const FormStep = ({
  title,
  description,
  value,
  onValueChange,
  onGenerateAI,
  hasCondition = false,
  conditionLabel,
  conditionValue = false,
  onConditionChange,
  placeholder,
  rows = 6
}: FormStepProps) => {
  const hasContent = value.trim() !== '';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span>{title}</span>
              <CheckCircle size={20} className={hasContent ? 'text-green-500' : 'text-gray-300'} />
            </CardTitle>
            <p className="text-gray-600">{description}</p>
          </div>
          <Button variant="outline" onClick={onGenerateAI}>
            <Sparkles size={16} className="mr-2" />
            Gerar com IA
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {hasCondition && conditionLabel && onConditionChange && (
            <div className="flex items-center space-x-2">
              <Switch
                checked={conditionValue}
                onCheckedChange={onConditionChange}
              />
              <Label>{conditionLabel}</Label>
            </div>
          )}
          
          {(!hasCondition || conditionValue) && (
            <div className="space-y-2">
              <Label htmlFor={`field-${title}`}>
                {hasCondition ? 'Descreva detalhadamente:' : `Descreva ${title.toLowerCase()}:`}
              </Label>
              <Textarea
                id={`field-${title}`}
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                placeholder={placeholder || `Descreva detalhadamente ${title.toLowerCase()}...`}
                rows={rows}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FormStep;
