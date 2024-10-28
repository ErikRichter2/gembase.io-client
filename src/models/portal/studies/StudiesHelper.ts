import {
    PortalStudiesDef,
    PortalStudiesStudy,
    PortalStudiesStudyAudience, PortalStudiesStudyConceptFeaturePool,
    PortalStudiesStudyConceptHeader
} from "@/models/portal/studies/StudiesData";
import ClientError from "@/core/errors/ClientError";

export class StudiesHelper {

    private static __def: PortalStudiesDef;

    public static init(def: PortalStudiesDef) {
        StudiesHelper.__def = def;
    }

    public static getConceptsCount(headers: PortalStudiesStudyConceptHeader[], features: PortalStudiesStudyConceptFeaturePool[]) {
        let res = headers.length;
        const poolsCnt: Map<string, number> = new Map<string, number>();

        features.forEach((x) => {
            poolsCnt.set(x.pool_id, (poolsCnt.get(x.pool_id) ?? 0) + 1);
        });

        for (const cnt of poolsCnt.values()) {
            res *= cnt;
        }

        return res;
    }

    public static getConceptsCountForStudy(study: PortalStudiesStudy) {
        if (study.dcm_concepts !== null) {
            return this.getConceptsCount(study.dcm_concepts.headers, study.dcm_concepts.features);
        }
        return 0;
    }

    public static getAudiencesCount(study: PortalStudiesStudy) {
        if (this.isInternal(study)) {
            return study.internal_respondents;
        } else {
            let res = 0;
            study.audiences.forEach((x) => {
                res += x.people;
            });
            return res;
        }
    }

    public static isInternal(study: PortalStudiesStudy) {
        return study.audiences.length === 0;
    }

    public static getPrice(study: PortalStudiesStudy) {
        let res = 0;
        study.audiences.forEach((x) => {
            res += this.getAudiencePrice(x);
        });
        return res;
    }

    public static getAudiencePrice(audience: PortalStudiesStudyAudience) {
        let res = 0;
        let cpi = 0;
        for (let i = 0; i < this.__def.countries.length; ++i) {
            if (this.__def.countries[i].country_id === audience.country_id) {
                cpi = this.__def.countries[i].survey_cpi;
                break;
            }
        }
        if (cpi === 0) {
            throw new ClientError(`CPI for country "${audience.country_id}" not found`);
        }
        res += audience.people * cpi;
        return res;
    }

    public static getAgePercentage(study: PortalStudiesStudy, audienceGuid: string, ageId: string) {
        for (let i = 0; i < study.audiences.length; ++i) {
            if (study.audiences[i].guid === audienceGuid) {
                for (let j = 0; j < study.audiences[i].ages.length; ++j) {
                    if (study.audiences[i].ages[j].id === ageId) {
                        return study.audiences[i].ages[j].value;
                    }
                }
                return 0;
            }
        }
        return 0;
    }

    public static setAgePercentage(study: PortalStudiesStudy, audienceGuid: string, ageId: string, value: number) {
        for (let i = 0; i < study.audiences.length; ++i) {
            if (study.audiences[i].guid === audienceGuid) {
                let found = false;
                for (let j = 0; j < study.audiences[i].ages.length; ++j) {
                    if (study.audiences[i].ages[j].id === ageId) {
                        found = true;
                        study.audiences[i].ages[j].value = value;
                        return;
                    }
                }
                if (!found) {
                    study.audiences[i].ages.push({
                        id: ageId,
                        value: value
                    });
                    return;
                }
            }
        }
    }

    public static isReadOnly(study: PortalStudiesStudy) {
        return study.state !== "edit";
    }
}