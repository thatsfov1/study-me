import { relations } from "drizzle-orm/relations";
import { usersInAuth, customers, environments, sessions, prices, subscriptions, users, collaborators, products, tasks } from "./schema";

export const customersRelations = relations(customers, ({one}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [customers.id],
		references: [usersInAuth.id]
	}),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	customers: many(customers),
	subscriptions: many(subscriptions),
	users: many(users),
}));

export const sessionsRelations = relations(sessions, ({one, many}) => ({
	environment: one(environments, {
		fields: [sessions.environment_id],
		references: [environments.id]
	}),
	tasks: many(tasks),
}));

export const environmentsRelations = relations(environments, ({many}) => ({
	sessions: many(sessions),
	collaborators: many(collaborators),
	tasks: many(tasks),
}));

export const subscriptionsRelations = relations(subscriptions, ({one}) => ({
	price_price_id: one(prices, {
		fields: [subscriptions.price_id],
		references: [prices.id],
		relationName: "subscriptions_price_id_prices_id"
	}),
	price_price_id: one(prices, {
		fields: [subscriptions.price_id],
		references: [prices.id],
		relationName: "subscriptions_price_id_prices_id"
	}),
	usersInAuth: one(usersInAuth, {
		fields: [subscriptions.user_id],
		references: [usersInAuth.id]
	}),
	user: one(users, {
		fields: [subscriptions.user_id],
		references: [users.id]
	}),
}));

export const pricesRelations = relations(prices, ({one, many}) => ({
	subscriptions_price_id: many(subscriptions, {
		relationName: "subscriptions_price_id_prices_id"
	}),
	subscriptions_price_id: many(subscriptions, {
		relationName: "subscriptions_price_id_prices_id"
	}),
	product: one(products, {
		fields: [prices.product_id],
		references: [products.id]
	}),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	subscriptions: many(subscriptions),
	usersInAuth: one(usersInAuth, {
		fields: [users.id],
		references: [usersInAuth.id]
	}),
	collaborators: many(collaborators),
}));

export const collaboratorsRelations = relations(collaborators, ({one}) => ({
	environment: one(environments, {
		fields: [collaborators.environment_id],
		references: [environments.id]
	}),
	user: one(users, {
		fields: [collaborators.user_id],
		references: [users.id]
	}),
}));

export const productsRelations = relations(products, ({many}) => ({
	prices: many(prices),
}));

export const tasksRelations = relations(tasks, ({one}) => ({
	environment: one(environments, {
		fields: [tasks.environment_id],
		references: [environments.id]
	}),
	session: one(sessions, {
		fields: [tasks.session_id],
		references: [sessions.id]
	}),
}));