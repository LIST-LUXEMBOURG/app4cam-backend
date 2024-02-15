// © 2022-2024 Luxembourg Institute of Science and Technology
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
