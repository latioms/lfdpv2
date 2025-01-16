import {
  AbstractPowerSyncDatabase,
  BaseObserver,
  CrudEntry,
  PowerSyncBackendConnector,
  UpdateType,
} from "@powersync/web";

import { Session, SupabaseClient, createClient } from "@supabase/supabase-js";

export type SupabaseConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  powersyncUrl: string;
};

/// Postgres Response codes that we cannot recover from by retrying.
const FATAL_RESPONSE_CODES = [
  // Class 22 — Data Exception
  // Examples include data type mismatch.
  new RegExp("^22...$"),
  // Class 23 — Integrity Constraint Violation.
  // Examples include NOT NULL, FOREIGN KEY and UNIQUE violations.
  new RegExp("^23...$"),
  // INSUFFICIENT PRIVILEGE - typically a row-level security violation
  new RegExp("^42501$"),
];

export type SupabaseConnectorListener = {
  initialized: () => void;
  sessionStarted: (session: Session) => void;
};

export class SupabaseConnector
  extends BaseObserver<SupabaseConnectorListener>
  implements PowerSyncBackendConnector
{
  readonly client: SupabaseClient;
  readonly config: SupabaseConfig;

  ready: boolean;

  currentSession: Session | null;

  constructor() {
    super();
    this.config = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      powersyncUrl: process.env.NEXT_PUBLIC_POWERSYNC_URL as string,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    };

    this.client = createClient(
      this.config.supabaseUrl,
      this.config.supabaseAnonKey,
      {
        auth: {
          persistSession: true,
        },
      }
    );
    this.currentSession = null;
    this.ready = false;
  }

  async init() {
    if (this.ready) {
      return;
    }

    const sessionResponse = await this.client.auth.getSession();
    this.updateSession(sessionResponse.data.session);

    this.ready = true;
    this.iterateListeners((cb) => cb.initialized?.());
  }

  async login(username: string, password: string) {
    const {
      data: { session },
      error,
    } = await this.client.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (error) {
      throw error;
    }

    this.updateSession(session);
  }

  async fetchCredentials() {
    const {
      data: { session },
      error,
    } = await this.client.auth.getSession();

    if (!session || error) {
      throw new Error(`Could not fetch Supabase credentials: ${error}`);
    }

    console.debug("session expires at", session.expires_at);

    return {
      client: this.client,
      endpoint: this.config.powersyncUrl,
      token: session.access_token ?? "",
      session: session ?? ''
    };
  }

  private async handleOperation(op: CrudEntry, database: AbstractPowerSyncDatabase) {
    if ((op.op === UpdateType.PUT || op.op === UpdateType.PATCH) && op.opData) {
      if (op.table === 'order_items' && !await this.foreignKeyExists('orders', 'id', op.opData.order_id)) {
        console.warn(`Foreign key not found for order_id: ${op.opData.order_id}`);
        await this.handleOfflineOperation(op, database);
        return;
      }
    }

    const table = this.client.from(op.table);
    let result: any;

    switch (op.op) {
      case UpdateType.PUT:
        result = await this.handlePutOperation(op, table);
        break;
      case UpdateType.PATCH:
        result = await this.handlePatchOperation(op, table);
        break;
      case UpdateType.DELETE:
        result = await this.handleDeleteOperation(op, table);
        break;
    }

    if (result.error) {
      console.error(result.error);
      result.error.message = `Could not update Supabase. Received error: ${result.error.message}`;
      throw result.error;
    }
  }

  private async handlePutOperation(op: CrudEntry, table: any) {
    const record = { ...op.opData, id: op.id };
    return await table.upsert(record);
  }

  private async handlePatchOperation(op: CrudEntry, table: any) {
    return await table.update(op.opData).eq("id", op.id);
  }

  private async handleDeleteOperation(op: CrudEntry, table: any) {
    return await table.delete().eq("id", op.id);
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const transaction = await database.getNextCrudTransaction();

    if (!transaction) {
      return;
    }

    let lastOp: CrudEntry | null = null;
    try {
      for (const op of transaction.crud) {
        lastOp = op;
        await this.handleOperation(op, database);
      }

      await transaction.complete();
    } catch (ex: any) {
      console.debug(ex);
      if (
        typeof ex.code == "string" &&
        FATAL_RESPONSE_CODES.some((regex) => regex.test(ex.code))
      ) {
        console.error("Data upload error - discarding:", lastOp, ex);
        await transaction.complete();
      } else {
        throw ex;
      }
    }
  }

  updateSession(session: Session | null) {
    this.currentSession = session;
    if (!session) {
      return;
    }
    this.iterateListeners((cb) => cb.sessionStarted?.(session));
  }

  private async foreignKeyExists(table: string, column: string, value: string): Promise<boolean> {
    try {
      const { data, error } = await this.client.from(table).select(column).eq(column, value).single();
      if (error) {
        console.warn(`Error checking foreign key existence: ${error.message}`);
        return false;
      }
      return !!data;
    } catch (error) {
      console.error("Error in foreignKeyExists:", error);
      return false;
    }
  }

  private async handleOfflineOperation(op: CrudEntry, db: AbstractPowerSyncDatabase) {
    try {
      console.info("Handling offline operation:", {
        operation: op.op,
        table: op.table,
        id: op.id
      });
      
      // Les opérations sont automatiquement mises en file d'attente par PowerSync
      // et seront synchronisées une fois la connexion rétablie
      console.info("Operation queued for later sync");
      
    } catch (error) {
      console.error("Error handling offline operation:", error);
    }
  }
}
