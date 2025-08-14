// src/dataApi.ts
import * as realApi from './api'
import * as fakeApi from './fakeApi'

const useRealApi = import.meta.env.VITE_USE_REAL_API === 'true'
console.log('Using API:', useRealApi ? 'Real API' : 'Fake API')
export const dataApi = useRealApi ? realApi : fakeApi
export const isRealApi = useRealApi