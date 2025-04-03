import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Property {
    id: string;
    name: string;
    address: string;
    ownerId: string;
    tenants: string[];
    maintenanceRequests: string[];
    createdAt: string;
    updatedAt: string;
}

interface PropertyState {
    properties: Property[];
    currentProperty: Property | null;
    loading: boolean;
    error: string | null;
}

const initialState: PropertyState = {
    properties: [],
    currentProperty: null,
    loading: false,
    error: null,
};

const propertySlice = createSlice({
    name: 'property',
    initialState,
    reducers: {
        fetchPropertiesStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchPropertiesSuccess: (state, action: PayloadAction<Property[]>) => {
            state.properties = action.payload;
            state.loading = false;
            state.error = null;
        },
        fetchPropertiesFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        setCurrentProperty: (state, action: PayloadAction<Property>) => {
            state.currentProperty = action.payload;
        },
        addProperty: (state, action: PayloadAction<Property>) => {
            state.properties.push(action.payload);
        },
        updateProperty: (state, action: PayloadAction<Property>) => {
            const index = state.properties.findIndex(p => p.id === action.payload.id);
            if (index !== -1) {
                state.properties[index] = action.payload;
            }
        },
        deleteProperty: (state, action: PayloadAction<string>) => {
            state.properties = state.properties.filter(p => p.id !== action.payload);
        },
        clearError: (state) => {
            state.error = null;
        },
    },
});

export const {
    fetchPropertiesStart,
    fetchPropertiesSuccess,
    fetchPropertiesFailure,
    setCurrentProperty,
    addProperty,
    updateProperty,
    deleteProperty,
    clearError,
} = propertySlice.actions;

export default propertySlice.reducer; 