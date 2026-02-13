
import { z } from 'zod';
import { UserRole } from '@/types/auth';

// Helper para validar UUID ou string vazia (que vira null no backend)
const optionalUuidSchema = z.string().superRefine((val, ctx) => {
    if (val === '') return; // Vazio é aceito
    // Regex simples de UUID
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "ID inválido",
        });
    }
});

export const userSchema = z.object({
    email: z.string().email("Email inválido"),
    nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    role: z.enum(['super_admin', 'admin', 'operator'] as const),
    prefeituraId: z.string().optional(), // Pode ser vazio se for Super Admin ou não selecionado
    secretariaId: z.string().optional(),
    status: z.enum(['ativo', 'inativo']).default('ativo'),
    // Senha é opcional na edição, obrigatória na criação (mas tratada no form)
    password: z.string().optional(),
    permissions: z.object({
        dashboard: z.boolean(),
        dfd: z.boolean(),
        pca: z.boolean(),
        etp: z.boolean(),
        mapaRiscos: z.boolean(),
        cronograma: z.boolean(),
        termoReferencia: z.boolean(),
        edital: z.boolean(),
        perfil: z.boolean(),
        gerenciarUsuarios: z.boolean(),
        gestaoPrefeiturasAcesso: z.boolean(),
    }),
});

export const prefeituraSchema = z.object({
    nome: z.string().min(3, "Nome da prefeitura é obrigatório"),
    cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "CNPJ inválido (00.000.000/0000-00)"),
    uf: z.string().length(2, "UF inválida"),
    municipio: z.string().min(2, "Município é obrigatório"),
});

export type UserFormData = z.infer<typeof userSchema>;
export type PrefeituraFormData = z.infer<typeof prefeituraSchema>;
