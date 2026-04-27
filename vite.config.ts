import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, type Connect, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { createCharacter, deleteCharacter, isSafeCharacterId, listCharacters, readCharacter, updateCharacter, } from './server/characterStore';
interface ApiError extends Error {
    code?: string;
    statusCode?: number;
}
type MiddlewareRequest = IncomingMessage & {
    method?: string;
    url?: string;
};
type NextFunction = (err?: unknown) => void;
const sendJson = (response: ServerResponse, statusCode: number, payload: unknown): void => {
    response.statusCode = statusCode;
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.end(JSON.stringify(payload));
};
const sendError = (response: ServerResponse, statusCode: number, errorCode: string): void => {
    sendJson(response, statusCode, { errorCode });
};
const readJsonBody = async <T = Record<string, unknown>>(request: IncomingMessage): Promise<T> => {
    const chunks: Buffer[] = [];
    for await (const chunk of request) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const body = Buffer.concat(chunks).toString('utf8').trim();
    if (!body) {
        return {} as T;
    }
    try {
        return JSON.parse(body) as T;
    }
    catch {
        const error = new Error('Invalid JSON body') as ApiError;
        error.statusCode = 400;
        error.code = 'API_INVALID_JSON_BODY';
        throw error;
    }
};
const createCharactersApiPlugin = (): Plugin => {
    const handler: Connect.NextHandleFunction = async (request: MiddlewareRequest, response: ServerResponse, next: NextFunction) => {
        const url = new URL(request.url ?? '/', 'http://localhost');
        if (!url.pathname.startsWith('/api/characters')) {
            next();
            return;
        }
        try {
            if (request.method === 'GET' && url.pathname === '/api/characters') {
                sendJson(response, 200, { characters: await listCharacters() });
                return;
            }
            if (request.method === 'POST' && url.pathname === '/api/characters') {
                sendJson(response, 201, { character: await createCharacter() });
                return;
            }
            const match = url.pathname.match(/^\/api\/characters\/([^/]+)$/);
            if (match) {
                const characterId = match[1];
                if (!isSafeCharacterId(characterId)) {
                    sendError(response, 400, 'errors.api.invalidCharacterId');
                    return;
                }
                if (request.method === 'GET') {
                    sendJson(response, 200, { character: await readCharacter(characterId) });
                    return;
                }
                if (request.method === 'PUT') {
                    const payload = await readJsonBody(request);
                    sendJson(response, 200, {
                        character: await updateCharacter(characterId, payload),
                    });
                    return;
                }
                if (request.method === 'DELETE') {
                    await deleteCharacter(characterId);
                    response.statusCode = 204;
                    response.end();
                    return;
                }
            }
            sendError(response, 404, 'errors.api.notFound');
        }
        catch (error) {
            const apiError = error as ApiError;
            if (apiError.code === 'ENOENT') {
                sendError(response, 404, 'errors.api.characterNotFound');
                return;
            }
            if (apiError.code === 'API_INVALID_JSON_BODY') {
                sendError(response, apiError.statusCode ?? 400, 'errors.api.invalidJsonBody');
                return;
            }
            if (apiError.code === 'API_INVALID_CHARACTER_ID') {
                sendError(response, apiError.statusCode ?? 400, 'errors.api.invalidCharacterId');
                return;
            }
            sendError(response, apiError.statusCode ?? 500, 'errors.api.unexpectedServerError');
        }
    };
    return {
        name: 'characters-api',
        configureServer(server) {
            server.middlewares.use(handler);
        },
        configurePreviewServer(server) {
            server.middlewares.use(handler);
        },
    };
};
export default defineConfig({
    plugins: [react(), createCharactersApiPlugin()],
    resolve: {
        alias: {
            '@pages': '/src/pages',
            '@lib': '/src/lib',
            '@i18n': '/src/i18n',
            '@dictionaries': '/src/dictionaries',
            '@components': '/src/components',
        },
    },
});
