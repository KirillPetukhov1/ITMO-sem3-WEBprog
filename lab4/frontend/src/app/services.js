import { config } from '../config.js'
import { createHttpClient } from '../api/http/baseHttpClient.js'
import { createAuthorizedClient } from '../api/http/authorizedClient.js'
import { createAuthApi } from '../api/authApi.js'
import { createStudentsApi } from '../api/studentsApi.js'
import { sessionStore } from '../state/sessionStore.js'
import { createSessionService } from '../auth/sessionService.js'
const http = createHttpClient({
  baseUrl: config.apiBaseUrl,
  timeout: config.requestTimeout
})

export const authApi = createAuthApi(http)

export const session = createSessionService(sessionStore, authApi)

export const studentsApi = createStudentsApi(createAuthorizedClient(http, session))
