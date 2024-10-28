<script setup lang="ts">

import {FEATURES_POOL_IDS, useStudiesStore} from "@/models/portal/studies/StudiesStore";
import {computed, onMounted, ref, watch} from "vue";
import ClientError from "@/core/errors/ClientError";
import GembaseUtils from "@/utils/GembaseUtils";
import {StudiesHelper} from "@/models/portal/studies/StudiesHelper";
import {
    IConceptExample,
    PortalStudiesStudyConceptFeaturePool,
    PortalStudiesStudyConceptHeader
} from "@/models/portal/studies/StudiesData";
import GbButton from "@/views/ui/buttons/GbButton.vue";
import GbWindow from "@/views/ui/popups/GbWindow.vue";
import StudyConceptExample from "@/views/shared/SsurveyConceptExample.vue";
import StudiesConceptsInputHints
    from "@/views/platform/modules/studies/__components/__components/StudiesConceptsInputHints.vue";

const studiesStore = useStudiesStore();

const conceptExamples = ref<IConceptExample[]>([]);
const saveChanges = ref(false);
const headers = ref<PortalStudiesStudyConceptHeader[]>([]);
const features = ref<PortalStudiesStudyConceptFeaturePool[]>([]);

const titleHints = computed((): string[] => {
    const res: string[] = [];

    headers.value.forEach((x) => {
        res.push(x.title);
    });

    return res;
});

const descHints = computed((): string[] => {
    const res: string[] = [];

    headers.value.forEach((x) => {
        res.push(x.description);
    });

    return res;
});

const featureHints = computed((): Map<string, string[]> => {
    const res: Map<string, string[]> = new Map<string, string[]>();

    features.value.forEach((x) => {
        if (!res.has(x.pool_id)) {
            res.set(x.pool_id, []);
        }
        if (x.text != "" && !res.get(x.pool_id)?.includes(x.text)) {
            res.get(x.pool_id)?.push(x.text);
        }
    });

    return res;
});

watch(headers, () => {
    generateConceptExamples();
    saveChanges.value = true;
});

watch(features, () => {
    generateConceptExamples();
    saveChanges.value = true;
});

onMounted(() => {
    if (!studiesStore.hasStudy(studiesStore.routerQuery.query.study)) {
        studiesStore.routerQuery.remove({
            study: undefined,
            show: undefined
        });
        return;
    }

    if (study.value.dcm_concepts !== null) {
        headers.value = [...study.value.dcm_concepts.headers];
        features.value = [...study.value.dcm_concepts.features];
    }

    generateConceptExamples();
});

function generateConceptExample(conceptExample: IConceptExample) {
    const rndHeader = GembaseUtils.randomFromArray(headers.value);

    const rndFeatures: object = {};
    FEATURES_POOL_IDS.forEach((x) => {
        const arr: string[] = [];
        features.value.forEach((y) => {
            if (x === y.pool_id) {
                arr.push(y.text);
            }
        });
        if (arr.length > 0) {
            rndFeatures[x] = GembaseUtils.randomFromArray(arr);
        }
    });

    if (rndHeader !== undefined) {
        conceptExample.title = rndHeader.title;
        conceptExample.desc = rndHeader.description;
    }
    if (FEATURES_POOL_IDS[0] in rndFeatures) {
        conceptExample.f1 = rndFeatures[FEATURES_POOL_IDS[0]];
    }
    if (FEATURES_POOL_IDS[1] in rndFeatures) {
        conceptExample.f2 = rndFeatures[FEATURES_POOL_IDS[1]];
    }
}

function generateConceptExamples() {
    const res: IConceptExample[] = [];

    for (let i = 0; i < 2; ++i) {
        const r: IConceptExample = {}
        res.push(r);
        generateConceptExample(r);
    }

    conceptExamples.value = res;
}

function onFeatureSelected(index: number, value: string) {
    features.value[index].text = value;
    generateConceptExamples();

}

function onAddFeature(poolId: string) {
    features.value.push({
        pool_id: poolId,
        text: ""
    });
}

function onAddHeader() {
    headers.value.push({
        title: "",
        description: ""
    });
}

function onTitleSelected(index: number, value: string) {
    headers.value[index].title = value;
    generateConceptExamples();
}

function onDescSelected(index: number, value: string) {
    headers.value[index].description = value;
}

const isReadOnly = computed(() => {
    return StudiesHelper.isReadOnly(study.value);
});

function onDeleteFeature(index: number) {
    features.value.splice(index, 1);
}

function onDeleteHeader(index: number) {
    headers.value.splice(index, 1);
}

const study = computed(() => {
    if (studiesStore.routerQuery.query.study !== undefined) {
        return studiesStore.getStudy(studiesStore.routerQuery.query.study);
    }
    throw new ClientError(`Study not found`);
});

function saveAndClose() {
    if (study.value.dcm_concepts !== null) {
        study.value.dcm_concepts.headers = [...headers.value];
        study.value.dcm_concepts.features = [...features.value];
    }

    studiesStore.saveStudy(study.value);
    studiesStore.routerQuery.replace({
        show: undefined,
        study: study.value.guid
    });
}
</script>

<template>
    <gb-window v-if="studiesStore.hasStudy(studiesStore.routerQuery.query.study)" header="Set up concepts testing">
        <div class="absolute top-[40px] right-[95px]">
            <gb-button class="gbc-bg-primary" :disabled="true" icon="generate_pool" text="Generate pool"></gb-button>
        </div>
        <div class="studies-concepts gb-layout-tl w-full gap-2">
            <div class="gb-layout-tl-row gap-2">
                <div class="gb-inner-window">
                    <div class="gb-layout-tc col-content w-[var(--w-header)]">
                        <div class="gb-ui-scroll-v w-full gb-layout-tc pr-2 pl-2">
                            <div class="header-text">Title & description pool</div>
                            <div class="gb-layout-tc w-full gap-2">
                                <div v-for="(header, index) in headers" :key="`${header.title}__${header.description}`" class="gb-layout w-full gap-[2px] text-[0.8em]">
                                    <studies-concepts-input-hints @on-delete="onDeleteHeader(index)" :readonly="studiesStore.isLocked() || isReadOnly" placeholder="Add title ..." class="font-bold" :hints="titleHints" :selected="header.title" @on-label-change="(x) => onTitleSelected(index, x)" @on-hint-selected="(x) => onTitleSelected(index, x)"></studies-concepts-input-hints>
                                    <studies-concepts-input-hints :hide-delete="true" :readonly="studiesStore.isLocked() || isReadOnly" placeholder="Add description ..." :hints="descHints" :selected="header.description" @on-label-change="(x) => onDescSelected(index, x)" @on-hint-selected="(x) => onDescSelected(index, x)"></studies-concepts-input-hints>
                                </div>
                            </div>
                            <div class="gb-layout-tc-row w-full">
                                <gb-button @click="onAddHeader" class="gbc-bg-primary mt-[10px]" icon="plus" text="Add title & desc" :demo="studiesStore.isLocked()" :disabled="isReadOnly" tooltip="Add title & desc"></gb-button>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-for="(poolId, index) in FEATURES_POOL_IDS" class="gb-inner-window" :key="poolId">
                    <div class="gb-layout-tc col-content gb-ui-scroll-v pr-2 pl-2 w-[var(--w-feature)]">
                        <div class="header-text">
                            {{`Features pool ${index + 1}`}}
                        </div>
                        <div class="gb-layout-tc w-full gap-[2px] text-[0.8em]">
                            <template v-for="(feature, index) in features" :key="feature">
                                <studies-concepts-input-hints v-if="feature.pool_id === poolId" @on-delete="onDeleteFeature(index)" :readonly="studiesStore.isLocked() || isReadOnly" :hints="featureHints.get(poolId)" :selected="feature.text" @on-label-change="(x) => onFeatureSelected(index, x)" @on-hint-selected="(x) => onFeatureSelected(index, x)"></studies-concepts-input-hints>
                            </template>
                        </div>
                        <gb-button @click="onAddFeature(poolId)" icon="plus" text="Add feature" :disabled="isReadOnly" class="gbc-bg-primary mt-[10px]" :demo="studiesStore.isLocked()" tooltip="Add selling point"></gb-button>
                    </div>
                </div>
            </div>
            <div class="gb-inner-window w-full">
                <div class="gb-layout-row w-full gap-2">
                    <div class="gb-layout-c-between h-full">
                        <div class="header-text w-full text-left">
                            Output
                        </div>
                        <div class="gb-layout h-full text-[0.8em] gap-2">
                            <div class="text-[0.8em]">{{StudiesHelper.getConceptsCount(headers, features)}} concepts</div>
                            <gb-button @click="saveAndClose" class="gbc-bg-primary !h-[50px] !rounded-3xl" icon="test_concepts" text="Test"></gb-button>
                        </div>
                    </div>
                    <div class="gb-layout">
                        <div class="text-[0.8em] text-light-violet pb-1">
                            Micro-concept examples
                        </div>
                        <div class="gb-layout-row gap-2">
                            <study-concept-example v-for="concept in conceptExamples" @reload="generateConceptExample" :concept="concept"></study-concept-example>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </gb-window>
</template>

<style scoped>
.studies-concepts {
  --w-header: 290px;
  --w-feature: 290px;
}

.studies-concepts input {
  @apply w-full text-[0.8em];
}

.header-text {
  @apply text-center h-[40px] font-bold w-full opacity-50 text-[0.8em] pb-1 pt-2;
}

.col-content {
  @apply h-[250px];
}
</style>
