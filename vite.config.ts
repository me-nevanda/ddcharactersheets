import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, type Connect, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { createAdventure, isSafeAdventureId, listAdventures, readAdventure, updateAdventure } from './server/adventureStore';
import { createCharacter, deleteCharacter, deleteCharacterImage, isSafeCharacterId, listCharacters, readCharacter, readCharacterImage, updateCharacter, updateCharacterImage, } from './server/characterStore';
import { countGeminiTokens, createGeminiResponse } from './server/geminiService';
import { createMonsterGroup, deleteMonsterGroup, isSafeMonsterGroupId, listMonsterGroups, readMonsterGroup, updateMonsterGroup } from './server/monsterGroupStore';
import { createMonster, deleteMonster, deleteMonsterImage, isSafeMonsterId, listMonsters, readMonster, readMonsterImage, updateMonster, updateMonsterImage } from './server/monsterStore';
import { createNpcGroup, deleteNpcGroup, isSafeNpcGroupId, listNpcGroups, readNpcGroup, updateNpcGroup } from './server/npcGroupStore';
import { createNpc, deleteNpc, deleteNpcImage, isSafeNpcId, listNpcs, readNpc, readNpcImage, updateNpc, updateNpcImage } from './server/npcStore';
import { createPlace, isSafePlaceId, listPlaces, readPlace, updatePlace } from './server/placeStore';
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
const createAdventuresApiPlugin = (): Plugin => {
    const handler: Connect.NextHandleFunction = async (request: MiddlewareRequest, response: ServerResponse, next: NextFunction) => {
        const url = new URL(request.url ?? '/', 'http://localhost');
        if (!url.pathname.startsWith('/api/adventures')) {
            next();
            return;
        }
        try {
            if (request.method === 'GET' && url.pathname === '/api/adventures') {
                sendJson(response, 200, { adventures: await listAdventures() });
                return;
            }
            if (request.method === 'POST' && url.pathname === '/api/adventures') {
                sendJson(response, 201, { adventure: await createAdventure() });
                return;
            }
            const match = url.pathname.match(/^\/api\/adventures\/([^/]+)$/);
            if (match) {
                const adventureId = match[1];
                if (!isSafeAdventureId(adventureId)) {
                    sendError(response, 400, 'errors.api.invalidAdventureId');
                    return;
                }
                if (request.method === 'GET') {
                    sendJson(response, 200, { adventure: await readAdventure(adventureId) });
                    return;
                }
                if (request.method === 'PUT') {
                    const payload = await readJsonBody(request);
                    sendJson(response, 200, {
                        adventure: await updateAdventure(adventureId, payload),
                    });
                    return;
                }
            }
            sendError(response, 404, 'errors.api.notFound');
        }
        catch (error) {
            const apiError = error as ApiError;
            if (apiError.code === 'ENOENT') {
                sendError(response, 404, 'errors.api.adventureNotFound');
                return;
            }
            if (apiError.code === 'API_INVALID_JSON_BODY') {
                sendError(response, apiError.statusCode ?? 400, 'errors.api.invalidJsonBody');
                return;
            }
            if (apiError.code === 'API_INVALID_ADVENTURE_ID') {
                sendError(response, apiError.statusCode ?? 400, 'errors.api.invalidAdventureId');
                return;
            }
            sendError(response, apiError.statusCode ?? 500, 'errors.api.unexpectedServerError');
        }
    };
    return {
        name: 'adventures-api',
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
                if (request.method === 'DELETE') {
                    await deleteMonsterGroup(groupId);
                    response.statusCode = 204;
                    response.end();
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
const createNpcsApiPlugin = (): Plugin => {
    const handler: Connect.NextHandleFunction = async (request: MiddlewareRequest, response: ServerResponse, next: NextFunction) => {
        const url = new URL(request.url ?? '/', 'http://localhost');
        if (!url.pathname.startsWith('/api/npcs') && !url.pathname.startsWith('/api/npc-groups')) {
            next();
            return;
        }
        try {
            if (request.method === 'GET' && url.pathname === '/api/npc-groups') {
                sendJson(response, 200, { npcGroups: await listNpcGroups() });
                return;
            }
            if (request.method === 'POST' && url.pathname === '/api/npc-groups') {
                const payload = await readJsonBody(request);
                sendJson(response, 201, { npcGroup: await createNpcGroup(payload) });
                return;
            }
            const groupMatch = url.pathname.match(/^\/api\/npc-groups\/([^/]+)$/);
            if (groupMatch) {
                const groupId = groupMatch[1];
                if (!isSafeNpcGroupId(groupId)) {
                    sendError(response, 400, 'errors.api.invalidNpcGroupId');
                    return;
                }
                if (request.method === 'GET') {
                    sendJson(response, 200, { npcGroup: await readNpcGroup(groupId) });
                    return;
                }
                if (request.method === 'PUT') {
                    const payload = await readJsonBody(request);
                    sendJson(response, 200, { npcGroup: await updateNpcGroup(groupId, payload) });
                    return;
                }
                if (request.method === 'DELETE') {
                    await deleteNpcGroup(groupId);
                    response.statusCode = 204;
                    response.end();
                    return;
                }
            }
            if (request.method === 'GET' && url.pathname === '/api/npcs') {
                sendJson(response, 200, { npcs: await listNpcs() });
                return;
            }
            if (request.method === 'POST' && url.pathname === '/api/npcs') {
                sendJson(response, 201, { npc: await createNpc() });
                return;
            }
            const imageMatch = url.pathname.match(/^\/api\/npcs\/([^/]+)\/image$/);
            if (imageMatch) {
                const npcId = imageMatch[1];
                if (!isSafeNpcId(npcId)) {
                    sendError(response, 400, 'errors.api.invalidNpcId');
                    return;
                }
                if (request.method === 'GET') {
                    const image = await readNpcImage(npcId);
                    response.statusCode = 200;
                    response.setHeader('Content-Type', image.contentType);
                    response.end(image.data);
                    return;
                }
                if (request.method === 'PUT') {
                    const npc = await updateNpcImage(npcId, request.headers['content-type'], await readRawBody(request));
                    sendJson(response, 200, { npc });
                    return;
                }
                if (request.method === 'DELETE') {
                    const npc = await deleteNpcImage(npcId);
                    sendJson(response, 200, { npc });
                    return;
                }
            }
            const match = url.pathname.match(/^\/api\/npcs\/([^/]+)$/);
            if (match) {
                const npcId = match[1];
                if (!isSafeNpcId(npcId)) {
                    sendError(response, 400, 'errors.api.invalidNpcId');
                    return;
                }
                if (request.method === 'GET') {
                    sendJson(response, 200, { npc: await readNpc(npcId) });
                    return;
                }
                if (request.method === 'PUT') {
                    const payload = await readJsonBody(request);
                    sendJson(response, 200, {
                        npc: await updateNpc(npcId, payload),
                    });
                    return;
                }
                if (request.method === 'DELETE') {
                    await deleteNpc(npcId);
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
                sendError(response, 404, 'errors.api.npcNotFound');
                return;
            }
            if (apiError.code === 'API_INVALID_JSON_BODY') {
                sendError(response, apiError.statusCode ?? 400, 'errors.api.invalidJsonBody');
                return;
            }
            if (apiError.code === 'API_INVALID_MONSTER_ID') {
                sendError(response, apiError.statusCode ?? 400, 'errors.api.invalidNpcId');
                return;
            }
            if (apiError.code === 'API_INVALID_MONSTER_GROUP_ID') {
                sendError(response, apiError.statusCode ?? 400, 'errors.api.invalidNpcGroupId');
                return;
            }
            if (apiError.code === 'API_INVALID_MONSTER_GROUP_NAME') {
                sendError(response, apiError.statusCode ?? 400, 'errors.api.invalidNpcGroupName');
                return;
            }
            if (apiError.code === 'API_INVALID_MONSTER_IMAGE') {
                sendError(response, apiError.statusCode ?? 400, 'errors.api.invalidNpcImage');
                return;
            }
            sendError(response, apiError.statusCode ?? 500, 'errors.api.unexpectedServerError');
        }
    };
    return {
        name: 'npcs-api',
        configureServer(server) {
            server.middlewares.use(handler);
        },
        configurePreviewServer(server) {
            server.middlewares.use(handler);
        },
    };
};
const createPlacesApiPlugin = (): Plugin => {
    const handler: Connect.NextHandleFunction = async (request: MiddlewareRequest, response: ServerResponse, next: NextFunction) => {
        const url = new URL(request.url ?? '/', 'http://localhost');
        if (!url.pathname.startsWith('/api/places')) {
            next();
            return;
        }
        try {
            if (request.method === 'GET' && url.pathname === '/api/places') {
                sendJson(response, 200, { places: await listPlaces() });
                return;
            }
            if (request.method === 'POST' && url.pathname === '/api/places') {
                sendJson(response, 201, { place: await createPlace() });
                return;
            }
            const match = url.pathname.match(/^\/api\/places\/([^/]+)$/);
            if (match) {
                const placeId = match[1];
                if (!isSafePlaceId(placeId)) {
                    sendError(response, 400, 'errors.api.invalidPlaceId');
                    return;
                }
                if (request.method === 'GET') {
                    sendJson(response, 200, { place: await readPlace(placeId) });
                    return;
                }
                if (request.method === 'PUT') {
                    const payload = await readJsonBody(request);
                    sendJson(response, 200, {
                        place: await updatePlace(placeId, payload),
                    });
                    return;
                }
            }
            sendError(response, 404, 'errors.api.notFound');
        }
        catch (error) {
            const apiError = error as ApiError;
            if (apiError.code === 'ENOENT') {
                sendError(response, 404, 'errors.api.placeNotFound');
                return;
            }
            if (apiError.code === 'API_INVALID_JSON_BODY') {
                sendError(response, apiError.statusCode ?? 400, 'errors.api.invalidJsonBody');
                return;
            }
            if (apiError.code === 'API_INVALID_PLACE_ID') {
                sendError(response, apiError.statusCode ?? 400, 'errors.api.invalidPlaceId');
                return;
            }
            sendError(response, apiError.statusCode ?? 500, 'errors.api.unexpectedServerError');
        }
    };
    return {
        name: 'places-api',
        configureServer(server) {
            server.middlewares.use(handler);
        },
        configurePreviewServer(server) {
            server.middlewares.use(handler);
        },
    };
};
const createGeminiApiPlugin = (): Plugin => {
    const handler: Connect.NextHandleFunction = async (request: MiddlewareRequest, response: ServerResponse, next: NextFunction) => {
        const url = new URL(request.url ?? '/', 'http://localhost');
        if (!url.pathname.startsWith('/api/gemini')) {
            next();
            return;
        }
        try {
            if (request.method === 'POST' && url.pathname === '/api/gemini/responses') {
                const payload = await readJsonBody(request);
                sendJson(response, 200, await createGeminiResponse(payload));
                return;
            }
            if (request.method === 'POST' && url.pathname === '/api/gemini/tokens') {
                const payload = await readJsonBody(request);
                sendJson(response, 200, await countGeminiTokens(payload));
                return;
            }
            sendError(response, 404, 'errors.api.notFound');
        }
        catch (error) {
            const apiError = error as ApiError;
            if (apiError.code === 'API_INVALID_JSON_BODY') {
                sendError(response, apiError.statusCode ?? 400, 'errors.api.invalidJsonBody');
                return;
            }
            if (apiError.code === 'API_GEMINI_PROMPT_REQUIRED') {
                sendError(response, apiError.statusCode ?? 400, 'errors.api.geminiPromptRequired');
                return;
            }
            if (apiError.code === 'API_GEMINI_CONFIG_MISSING') {
                sendError(response, apiError.statusCode ?? 500, 'errors.api.geminiConfigMissing');
                return;
            }
            if (apiError.code === 'API_GEMINI_CONFIG_INVALID') {
                sendError(response, apiError.statusCode ?? 500, 'errors.api.geminiConfigInvalid');
                return;
            }
            if (apiError.code === 'API_GEMINI_API_KEY_MISSING') {
                sendError(response, apiError.statusCode ?? 500, 'errors.api.geminiApiKeyMissing');
                return;
            }
            if (apiError.code === 'API_GEMINI_UNAUTHORIZED') {
                sendError(response, apiError.statusCode ?? 401, 'errors.api.geminiUnauthorized');
                return;
            }
            if (apiError.code === 'API_GEMINI_RATE_LIMITED') {
                sendError(response, apiError.statusCode ?? 429, 'errors.api.geminiRateLimited');
                return;
            }
            sendError(response, apiError.statusCode ?? 500, 'errors.api.geminiRequestFailed');
        }
    };
    return {
        name: 'gemini-api',
        configureServer(server) {
            server.middlewares.use(handler);
        },
        configurePreviewServer(server) {
            server.middlewares.use(handler);
        },
    };
};
export default defineConfig({
    plugins: [react(), createCharactersApiPlugin(), createAdventuresApiPlugin(), createMonstersApiPlugin(), createNpcsApiPlugin(), createPlacesApiPlugin(), createGeminiApiPlugin()],
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
