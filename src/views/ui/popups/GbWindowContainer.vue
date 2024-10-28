<script setup lang="ts">

defineProps<{
    blackBg?: boolean;
    fixed?: boolean;
    hideBg?: boolean;
    inner?: boolean;
}>();

</script>

<template>
    <!-- WHOLE USABLE SPACE EXCEPT FOR TOP-BAR AND SIDE-BAR (OR FULLSCREEN IF FIXED) -->
    <div class="scoped-root data-[hide-bg='true']:pointer-events-none absolute data-[fixed='true']:z-[var(--z-index-fixed-popups)] data-[fixed='true']:fixed top-0 left-0 right-0 h-fit rounded-inherit data-[black-bg='true']:bg-black data-[black-bg='true']:bg-opacity-75" :data-hide-bg="hideBg" :data-fixed="fixed" :data-black-bg="blackBg">
        <!-- MIN HEIGHT IS THE SCREEN HEIGHT MINUS TOP BAR ALIGNED AT TOP, SO WHEN THE BODY HEIGHT IS BIGGER THAN SCREEN HEIGHT THE BODY STAYS AT STARTS AT TOP -->
        <div class="gb-layout-tc data-[hide-bg='true']:pointer-events-none gb-min-screen-h gb-ui gb-ui-svg-current" :data-fixed="fixed" :data-inner="inner">
            <!-- MIN HEIGHT IS THE SCREEN HEIGHT MINUS TOP BAR ALIGNED AT CENTER, SO WHEN THE BODY HEIGHT IS LOWER THAN SCREEN HEIGHT THE BODY IS CENTERED -->
            <div class="gb-layout gb-min-screen-h data-[hide-bg='true']:pointer-events-none" :data-fixed="fixed" :data-inner="inner">
                <!-- OFFSET FROM TOP AND BOTTOM, SO THERE IS MIN SPACE BETWEEN WINDOW AND TOP-BAR -->
                <div class="pb-[var(--top-bottom-offset)] pt-[var(--top-bottom-offset)] pointer-events-auto">
                    <slot></slot>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.scoped-root {
  --top-bottom-offset: 10px;
}

.gb-min-screen-h {
  @apply min-h-[calc(100vh-var(--gb-ui-portal-header-h))];
}

.gb-min-screen-h[data-fixed="true"] {
  @apply min-h-[100vh];
}

.gb-min-screen-h[data-inner="true"] {
  @apply min-h-[auto];
}
</style>
