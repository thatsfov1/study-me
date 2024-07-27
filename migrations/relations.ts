import { relations } from "drizzle-orm/relations";
import { sessions, folders, files, usersInAuth, users, customers, products, prices, subscriptions } from "./schema";

export const foldersRelations = relations(folders, ({one, many}) => ({
	session: one(sessions, {
		fields: [folders.session_id],
		references: [sessions.id]
	}),
	files: many(files),
}));

export const sessionsRelations = relations(sessions, ({many}) => ({
	folders: many(folders),
	files: many(files),
}));

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

export const usersRelations = relations(users, ({one}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [users.id],
		references: [usersInAuth.id]
	}),
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
	subscriptions: many(subscriptions),
}));

export const productsRelations = relations(products, ({many}) => ({
	prices: many(prices),
}));

export const subscriptionsRelations = relations(subscriptions, ({one}) => ({
	price: one(prices, {
		fields: [subscriptions.price_id],
		references: [prices.id]
	}),
	usersInAuth: one(usersInAuth, {
		fields: [subscriptions.user_id],
		references: [usersInAuth.id]
	}),
}));