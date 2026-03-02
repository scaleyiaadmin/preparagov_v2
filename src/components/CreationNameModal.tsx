import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreationNameModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (name: string) => void;
    title: string;
    placeholder?: string;
    description?: string;
}

const CreationNameModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    placeholder = "Digite o nome...",
    description
}: CreationNameModalProps) => {
    const [name, setName] = useState('');

    const handleConfirm = () => {
        if (name.trim()) {
            onConfirm(name.trim());
            setName('');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">{title}</DialogTitle>
                    {description && <p className="text-sm text-gray-500 mt-2">{description}</p>}
                </DialogHeader>
                <div className="py-6">
                    <Label htmlFor="doc-name" className="mb-2 block text-sm font-medium text-gray-700">
                        Identificação do Documento
                    </Label>
                    <Input
                        id="doc-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={placeholder}
                        autoFocus
                        className="w-full"
                        onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                    />
                    <p className="mt-2 text-xs text-gray-400 font-normal">
                        Este nome ajudará você a identificar este documento posteriormente.
                    </p>
                </div>
                <DialogFooter className="sm:justify-end gap-2">
                    <Button variant="outline" onClick={onClose} className="border-gray-300">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!name.trim()}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-8"
                    >
                        Começar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreationNameModal;
