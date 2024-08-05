import { relations } from "drizzle-orm/relations";
import { folders, files, sessions, usersInAuth, users, customers, products, prices, subscriptions, collaborators } from "./schema";

export const filesRelations = relations(files, ({one}) => ({
	folder: one(folders, {
		fields: [files.folder_id],
		references: [folders.id]
	}),
	session: one(sessions, {
		fields: [files.session_id],
		references: [sessions.id]
	}),
}));

export const foldersRelations = relations(folders, ({one, many}) => ({
	files: many(files),
	session: one(sessions, {
		fields: [folders.session_id],
		references: [sessions.id]
	}),
}));

export const sessionsRelations = relations(sessions, ({many}) => ({
	files: many(files),
	folders: many(folders),
	collaborators: many(collaborators),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [users.id],
		references: [usersInAuth.id]
	}),
	subscriptions: many(subscriptions),
	collaborators: many(collaborators),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	users: many(users),
	customers: many(customers),
	subscriptions: many(subscriptions),
}));

export const customersRelations = relations(customers, ({one}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [customers.id],
		references: [usersInAuth.id]
	}),
}));

export const pricesRelations = relations(prices, ({one, many}) => ({
	product: one(products, {
		fields: [prices.product_id],
		references: [products.id]
	}),
	subscriptions_price_id: many(subscriptions, {
		relationName: "subscriptions_price_id_prices_id"
	}),
	subscriptions_price_id: many(subscriptions, {
		relationName: "subscriptions_price_id_prices_id"
	}),
}));

export const productsRelations = relations(products, ({many}) => ({
	prices: many(prices),
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

export const collaboratorsRelations = relations(collaborators, ({one}) => ({
	session: one(sessions, {
		fields: [collaborators.session_id],
		references: [sessions.id]
	}),
	user: one(users, {
		fields: [collaborators.user_id],
		references: [users.id]
	}),
}));