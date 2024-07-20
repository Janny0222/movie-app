import {
    configureStore,
    combineReducers,
} from '@reduxjs/toolkit'

const rootReducer = combineReducers({
    // Add reducer here
})

// initial state
const initialState = {};


export const store = configureStore({
    reducer: rootReducer,
    
})