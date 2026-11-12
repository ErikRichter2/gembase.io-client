import type { IQuery } from '@/router/queryModelComposable'

export interface GapsQueryParams extends IQuery {
    show?: string
    labels?: string
    rank1?: string
    rank2?: string
    rank3?: string
}
