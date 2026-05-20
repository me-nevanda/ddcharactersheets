import { readFile } from 'node:fs/promises';
import path from 'node:path';

interface GeminiConfigFile {
    gemini?: {
        apiKey?: string;
        model?: string;
    };
}

export interface GeminiConfig {
    apiKey: string;
    model: string;
}

const CONFIG_FILE_PATH = path.resolve(process.cwd(), 'config.json');
const DEFAULT_MODEL = 'gemini-2.5-flash';

const createConfigError = (code: string, statusCode: number): Error => {
    const error = new Error(code) as Error & {
        code?: string;
        statusCode?: number;
    };
    error.code = code;
    error.statusCode = statusCode;
    return error;
};

export const readGeminiConfig = async (): Promise<GeminiConfig> => {
    let rawConfig: string;

    try {
        rawConfig = await readFile(CONFIG_FILE_PATH, 'utf8');
    }
    catch {
        throw createConfigError('API_GEMINI_CONFIG_MISSING', 500);
    }

    let config: GeminiConfigFile;

    try {
        config = JSON.parse(rawConfig) as GeminiConfigFile;
    }
    catch {
        throw createConfigError('API_GEMINI_CONFIG_INVALID', 500);
    }

    const apiKey = config.gemini?.apiKey?.trim();

    if (!apiKey) {
        throw createConfigError('API_GEMINI_API_KEY_MISSING', 500);
    }

    return {
        apiKey,
        model: config.gemini?.model?.trim() || DEFAULT_MODEL,
    };
};
