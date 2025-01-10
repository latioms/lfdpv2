import { column, Schema, Table } from "@powersync/web";

const categories = new Table({
    id: column.text,
    name: column.text,
    created_at: column.text
});

const products = new Table({
    id: column.text,
    name: column.text,
    description: column.text,
    price: column.integer,
    stock_quantity: column.integer,
    alert_threshold: column.integer,
    category_id: column.text,
    image_url: column.text,
    created_at: column.text,
    updated_at: column.text
});

export const AppSchema = new Schema({
    categories,
    products
});

export type Database = (typeof AppSchema)['types'];
export type CategoriesRecord = Database['categories'];