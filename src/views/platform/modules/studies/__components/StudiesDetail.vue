<script setup lang="ts">

import {UiUtils} from "@/utils/UiUtils";
import {useStudiesStore} from "@/models/portal/studies/StudiesStore";
import GembaseUiSelect from "@/views/ui/GembaseUiSelect.vue";
import {computed, onMounted, ref, watch} from "vue";
import {SelectOptionItem} from "@/views/ui/UiData";
import {StudiesHelper} from "@/models/portal/studies/StudiesHelper";
import GembaseUtils from "@/utils/GembaseUtils";
import GembaseUiWindowCloseBtn from "@/views/ui/GembaseUiWindowCloseBtn.vue";
import {PortalStudiesQuery, PortalStudiesStudy, PortalStudiesStudyAudience} from "@/models/portal/studies/StudiesData";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import GbWindow from "@/views/ui/popups/GbWindow.vue";
import {usePortalStore} from "@/models/portal/PortalStore";
import GbSvg from "@/views/ui/icons/GbSvg.vue";

const studiesStore = useStudiesStore();
const portalStore = usePortalStore();

const traitsPopup = ref<PortalStudiesStudyAudience>();

let saveTimeout = 0;

onMounted(() => {
    if (!studiesStore.hasStudy(studiesStore.routerQuery.query.study)) {
        studiesStore.routerQuery.replace({
            study: undefined,
            show: undefined
        });
        return;
    }
});

const study = computed(() => {
    if (studiesStore.routerQuery.query.study !== undefined) {
        return studiesStore.getStudy(studiesStore.routerQuery.query.study);
    }
    return undefined as unknown as PortalStudiesStudy;
});

const audienceCountriesSelectOptions = computed((): SelectOptionItem[] => {
    const res: SelectOptionItem[] = [];

    studiesStore.def.countries.forEach((x) => {
        res.push({
            id: x.country_id.toString(),
            value: `<div class="gb-layout-ml-row"><img src="${UiUtils.getFlagIcon(x.country)}" style="border-radius: 50%; height: 15px; width: auto;"><span>${x.name}</span></div>`
        });
    });

    return res;
});

function getAudienceCountriesSelectedIndex(countryId: string) {
    for (let i = 0; i < audienceCountriesSelectOptions.value.length; ++i) {
        if (audienceCountriesSelectOptions.value[i].id === countryId) {
            return i;
        }
    }
    return 0;
}

function addAudience() {
    const countryDef = studiesStore.def.countries[0];

    const defaultTraits: number[] = [];
    studiesStore.def.traits.forEach((x) => {
        if (x.study_default === 1) {
            defaultTraits.push(x.id);
        }
    });

    study.value.audiences.push({
        country_id: countryDef.country_id,
        guid: GembaseUtils.guid(),
        people: 0,
        ages: [],
        males: 0,
        traits: defaultTraits
    });
}

function removeAudience(audienceGuid: string) {
    for (let i = 0; i < study.value.audiences.length; ++i) {
        if (study.value.audiences[i].guid === audienceGuid) {
            study.value.audiences.splice(i, 1);
            break;
        }
    }
}

watch(() => study.value.name, (value, prev) => {
    if (saveTimeout === 0) {
        saveTimeout = window.setTimeout(() => {
            saveTimeout = 0;
            studiesStore.saveStudy(study.value);
        }, 500);
    }
});

watch(study.value, (value, prev) => {
    if (saveTimeout === 0) {
        saveTimeout = window.setTimeout(() => {
            saveTimeout = 0;
            studiesStore.saveStudy(study.value);
        }, 2000);
    }
});

watch(study.value.audiences, (value, prev) => {
    if (saveTimeout === 0) {
        saveTimeout = window.setTimeout(() => {
            saveTimeout = 0;
            studiesStore.saveStudy(study.value);
        }, 2000);
    }
});

function getTraitsText(audience: PortalStudiesStudyAudience) {
    const arr: string[] = [];
    audience.traits.forEach((x) => {
        for (let i = 0; i < studiesStore.def.traits.length; ++i) {
            if (studiesStore.def.traits[i].id === x) {
                arr.push(studiesStore.def.traits[i].name);
            }
        }
    });

    return arr.join(", ");
}

const isReadOnly = computed(() => {
    return StudiesHelper.isReadOnly(study.value);
});

function launchStudy(study: PortalStudiesStudy) {
    studiesStore.launchStudy(study);
    studiesStore.routerQuery.replace({
        study: undefined,
        show: undefined
    })
}

</script>

<template>
    <gb-window v-if="studiesStore.hasStudy(studiesStore.routerQuery.query.study)" :header="`Validate ideas${portalStore.titleDemo()}`">
        <input v-model="study.name" class="ml-3 mb-2">
        <div class="gb-inner-window">
            <div class="gb-layout-tl w-full studies-detail">
                <div class="gb-ui-inner-window-header gb-layout-t-between w-full">
                    <div>
                        <b>Countries to test in externally</b>
                    </div>
                    <div class="text-[0.7em] text-gray-600">
                        Launch study internally or add countries to test via external panels
                    </div>
                </div>
                <div v-if="studiesStore.routerQuery.query.study !== undefined && study.audiences.length > 0" class="gb-inner-window">
                    <div class="gb-layout-tl">
                        <div class="gb-layout-tl-row h-[20px] text-[0.6em] gap-1">
                            <div class="w-[var(--w-country)]"></div>
                            <div class="gb-layout-row h-full w-[var(--w-people)]">
                                <gb-svg icon="tam_audience" class="h-full w-auto"></gb-svg>
                                <div>People</div>
                            </div>
                            <div class="gb-layout-row h-full w-[var(--w-gender)]">
                                <gb-svg icon="male" class="w-auto h-full"></gb-svg>
                                <div>Males</div>
                            </div>
                            <template v-for="ageDef in studiesStore.def.age" :key="ageDef.id">
                                <div class="gb-layout-row h-full w-[var(--w-age)]">
                                    <div>{{ageDef.label}}</div>
                                </div>
                            </template>
                            <div class="gb-layout-row h-full w-[var(--w-traits)]">
                                <div>Traits</div>
                            </div>
                            <div class="gb-layout-row h-full w-[var(--w-price)]">
                                <div>Price</div>
                            </div>
                        </div>
                        <div v-for="audience in studiesStore.getStudy(studiesStore.routerQuery.query.study).audiences" :key="audience.guid" class="gb-layout-tl-row h-[30px] gap-1">
                            <div class="gb-layout-row h-full w-[var(--w-country)]">
                                <gembase-ui-select :readonly="isReadOnly || studiesStore.isLocked()" class="gb-ui-studies-page-countries-select w-full h-full" @on-change="(x) => audience.country_id = parseInt(x.id)" :selected-index="getAudienceCountriesSelectedIndex(audience.country_id.toString())" :items="audienceCountriesSelectOptions"></gembase-ui-select>
                            </div>
                            <div class="gb-layout-row h-full w-[var(--w-people)]">
                                <input :readonly="isReadOnly" v-model.number="audience.people" />
                            </div>
                            <div class="gb-layout-row h-full w-[var(--w-gender)]">
                                <input v-model.number="audience.males" />
                            </div>
                            <template v-for="ageDef in studiesStore.def.age" :key="ageDef.id">
                                <div class="gb-layout-row h-full w-[var(--w-age)]">
                                    <input @input="(x) => StudiesHelper.setAgePercentage(study, audience.guid, ageDef.id, parseInt((x.target as HTMLInputElement).value))" :value="StudiesHelper.getAgePercentage(study, audience.guid, ageDef.id)" />
                                </div>
                            </template>
                            <div @click="traitsPopup = audience" class="gb-layout-row h-full pl-2 pr-2 bg-white rounded-2xl text-black text-[0.5em] leading-[1em] flex-wrap cursor-pointer w-[var(--w-traits)]" :style="{pointerEvents: isReadOnly ? 'none' : 'inherit'}">
                                {{getTraitsText(audience)}}
                            </div>
                            <div class="gb-layout-row h-full text-yellow bg-black rounded-2xl w-[var(--w-price)]">
                                <gb-svg icon="currency_dollar" class="h-[20px] w-auto"></gb-svg>
                                <div class="text-[0.8em] font-bold">{{StudiesHelper.getAudiencePrice(audience)}}</div>
                            </div>
                            <gb-button v-if="!isReadOnly" @click="removeAudience(audience.guid)" class="gbc-bg-primary !w-[40px]" icon="delete"></gb-button>
                        </div>
                    </div>
                </div>
                <div class="gb-ui-inner-window-footer">
                    <gb-button @click="addAudience" :disabled="isReadOnly" :demo="study.audiences.length > 0 && studiesStore.isLocked()" class="gbc-bg-primary" text="Add country" icon="plus"></gb-button>
                </div>
            </div>
        </div>
        <div class="gb-layout-m-between w-full pt-2 pb-2 pl-3 pr-3">
            <gb-button v-if="!isReadOnly" @click="launchStudy(study)" class="gbc-bg-primary" icon="launch" :text="study.audiences.length === 0 ? 'Launch internally' : 'Launch in countries'"></gb-button>
            <router-link v-else :to="{query: {}}">
                <gb-button class="gbc-bg-primary ml-[15px]" icon="launch" text="Continue"></gb-button>
            </router-link>
            <div v-if="StudiesHelper.isInternal(study)" class="gb-layout-row gap-2">
                <gb-svg icon="tam_audience" class="h-[20px] w-auto"></gb-svg>
                <div class="font-bold text-[0.8em]">Internal respondents:</div>
                <input class="w-[70px]" v-model="study.internal_respondents">
            </div>
            <div v-else class="gb-layout-tl-row text-yellow bg-black p-2 pl-4 pr-4 rounded-full font-bold gap-1">
                <div>Total price:</div>
                <div class="gb-layout-row">
                    <gb-svg icon="currency_dollar" class="h-[20px] w-auto"></gb-svg>
                    <div>{{StudiesHelper.getPrice(study)}}</div>
                </div>
            </div>
            <router-link :to="{query: {study: study.guid, show: 'concepts'} as PortalStudiesQuery}">
                <gb-button class="gbc-bg-primary" icon="edit_question" :text="isReadOnly ? 'View pools' : 'Edit pools'"></gb-button>
            </router-link>
        </div>
        <div v-if="traitsPopup !== undefined" class="absolute inset-0 gb-layout bg-black bg-opacity-70 rounded-inherit">
            <div class="gb-window gb-layout-tc-row flex-wrap gap-2 max-w-[400px]">
                <gembase-ui-window-close-btn :prevent-route-back="true" @on-close="traitsPopup = undefined"></gembase-ui-window-close-btn>
                <div class="gb-ui-window-header">
                    Select traits
                </div>
                <gb-button v-for="trait in studiesStore.def.traits" class="gbc-bg-node !text-[0.8em]" :text="trait.name" :data-selected="traitsPopup.traits.includes(trait.id)" @click="GembaseUtils.toggleArr(traitsPopup?.traits, trait.id)">
                </gb-button>
            </div>
        </div>
    </gb-window>
</template>

<style scoped>
.studies-detail {
  --w-country: 200px;
  --w-people: 100px;
  --w-gender: 100px;
  --w-age: 70px;
  --w-traits: 100px;
  --w-price: 100px;
  --w-trash: 40px;
}

.studies-detail input {
  @apply w-full h-full;
}

</style>