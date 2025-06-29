// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define a service using a base URL and expected endpoints
export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery(),
    keepUnusedDataFor: 1800,
    endpoints: () => ({}),
    tagTypes: [
        'Followings',
        'Followers'
    ]
})
