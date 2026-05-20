import { GoogleGenAI } from '@google/genai';
import { readGeminiConfig } from './geminiConfig';

export interface CreateGeminiResponsePayload {
    instructions?: unknown;
    model?: unknown;
    prompt?: unknown;
}

export interface GeminiResponseResult {
    response: {
        id: string;
        model: string;
        text: string;
        usage: GeminiUsage;
    };
}

export interface GeminiTokenCountResult {
    tokenCount: {
        model: string;
        totalTokens: number;
    };
}

export interface GeminiUsage {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
}

interface GeminiSdkError extends Error {
    code?: string | number;
    status?: number;
}

const createGeminiError = (code: string, statusCode: number): Error => {
    const error = new Error(code) as Error & {
        code?: string;
        statusCode?: number;
    };
    error.code = code;
    error.statusCode = statusCode;
    return error;
};

const getGeminiErrorStatus = (error: GeminiSdkError): number | undefined => {
    if (typeof error.status === 'number') {
        return error.status;
    }
    if (typeof error.code === 'number') {
        return error.code;
    }
    return undefined;
};

export const createGeminiResponse = async (payload: CreateGeminiResponsePayload): Promise<GeminiResponseResult> => {
    const prompt = typeof payload.prompt === 'string' ? payload.prompt.trim() : '';

    if (!prompt) {
        throw createGeminiError('API_GEMINI_PROMPT_REQUIRED', 400);
    }

    const config = await readGeminiConfig();
    const model = typeof payload.model === 'string' && payload.model.trim() ? payload.model.trim() : config.model;
    const instructions = typeof payload.instructions === 'string' && payload.instructions.trim()
        ? payload.instructions.trim()
        : undefined;
    const client = new GoogleGenAI({
        apiKey: config.apiKey,
    });

    try {
        const response = await client.models.generateContent({
            config: instructions ? { systemInstruction: instructions } : undefined,
            contents: prompt,
            model,
        });

        return {
            response: {
                id: response.responseId ?? '',
                model,
                text: response.text ?? '',
                usage: {
                    inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
                    outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
                    totalTokens: response.usageMetadata?.totalTokenCount ?? 0,
                },
            },
        };
    }
    catch (error) {
        const geminiError = error as GeminiSdkError;
        const status = getGeminiErrorStatus(geminiError);

        if (status === 401 || status === 403) {
            throw createGeminiError('API_GEMINI_UNAUTHORIZED', status);
        }
        if (status === 429) {
            throw createGeminiError('API_GEMINI_RATE_LIMITED', 429);
        }

        throw createGeminiError('API_GEMINI_REQUEST_FAILED', status ?? 500);
    }
};

export const countGeminiTokens = async (payload: CreateGeminiResponsePayload): Promise<GeminiTokenCountResult> => {
    const prompt = typeof payload.prompt === 'string' ? payload.prompt.trim() : '';

    if (!prompt) {
        return {
            tokenCount: {
                model: '',
                totalTokens: 0,
            },
        };
    }

    const config = await readGeminiConfig();
    const model = typeof payload.model === 'string' && payload.model.trim() ? payload.model.trim() : config.model;
    const client = new GoogleGenAI({
        apiKey: config.apiKey,
    });

    try {
        const response = await client.models.countTokens({
            contents: prompt,
            model,
        });

        return {
            tokenCount: {
                model,
                totalTokens: response.totalTokens ?? 0,
            },
        };
    }
    catch (error) {
        const geminiError = error as GeminiSdkError;
        const status = getGeminiErrorStatus(geminiError);

        if (status === 401 || status === 403) {
            throw createGeminiError('API_GEMINI_UNAUTHORIZED', status);
        }
        if (status === 429) {
            throw createGeminiError('API_GEMINI_RATE_LIMITED', 429);
        }

        throw createGeminiError('API_GEMINI_REQUEST_FAILED', status ?? 500);
    }
};
