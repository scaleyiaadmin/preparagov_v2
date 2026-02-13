
import { PostgrestError } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

export const handleSupabaseError = (error: PostgrestError | Error | unknown, context: string) => {
    console.error(`Error in ${context}:`, error);

    let title = "Erro na operação";
    let description = "Ocorreu um erro inesperado. Tente novamente.";

    if (isPostgrestError(error)) {
        title = "Erro no Banco de Dados";
        description = mapPostgrestErrorToMessage(error);
    } else if (error instanceof Error) {
        description = error.message;
    }

    toast({
        title,
        description,
        variant: "destructive",
    });

    return { title, description };
};

const isPostgrestError = (error: unknown): error is PostgrestError => {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        'message' in error &&
        'details' in error
    );
};

const mapPostgrestErrorToMessage = (error: PostgrestError): string => {
    switch (error.code) {
        case '23505': // Unique violation
            if (error.message.includes('email')) return "Este email já está cadastrado.";
            if (error.message.includes('cnpj')) return "Este CNPJ já está cadastrado.";
            return "Registro duplicado.";
        case '23503': // Foreign key violation
            return "Operação não permitida: registro referenciado por outros dados.";
        case '42P01': // Undefined table
            return "Erro de configuração: Tabela não encontrada.";
        case '42703': // Undefined column
            return "Erro de configuração: Coluna não encontrada.";
        default:
            return error.message || "Erro desconhecido no banco de dados.";
    }
};
