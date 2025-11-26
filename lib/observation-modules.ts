import { ModuleType } from './types';

export interface ObservationModuleConfig {
    type: ModuleType;
    title: string;
    icon: string;
    color: string;
    description: string;
}

export const OBSERVATION_MODULES: Record<ModuleType, ObservationModuleConfig> = {
    BOWEL_MONITORING: {
        type: 'BOWEL_MONITORING',
        title: 'Bowel Monitoring',
        icon: 'medical',
        color: '#8B5CF6',
        description: 'Track bowel movements',
    },
    FLUID_INTAKE: {
        type: 'FLUID_INTAKE',
        title: 'Fluid Intake',
        icon: 'water',
        color: '#3B82F6',
        description: 'Record fluid consumption',
    },
    BGL_MONITORING: {
        type: 'BGL_MONITORING',
        title: 'Blood Glucose',
        icon: 'fitness',
        color: '#EF4444',
        description: 'Monitor blood glucose levels',
    },
    SEIZURE_MONITORING: {
        type: 'SEIZURE_MONITORING',
        title: 'Seizure Monitoring',
        icon: 'pulse',
        color: '#F59E0B',
        description: 'Record seizure events',
    },
    BEHAVIOUR_OBSERVATION: {
        type: 'BEHAVIOUR_OBSERVATION',
        title: 'Behaviour',
        icon: 'happy',
        color: '#10B981',
        description: 'Observe and record behaviour',
    },
};

export function getEnabledModules(enabledModuleTypes?: ModuleType[]): ObservationModuleConfig[] {
    if (!enabledModuleTypes || enabledModuleTypes.length === 0) {
        return [];
    }

    return enabledModuleTypes
        .map(type => OBSERVATION_MODULES[type])
        .filter(Boolean);
}
