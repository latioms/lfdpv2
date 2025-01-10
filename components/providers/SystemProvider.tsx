"use client";
import { PowerSyncContext } from "@powersync/react";
import { PowerSyncDatabase } from "@powersync/web";
import Logger from "js-logger";
import React, { Suspense } from "react";
import { AppSchema } from "@/lib/powersync/AppSchema";
import { SupabaseConnector } from "@/lib/powersync/SupabaseConnector";

Logger.useDefaults();
Logger.setLevel(Logger.DEBUG);

const powerSync = new PowerSyncDatabase({
  database: { dbFilename: "powersync2.db" },
  schema: AppSchema,
  flags: {
    disableSSRWarning: true,
    enableMultiTabs: true,
  },
});
const connector = new SupabaseConnector();

powerSync.connect(connector);

export const SystemProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense fallback={"Loading..."}>
      <PowerSyncContext.Provider value={powerSync}>
        {children}
      </PowerSyncContext.Provider>
    </Suspense>
  );
};

export default SystemProvider;
