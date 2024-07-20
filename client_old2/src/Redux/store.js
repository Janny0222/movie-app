import {
    configureStore,
    combineReducers,
} from '@reduxjs/toolkit'
import * as User from './Reducers/userReducers';

const rootReducer = combineReducers({
    // Add user reducer here
    userLogin: User.userLoginReducer,
    userRegister: User.userRegisterReducer
})

// get userInfo from localStorage
const userInfoFromStorage = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null;

// initial state
const initialState = {userInfo: userInfoFromStorage};


export const store = configureStore({
    reducer: rootReducer,
    preloadedState: initialState
})