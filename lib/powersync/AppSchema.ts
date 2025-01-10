import { column, Schema, Table } from "@powersync/web";

const categories = new Table({
    id: column.text,
    name: column.text,
    created_at: column.text
});

export const AppSchema = new Schema({
    categories
});

export type Database = (typeof AppSchema)['types'];
export type CategoriesRecord = Database['categories'];