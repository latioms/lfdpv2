"use client";
import { PowerSyncContext } from "@powersync/react";
import { PowerSyncDatabase } from "@powersync/web";
import Logger from "js-logger";
import React, { Suspense, useEffect, useState } from "react";
import { AppSchema } from "@/lib/powersync/AppSchema";
import { SupabaseConnector } from "@/lib/powersync/SupabaseConnector";

Logger.useDefaults();
Logger.setLevel(Logger.DEBUG);

export const SystemProvider = ({ children }: { children: React.ReactNode }) => {
  const [powerSync, setPowerSync] = useState<PowerSyncDatabase | null>(null);

  useEffect(() => {
    const ps = new PowerSyncDatabase({
      database: { dbFilename: "powersync2.db" },
      schema: AppSchema,
      flags: {
        disableSSRWarning: true,
        enableMultiTabs: true,
      },
    });
    
    const connector = new SupabaseConnector();
    ps.connect(connector);
    
    setPowerSync(ps);
  }, []);

  if (!powerSync) {
    return <div>Chargement de la base de données...</div>;
  }

  return (
    <Suspense fallback={"Chargement..."}>
      <PowerSyncContext.Provider value={powerSync}>
        {children}
      </PowerSyncContext.Provider>
    </Suspense>
  );
};

export default SystemProvider;
