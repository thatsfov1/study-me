import { pgTable, text ,timestamp, uuid } from 'drizzle-orm/pg-core'

export const sessions = pgTable('sessions', {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    createdAt: timestamp('created_at',{
        withTimezone:true,
        mode:'string'
    }),
    sessionOwner: uuid('session_owner').notNull(),
    title: uuid('title').notNull(),
    data: text('data'),
    inTrash: text('in_trash')
})