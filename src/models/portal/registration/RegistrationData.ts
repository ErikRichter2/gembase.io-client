import {
    type UserPositionAreaDef,
    type UserPositionRoleDef,
} from '@/models/portal/definitions/DefinitionsData'
import type { IQuery } from '@/router/queryModelComposable'

export interface RegistrationQueryParams extends IQuery {
    request?: string
    test?: string
    email?: string
}

export interface RegistrationConfirmDef {
    state: 'register' | 'platform' | 'whitelist_pending'
    position_role_def?: UserPositionRoleDef[]
    position_area_def?: UserPositionAreaDef[]
    dev_title?: string
    user_data?: RegistrationUserData
}

export interface RegistrationUserData {
    email: string
    name: string
    position_role: number
    position_area: number
    password: string
}
