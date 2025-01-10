// hooks/usePowerSync.ts
import { useContext } from 'react';
import { PowerSyncContext } from '@powersync/react';
import { AbstractPowerSyncDatabase } from '@powersync/web';

export const usePowerSync = (): AbstractPowerSyncDatabase => {
  const powerSync = useContext(PowerSyncContext);

  if (!powerSync) {
    throw new Error('usePowerSync must be used within a PowerSyncContext.Provider');
  }

  return powerSync;
};
