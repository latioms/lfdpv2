"use client";
import { PowerSyncContext } from "@powersync/react";
import { PowerSyncDatabase } from "@powersync/web";
import Logger from "js-logger";
import React, { Suspense, useEffect, useState } from "react";
import { AppSchema } from "@/lib/powersync/AppSchema";
import { SupabaseConnector } from "@/lib/powersync/SupabaseConnector";
import { useRouter } from 'next/navigation';

export const SystemProvider = ({ children }: { children: React.ReactNode }) => {
  Logger.useDefaults();
  Logger.setLevel(Logger.DEBUG);
  const [powerSync, setPowerSync] = useState<PowerSyncDatabase | null>(null);
  const router = useRouter();

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
    
    // Écouter les changements de session
    connector.registerListener({
      initialized: () => {},
      sessionStarted: () => {
      }
    });

    ps.connect(connector);
    setPowerSync(ps);

    // Vérifier la session initiale
    connector.init().then(() => {
      if (!connector.currentSession) {
        router.push('/login');
      }
    });
  }, [router]);

  if (!powerSync) {
    return <div>Chargement de la base de données...</div>;
  }

  // Ne pas afficher les enfants s'il n'y a pas de session

  return (
    <Suspense fallback={"Chargement..."}>
      <PowerSyncContext.Provider value={powerSync}>
        {children}
      </PowerSyncContext.Provider>
    </Suspense>
  );
};

export default SystemProvider;
