import { type TTagId, type TagDetail } from '@/models/portal/apps/AppsData'
import { TagsHelper } from '@/models/portal/tags/TagsHelper'
import { type ITagsDetailsQuery } from '@/models/portal/auditor/AuditorData'
import router from '@/router'

export class QueryUtils {
    static getStringOrUndefined(queryKey: string): string | undefined {
        return router.currentRoute.value.query[queryKey] as string | undefined
    }

    static tagsDetailsFromQuery(query?: ITagsDetailsQuery) {
        const res: TagDetail[] = []

        if (query === undefined) {
            query = {
                labels: router.currentRoute.value.query['labels'] as string | undefined,
                rank1: router.currentRoute.value.query['rank1'] as string | undefined,
                rank2: router.currentRoute.value.query['rank2'] as string | undefined,
                rank3: router.currentRoute.value.query['rank3'] as string | undefined,
            }
        }

        if (query.labels !== undefined) {
            const t: TTagId[] = query.labels.split(',')
            const t1: TTagId[] = query.rank1 !== undefined ? query.rank1.split(',') : []
            const t2: TTagId[] = query.rank2 !== undefined ? query.rank2.split(',') : []
            const t3: TTagId[] = query.rank3 !== undefined ? query.rank3.split(',') : []

            t.forEach((x) => {
                let tagRank = 0
                if (t1.includes(x)) {
                    tagRank = TagsHelper.TAG_RANK_PRIMARY
                } else if (t2.includes(x)) {
                    tagRank = TagsHelper.TAG_RANK_SECONDARY
                } else if (t3.includes(x)) {
                    tagRank = TagsHelper.TAG_RANK_TERTIARY
                }
                res.push({
                    tag_id: x,
                    tag_rank: tagRank,
                })
            })
        }

        return res
    }

    static tagsDetailsToQuery(tagsDetails: TagDetail[]): ITagsDetailsQuery {
        const res: ITagsDetailsQuery = {}

        const tags: TTagId[] = []
        const r1: TTagId[] = []
        const r2: TTagId[] = []
        const r3: TTagId[] = []

        tagsDetails.forEach((x) => {
            tags.push(x.tag_id)
            if (x.tag_rank === TagsHelper.TAG_RANK_PRIMARY) {
                r1.push(x.tag_id)
            } else if (x.tag_rank === TagsHelper.TAG_RANK_SECONDARY) {
                r2.push(x.tag_id)
            } else if (x.tag_rank === TagsHelper.TAG_RANK_TERTIARY) {
                r3.push(x.tag_id)
            }
        })

        if (tags.length > 0) {
            res.labels = tags.join(',')
        }
        if (r1.length > 0) {
            res.rank1 = r1.join(',')
        }
        if (r2.length > 0) {
            res.rank2 = r2.join(',')
        }
        if (r3.length > 0) {
            res.rank3 = r2.join(',')
        }

        return res
    }
}
