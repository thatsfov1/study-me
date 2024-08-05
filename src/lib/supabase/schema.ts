import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { prices, subscription_status, users } from "../../../migrations/schema";
import { sql } from "drizzle-orm";

export const environments = pgTable("environments", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  created_at: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  })
    .defaultNow()
    .notNull(),
  environment_owner: uuid("environment_owner").notNull(),
  title: text("title").notNull(),
  data: text("data"),
  in_trash: text("in_trash"),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  created_at: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  })
    .defaultNow()
    .notNull(),
  title: text("title").notNull(),
  data: text("data"),
  in_trash: text("in_trash"),
  environment_id: uuid("environment_id").notNull().references(() => environments.id, {
    onDelete: "cascade",
  }),
});

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey().notNull(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id),
  status: subscription_status("status"),
  metadata: jsonb("metadata"),
  price_id: text("price_id").references(() => prices.id),
  quantity: integer("quantity"),
  cancel_at_period_end: boolean("cancel_at_period_end"),
  created: timestamp("created", { withTimezone: true, mode: "string" })
    .default(sql`now()`)
    .notNull(),
  current_period_start: timestamp("current_period_start", {
    withTimezone: true,
    mode: "string",
  })
    .default(sql`now()`)
    .notNull(),
  current_period_end: timestamp("current_period_end", {
    withTimezone: true,
    mode: "string",
  })
    .default(sql`now()`)
    .notNull(),
  ended_at: timestamp("ended_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`now()`),
  cancel_at: timestamp("cancel_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`now()`),
  canceled_at: timestamp("canceled_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`now()`),
  trial_start: timestamp("trial_start", {
    withTimezone: true,
    mode: "string",
  }).default(sql`now()`),
  trial_end: timestamp("trial_end", {
    withTimezone: true,
    mode: "string",
  }).default(sql`now()`),
});

export const collaborators = pgTable("collaborators", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  environment_id: uuid("environment_id")
    .notNull()
    .references(() => environments.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  })
    .defaultNow()
    .notNull(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});
