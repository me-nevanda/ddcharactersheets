import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, type Connect, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { createCharacter, deleteCharacter, deleteCharacterImage, isSafeCharacterId, listCharacters, readCharacter, readCharacterImage, updateCharacter, updateCharacterImage, } from './server/characterStore';
import { createMonsterGroup, isSafeMonsterGroupId, listMonsterGroups, readMonsterGroup, updateMonsterGroup } from './server/monsterGroupStore';
import { createMonster, deleteMonster, deleteMonsterImage, isSafeMonsterId, listMonsters, readMonster, readMonsterImage, updateMonster, updateMonsterImage } from './server/monsterStore';
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
const readRawBody = async (request: IncomingMessage): Promise<Buffer> => {
    const chunks: Buffer[] = [];
    for await (const chunk of request) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
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
            const imageMatch = url.pathname.match(/^\/api\/characters\/([^/]+)\/image$/);
            if (imageMatch) {
                const characterId = imageMatch[1];
                if (!isSafeCharacterId(characterId)) {
                    sendError(response, 400, 'errors.api.invalidCharacterId');
                    return;
                }
                if (request.method === 'GET') {
                    const image = await readCharacterImage(characterId);
                    response.statusCode = 200;
                    response.setHeader('Content-Type', image.contentType);
                    response.end(image.data);
                    return;
                }
                if (request.method === 'PUT') {
                    const character = await updateCharacterImage(characterId, request.headers['content-type'], await readRawBody(request));
                    sendJson(response, 200, { character });
                    return;
                }
                if (request.method === 'DELETE') {
                    const character = await deleteCharacterImage(characterId);
                    sendJson(response, 200, { character });
                    return;
                }
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
            if (apiError.code === 'API_INVALID_CHARACTER_IMAGE') {
                sendError(response, apiError.statusCode ?? 400, 'errors.api.invalidCharacterImage');
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
const createMonstersApiPlugin = (): Plugin => {
    const handler: Connect.NextHandleFunction = async (request: MiddlewareRequest, response: ServerResponse, next: NextFunction) => {
        const url = new URL(request.url ?? '/', 'http://localhost');
        if (!url.pathname.startsWith('/api/monsters') && !url.pathname.startsWith('/api/monster-groups')) {
            next();
            return;
        }
        try {
            if (request.method === 'GET' && url.pathname === '/api/monster-groups') {
                sendJson(response, 200, { monsterGroups: await listMonsterGroups() });
                return;
            }
            if (request.method === 'POST' && url.pathname === '/api/monster-groups') {
                const payload = await readJsonBody(request);
                sendJson(response, 201, { monsterGroup: await createMonsterGroup(payload) });
                return;
            }
            const groupMatch = url.pathname.match(/^\/api\/monster-groups\/([^/]+)$/);
            if (groupMatch) {
                const groupId = groupMatch[1];
                if (!isSafeMonsterGroupId(groupId)) {
                    sendError(response, 400, 'errors.api.invalidMonsterGroupId');
                    return;
                }
                if (request.method === 'GET') {
                    sendJson(response, 200, { monsterGroup: await readMonsterGroup(groupId) });
                    return;
                }
                if (request.method === 'PUT') {
                    const payload = await readJsonBody(request);
                    sendJson(response, 200, { monsterGroup: await updateMonsterGroup(groupId, payload) });
                    return;
                }
            }
            if (request.method === 'GET' && url.pathname === '/api/monsters') {
                sendJson(response, 200, { monsters: await listMonsters() });
                return;
            }
            if (request.method === 'POST' && url.pathname === '/api/monsters') {
                sendJson(response, 201, { monster: await createMonster() });
                return;
            }
            const imageMatch = url.pathname.match(/^\/api\/monsters\/([^/]+)\/image$/);
            if (imageMatch) {
                const monsterId = imageMatch[1];
                if (!isSafeMonsterId(monsterId)) {
                    sendError(response, 400, 'errors.api.invalidMonsterId');
                    return;
                }
                if (request.method === 'GET') {
                    const image = await readMonsterImage(monsterId);
                    response.statusCode = 200;
                    response.setHeader('Content-Type', image.contentType);
                    response.end(image.data);
                    return;
                }
                if (request.method === 'PUT') {
                    const monster = await updateMonsterImage(monsterId, request.headers['content-type'], await readRawBody(request));
                    sendJson(response, 200, { monster });
                    return;
                }
                if (request.method === 'DELETE') {
                    const monster = await deleteMonsterImage(monsterId);
                    sendJson(response, 200, { monster });
                    return;
                }
            }
            const match = url.pathname.match(/^\/api\/monsters\/([^/]+)$/);
            if (match) {
                const monsterId = match[1];
                if (!isSafeMonsterId(monsterId)) {
                    sendError(response, 400, 'errors.api.invalidMonsterId');
                    return;
                }
                if (request.method === 'GET') {
                    sendJson(response, 200, { monster: await readMonster(monsterId) });
                    return;
                }
                if (request.method === 'PUT') {
                    const payload = await readJsonBody(request);
                    sendJson(response, 200, {
                        monster: await updateMonster(monsterId, payload),
                    });
                    return;
                }
                if (request.method === 'DELETE') {
                    await deleteMonster(monsterId);
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
                sendError(response, 404, 'errors.api.monsterNotFound');
                return;
            }
            if (apiError.code === 'API_INVALID_JSON_BODY') {
                sendError(response, apiError.statusCode ?? 400, 'errors.api.invalidJsonBody');
                return;
            }
            if (apiError.code === 'API_INVALID_MONSTER_ID') {
                sendError(response, apiError.statusCode ?? 400, 'errors.api.invalidMonsterId');
                return;
            }
            if (apiError.code === 'API_INVALID_MONSTER_GROUP_ID') {
                sendError(response, apiError.statusCode ?? 400, 'errors.api.invalidMonsterGroupId');
                return;
            }
            if (apiError.code === 'API_INVALID_MONSTER_GROUP_NAME') {
                sendError(response, apiError.statusCode ?? 400, 'errors.api.invalidMonsterGroupName');
                return;
            }
            if (apiError.code === 'API_INVALID_MONSTER_IMAGE') {
                sendError(response, apiError.statusCode ?? 400, 'errors.api.invalidMonsterImage');
                return;
            }
            sendError(response, apiError.statusCode ?? 500, 'errors.api.unexpectedServerError');
        }
    };
    return {
        name: 'monsters-api',
        configureServer(server) {
            server.middlewares.use(handler);
        },
        configurePreviewServer(server) {
            server.middlewares.use(handler);
        },
    };
};
export default defineConfig({
    plugins: [react(), createCharactersApiPlugin(), createMonstersApiPlugin()],
    resolve: {
        alias: {
            '@pages': '/src/pages',
            '@lib': '/src/lib',
            '@i18n': '/src/i18n',
            '@dictionaries': '/src/dictionaries',
            '@components': '/src/components',
            '@appTypes': '/src/types',
        },
    },
});
