import type { IQuery } from '@/router/queryModelComposable'
import { ref } from 'vue'

export interface AuditorQueryParams extends IQuery, ITagsDetailsQuery {
    audienceAngle?: string
    opportunity?: string
    show?: 'audit'
    appId?: string
    labels?: string
    rank1?: string
    rank2?: string
    rank3?: string
}

export interface ITagsDetailsQuery extends IQuery {
    labels?: string
    rank1?: string
    rank2?: string
    rank3?: string
}

export const tunerPopupState = ref(-1)
