import { getDatabase, quoteName } from './schema'
import { getMemberIds, getPayloadMetadata, parsePayload } from './utils'
import { normalizeStoredText } from './builders'
import type { EntityExistsRow, GroupMemberRelationOptions, GroupMemberRow } from './types'

export const executeEntityInsert = (
  tableName: string,
  id: string,
  payload: unknown,
  createdAt: string,
  updatedAt: string,
): void => {
  const metadata = getPayloadMetadata(payload)
  getDatabase().prepare(`
    INSERT INTO ${quoteName(tableName)} (id, unique_id, name, payload_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    id,
    metadata.uniqueId,
    metadata.name,
    JSON.stringify(payload),
    createdAt,
    updatedAt,
  )
}

export const executeEntityUpsert = (
  tableName: string,
  id: string,
  payload: unknown,
  updatedAt: string,
): void => {
  const metadata = getPayloadMetadata(payload)
  getDatabase().prepare(`
    INSERT INTO ${quoteName(tableName)} (id, unique_id, name, payload_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      unique_id = excluded.unique_id,
      name = excluded.name,
      payload_json = excluded.payload_json,
      updated_at = excluded.updated_at
  `).run(
    id,
    metadata.uniqueId,
    metadata.name,
    JSON.stringify(payload),
    updatedAt,
    updatedAt,
  )
}

export const stripGroupIds = <TData>(
  data: Partial<Record<keyof TData, unknown>>,
  options: GroupMemberRelationOptions<TData>,
): Partial<Record<keyof TData, unknown>> => {
  return {
    ...data,
    [options.idsKey]: [],
  }
}

export const getGroupMemberIds = <TData>(groupId: string, options: GroupMemberRelationOptions<TData>): string[] => {
  const rows = getDatabase().prepare(`
    SELECT ${quoteName(options.memberColumnName)} AS member_id
    FROM ${quoteName(options.relationTableName)}
    WHERE group_id = ?
    ORDER BY position ASC, ${quoteName(options.memberColumnName)} ASC
  `).all(groupId) as GroupMemberRow[]

  return rows.map((row) => row.member_id)
}

export const replaceGroupMembers = <TData>(
  groupId: string,
  memberIds: string[],
  options: GroupMemberRelationOptions<TData>,
): void => {
  const db = getDatabase()
  const memberExists = db.prepare(`SELECT id FROM ${quoteName(options.memberTableName)} WHERE id = ?`)
  const deleteMembers = db.prepare(`DELETE FROM ${quoteName(options.relationTableName)} WHERE group_id = ?`)
  const insertMember = db.prepare(`
    INSERT INTO ${quoteName(options.relationTableName)} (group_id, ${quoteName(options.memberColumnName)}, position)
    VALUES (?, ?, ?)
  `)

  deleteMembers.run(groupId)
  memberIds.forEach((memberId, index) => {
    const existingMember = memberExists.get(memberId) as EntityExistsRow | undefined
    if (!existingMember) {
      return
    }

    insertMember.run(groupId, memberId, index)
  })
}

export const attachGroupIds = <TData, TEntity>(
  entity: TEntity,
  options: GroupMemberRelationOptions<TData>,
): TEntity => {
  const id = (entity as { id: string }).id
  const memberIds = getGroupMemberIds(id, options)
  return {
    ...entity,
    [options.idsKey]: memberIds,
  }
}

