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
    supplier: column.integer,
    image_url: column.text,
    created_at: column.text,
    updated_at: column.text
});

const users = new Table({
    id: column.text,
    email: column.text,
    role: column.text,
    created_at: column.text
});

const customers = new Table({
    id: column.text,
    name: column.text,
    email: column.text,
    phone: column.text,
    address: column.text,
    created_at: column.text
});

const orders = new Table({
    id: column.text,
    customer_id: column.text,
    total_amount: column.integer,
    status: column.text,
    created_by: column.text,
    created_at: column.text,
    sync_status: column.text
});

const order_items = new Table({
    id: column.text,
    order_id: column.text,
    product_id: column.text,
    quantity: column.integer,
    unit_price: column.integer,
    created_at: column.text
});

const reports = new Table({
    id: column.text,
    type: column.text,
    generated_at: column.text,
    data: column.text,
    file_url: column.text,
    created_at: column.text
});

const suppliers = new Table({
    id: column.integer,
    name: column.text,
    phone: column.text,
    created_at: column.text,
});

const stock_movements = new Table({
    id: column.text,
    product_id: column.text,
    quantity: column.integer,
    movement_type: column.text,
    description: column.text,
    created_at: column.text
});

export const AppSchema = new Schema({
    categories,
    products,
    users,
    customers,
    suppliers,
    orders,
    order_items,
    reports,
    stock_movements
});


export type Database = (typeof AppSchema)['types'];
export type CategoriesRecord = Database['categories'];
export type ProductsRecord = Database['products'];
export type UsersRecord = Database['users'];
export type CustomersRecord = Database['customers'];
export type OrdersRecord = Database['orders'];
export type OrderItemsRecord = Database['order_items'];
export type ReportsRecord = Database['reports'];
export type StockMovementsRecord = Database['stock_movements'];
export type SuppliersRecord = Database['suppliers'];
export type CreateCategoryDTO = Pick<CategoriesRecord, 'name'>;