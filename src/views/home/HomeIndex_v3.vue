<template>
    <div class="text-white">
        <div class="bg-white bg-opacity-10 fixed w-full h-[5vmin] right-[-20vw] bottom-[-30vh] gb-layout-ml rotate-[-45deg]">
            <div class="gb-layout-row text-[2.1vmin]">
                <div class="absolute left-0 whitespace-pre" ref="featuresStripe1">{{featuresStripeText}}</div>
                <div class="absolute left-0 whitespace-pre" ref="featuresStripe2">{{featuresStripeText}}</div>
            </div>
        </div>

        <div v-if="false" class="sections-menu">
            <div class="menu-point" :class="{active: homePageScrollModel.data.value.activeSection?.id === index - 1}" @click="homePageScrollModel.scrollToSection(index - 1)" v-for="index in homePageScrollModel.data.value.sections.length" :key="index"></div>
        </div>

        <section class="fullpage text-[1vmin] leading-[1.2vmin] md:text-[0.5vmin] md:leading-[0.5vmin]">
            <div class="gb-layout-tl md:gb-layout-row w-[90%] h-[100vh] md:h-[50%] md:w-[70%]">
                <div class="gb-layout mt-[15vmin] md:mt-0 mb-[8vmin] md:mb-0 md:h-full">
                    <div class="relative gb-layout-row md:h-full w-[45%] md:w-full">
                        <gb-svg class="absolute gb-ui-svg-current w-auto h-[120%] top-[-20%]" path="/static/media/gembase/home/v2/TriangleCircle.svg"></gb-svg>
                        <gb-img-local title="Gembase.io" class="gb-glow-violet-blue gb-glow-size-[10vh] h-full w-auto" src="gembase/home/v2/gembase_owl_small-min.png"></gb-img-local>
                    </div>
                </div>
                <div class="md:w-[8vw]"></div>
                <div class="gb-layout-tc md:gb-layout-ml h-full">
                    <div class="w-[95%] h-auto md:h-[35%] md:w-auto md:gb-layout-bl">
                        <gb-svg-v2 class="w-full h-auto md:h-[45%] gb-glow-ocean gb-glow-size-[10vh]" path="/static/media/gembase/logos/white_full_trimmed.svg"></gb-svg-v2>
                        <div class="w-full gb-layout-row">
                            <div class="gb-separator"></div>
                        </div>
                    </div>
                    <div class="font-thin text-[7em] md:text-[8em] leading-[1em] text-left">
                        Make smarter product and marketing<br class="hidden md:block"> decisions with a real-time 360°<br class="hidden md:block"> market discovery platform.
                    </div>
                </div>
            </div>
        </section>

        <section class="fullpage text-[1vmin] leading-[1.2vmin] md:text-[0.6vmin] md:leading-[0.6vmin] pt-[5vh] md:pt-0">
            <div class="gb-layout-ml md:h-[90%] w-[90%] md:w-[65%]">
                <div class="font-thin text-[8em] leading-[1.2em] md:pl-[1.5em] md:pr-[1.5em]">
                    Many games fail to engage larger audiences or face tough competition
                    <div class="pl-[0.5em]">
                        <div class="gb-separator"></div>
                    </div>
                </div>
                <div class="w-full md:h-[30vmin] gb-layout-row">
                    <div class="gb-layout md:gb-layout-row gap-[4vmin] w-full h-full">
                        <div v-for="(item, index) in challengeCards" :key="index" :data-index="index" class="relative w-auto h-full gb-cards-glow">
                            <img class="max-w-full max-h-full" :src="item.img">
                            <div class="absolute gb-layout-bl pl-[10%] pr-[10%] pb-[10%] top-0 bottom-0 right-0 left-0 max-w-full max-h-full" style="aspect-ratio: 4 / 3;">
                                <div class="text-[6vmin] leading-[6vmin] md:text-[2.7vmin] md:leading-[2.7vmin] font-thin gb-gembase-card" :data-card-index="index">
                                    {{item.text}}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>


        <section class="fullpage text-[1vmin] leading-[1.2vmin] md:text-[0.6vmin] md:leading-[0.6vmin] pt-[20vh] md:pt-0">
            <div class="gb-layout-ml md:h-[90%] w-[90%] md:w-[65%]">
                <div class="font-thin text-[8em] leading-[1.2em] md:pl-[1.5em] md:pr-[1.5em]">
                    Gembase uses AI to identify game attributes with high demand and low competition
                    <div class="pl-[0.5em]">
                        <div class="gb-separator"></div>
                    </div>
                </div>
                <div class="w-full md:h-[30vmin] gb-layout-row">
                    <div class="gb-layout md:gb-layout-row gap-[4vmin] w-full h-full">
                        <div v-for="(item, index) in solutionCards" :key="index" :data-index="index" class="relative w-auto h-full gb-cards-glow">
                            <img class="max-w-full max-h-full" :src="item.img">
                            <div class="absolute gb-layout-bl pl-[10%] pr-[10%] pb-[10%] top-0 bottom-0 left-0 right-0 max-w-full max-h-full" style="aspect-ratio: 4 / 3;">
                                <div class="max-h-full text-[6vmin] leading-[6vmin] md:text-[2.7vmin] md:leading-[2.7vmin] font-thin gb-gembase-card whitespace-nowrap" v-html="item.text" :data-card-index="index">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>


        <section class="fullpage text-[1vmin] leading-[1.2vmin] md:text-[0.6vmin] md:leading-[0.6vmin] pt-[20vh] md:pt-0">
            <div class="gb-layout md:h-[90%] w-[90%] md:w-[65%]">
                <div class="font-thin text-[8em] leading-[1.2em] md:pl-[1em] md:pr-[1em]">
                    Improve concepting, design & marketing for any game
                    <div class="pl-[0.5em]">
                        <div class="gb-separator"></div>
                    </div>
                </div>
                <div class="w-full gb-layout">
                    <div class="w-full gb-layout-row gb-glow-violet-blue gb-glow-size-[50vmin] gb-glow-opacity-50">
                        <div class="gb-layout w-full gap-[2em]">
                            <div v-for="item in PortalConstants.billingModules" :key="item.id" @click="toggleModuleButton(item.title)" class="gb-layout w-full">
                                <div v-if="selectedModuleButtons.includes(item.title)" class="gb-layout-tl-row w-full">
                                    <div class="relative gb-layout-tl md:gb-layout-tl-row w-full bg-gradient-to-r from-night-violet to-night-violet-light border border-black text-white gb-home-violet-blue-glow p-[max(2.5vmin,10px)] pr-[7vmin] rounded-[5vmin] gap-[1vmin]">
                                        <gb-svg class="cursor-pointer h-[4em] w-auto absolute top-[4em] right-[6em] rotate-180" icon="expand_menu"></gb-svg>
                                        <div class="gb-layout-row h-full w-full">
                                            <div class="bg-white bg-opacity-5 w-full h-full p-[max(3em,10px)] rounded-[3em]">
                                                <div class="w-full gb-layout-c-between">
                                                    <div class="pt-[0.5em] font-light text-[5em] leading-[1em] md:text-[3.5em] md:min-h-[2.5em] max-w-[95%]">
                                                        <span>{{item.homePageDesc}}</span>
                                                    </div>
                                                    <div class="w-full h-full gb-layout-ml-row pl-2">
                                                        <div class="w-[50%] md:w-[35%] mt-[4em] mb-[2em] md:mt-[2em] md:mb-0">
                                                            <portal-ui-router-link :name="RoutesEnum.SIGN_UP">
                                                                <div class="gb-home-orange-bg gb-home-yellow-glow gb-layout-ml-row h-fit w-fit md:w-[22vmin] gap-[1.2em] rounded-full pl-[2vmin] pr-[2vmin] pt-[1vmin] pb-[1vmin]">
                                                                    <div class="gb-layout-ml-row w-[9em]">
                                                                        <gb-svg class="aspect-square h-[calc(var(--gb-icon-scale)*8em)] md:h-[calc(var(--gb-icon-scale)*6em)]" :style="{'--gb-icon-scale': item.iconScale ?? 1}" :icon="item.icon"></gb-svg>
                                                                    </div>
                                                                    <div class="gb-layout-ml w-full h-fit">
                                                                        <gb-svg icon="gembase" class="h-[2.3em] aspect-square"></gb-svg>
                                                                        <div class="font-black whitespace-nowrap text-[6em] md:text-[4em] leading-[1em] md:leading-[1em]">{{item.title.toUpperCase()}}</div>
                                                                    </div>
                                                                </div>
                                                            </portal-ui-router-link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-else class="gb-layout-row w-full">
                                    <div class="cursor-pointer gb-layout-tl md:gb-layout-ml-row gap-[2em] pt-[5em] pb-[5em] md:pt-[3em] md:pb-[3em] pl-[12em] md:pl-[7em] pr-[7em] md:pr-0 bg-violet gb-home-violet-blue-glow rounded-full md:rounded-full w-full h-full">
                                        <div class="gb-layout-ml-row h-fit gap-[1.2em] md:w-[20%]">
                                            <div class="gb-layout-ml-row w-[9em]">
                                                <gb-svg class="aspect-square h-[calc(var(--gb-icon-scale)*8em)] md:h-[calc(var(--gb-icon-scale)*6em)]" :style="{'--gb-icon-scale': item.iconScale ?? 1}" :icon="item.icon"></gb-svg>
                                            </div>
                                            <div class="gb-layout-ml w-full h-fit">
                                                    <gb-svg icon="gembase" class="h-[2.3em] aspect-square"></gb-svg>
                                                <div class="font-black whitespace-nowrap text-[6em] md:text-[4em] leading-[1em] md:leading-[1em]">{{item.title.toUpperCase()}}</div>
                                            </div>
                                        </div>
                                        <div class="pr-[1em] md:pr-0 md:whitespace-nowrap text-[4em] md:text-[2.7vmin] leading-[1em] font-light">{{item.desc}}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="fullpage text-[1vmin] leading-[1.2vmin] md:text-[0.6vmin] md:leading-[0.6vmin] pt-[20vh] md:pt-0">
            <div class="gb-layout-ml md:h-[90%] w-[90%] md:w-[65%]">
                <div class="font-thin text-[8em] leading-[1.2em] md:pl-[1.5em] md:pr-[1.5em]">
                    No other tool offers what Gembase.io does
                    <div class="pl-[0.5em]">
                        <div class="gb-separator"></div>
                    </div>
                </div>
                <div class="w-full md:h-[40vmin] gb-layout-row">
                    <div class="gb-layout md:gb-layout-row gap-[4vmin] w-full h-full">
                        <div v-for="(item, index) in uspCards" :key="index" :data-index="index" class="relative w-auto h-full gb-cards-glow">
                            <img class="max-w-full max-h-full" :src="item.img">
                            <div class="absolute gb-layout-bl pl-[10%] pr-[10%] pb-[10%] bottom-0 right-0 left-0 top-0 max-w-full max-h-full" style="aspect-ratio: 1140 / 1057;">
                                <div v-html="item.text" class="text-black text-[6vmin] leading-[6vmin] md:text-[2.6vmin] md:leading-[2.6vmin] font-normal whitespace-nowrap">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="fullpage pt-[20vh] md:pt-0" :id="uiStore.isMobile ? 'solutions' : ''" data-section-name="solutions">
            <div class="gb-layout h-[90%] w-[90%] md:w-[80%] text-[1vmin] leading-[1.2vmin]">
                <div class="gb-home-violet-blue-glow mt-[3vmin] w-[calc(100%+10px)] h-fit">
                    <carousel :itemsToShow="1" :autoplay="10000" :wrap-around="true">
                        <slide v-for="(item, index) in useCases" :key="index">
                            <div class="gb-home-window w-full md:w-full text-left !rounded-[5em]">
                                <div class="gb-layout-tl gap-[3vmin] md:gap-[3vmin] w-full">
                                    <div class="md:whitespace-nowrap font-bold text-[7em] leading-[1em] md:text-[4.3em] md:leading-[1em] pt-[9vmin] md:pt-[2vmin] pl-[4vmin] pr-[3vmin] pb-[4vmin] md:pb-0">
                                        {{item.title}}
                                    </div>
                                    <div class="w-full gb-layout-tl md:gb-layout-tl-row gap-[3em] md:gap-[1em]">
                                        <div v-for="(card, cardIndex) in item.cards" :key="cardIndex" class="gb-home-window-content relative !rounded-[5em] md:!rounded-[5em] gb-layout-l-between md:gb-layout-c-between w-full p-[1.5vmin] pb-[8vmin]">
                                            <div v-for="item in [PortalConstants.getBillingModule(card.moduleId)]" class="absolute bottom-[5vmin] md:bottom-[1.2vmin] right-[10em] md:right-0 gb-layout-row w-fit">
                                                <div class="pointer-events-none gb-layout-tl md:gb-layout-ml-row gap-[2em] pt-[2em] pb-[2em] pl-[4em] pr-[5em] bg-violet gb-home-violet-blue-glow rounded-full md:rounded-full w-full h-full scale-[0.65]">
                                                    <div class="gb-layout-ml-row h-fit">
                                                        <div class="gb-layout-ml-row w-[9em]">
                                                            <gb-svg class="aspect-square h-[calc(var(--gb-icon-scale)*8em)] md:h-[calc(var(--gb-icon-scale)*6em)]" :style="{'--gb-icon-scale': item.iconScale ?? 1}" :icon="item.icon"></gb-svg>
                                                        </div>
                                                        <div class="gb-layout-ml w-full h-fit">
                                                            <gb-svg icon="gembase" class="h-[2.3em] aspect-square"></gb-svg>
                                                            <div class="font-black whitespace-nowrap text-[6em] md:text-[4em] leading-[1em] md:leading-[1em]">{{item.title.toUpperCase()}}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="gb-layout-tl gap-[2vmin] md:gap-[1vmin] p-[3vmin]">
                                                <div class="text-[4.5em] leading-[1em] md:text-[2.5vmin] pt-[3vmin] md:pt-0 font-bold">{{card.title}}</div>
                                                <div class="text-[4em] leading-[1em] md:text-[2.2vmin] md:leading-[2.5vmin] md:min-h-[calc(3*2.5vmin)] font-light pr-[3vmin]" v-html="card.desc"></div>
                                            </div>
                                            <div class="w-full h-auto pb-[3em] md:pb-0">
                                                <gb-img-local class="w-full h-auto" :src="`gembase/home/v2/${item.imagePrefix}-${cardIndex + 1}-min.png`"></gb-img-local>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </slide>
                        <template #addons>
                            <pagination class="pt-4" />
                        </template>
                    </carousel>
                </div>
            </div>
        </section>


        <section class="fullpage text-[1vmin] leading-[1.2vmin] md:text-[0.6vmin] md:leading-[0.7vmin] pt-[20vh] md:pt-0">
            <div class="gb-layout h-[90%] w-[90%] md:w-[65%]">
                <div class="font-black text-[10em] leading-[1em] gb-home-ocean-glow">
                    EXAMPLES
                </div>
                <div class="gb-home-violet-blue-glow mt-[3vmin] w-[calc(100%+10px)] gb-layout">
                    <carousel :itemsToShow="1" :autoplay="5000" :wrap-around="true">
                        <slide v-for="item in examples" :key="item.id">
                            <div class="gb-home-window w-full h-full !gb-layout !rounded-[5em]">
                                <div class="gb-home-window-content w-full md:aspect-[2048/700] gb-layout-tl md:gb-layout-tl-row gap-[2em] md:gap-0 !rounded-[5em]">
                                    <div class="w-full md:w-[50%] md:min-w-[50%]">
                                        <gb-img-local class="w-full h-auto border border-black rounded-[5em]" :src="`gembase/home/v2/${item.image}`"></gb-img-local>
                                    </div>
                                    <div class="gb-layout-ml text-left p-[3.5vmin] pt-[6vmin] gap-[2vmin]">
                                        <div class="font-black text-[6em] leading-[1em]">{{item.title}}</div>
                                        <div class="font-normal text-light-violet text-[5em] md:text-[2.7vmin] leading-[1em]">{{item.subtitle}}</div>
                                        <div class="font-thin text-[4em] md:text-[2.7vmin] leading-[1em]">
                                            {{item.desc}}
                                        </div>
                                        <router-link :to="{name: RoutesEnum.HOME_INDEX, hash: `solutions`}" @click="() => {homePageScrollModel.scrollToSectionByName('solutions');}">
                                        <div class="h-fit mt-[2vmin] text-[3em] md:text-[3em]">
                                            <div class="w-fit h-fit font-bold text-[1em] cursor-pointer pt-[0.8em] pb-[0.8em] pl-[1.5em] pr-[1.5em] bg-violet rounded-full">
                                                LEARN MORE
                                            </div>
                                        </div>
                                        </router-link>
                                    </div>
                                </div>
                            </div>
                        </slide>
                        <template #addons>
                            <pagination class="pt-6" />
                        </template>
                    </carousel>
                </div>
            </div>
        </section>

        <section class="fullpage text-[1vmin] leading-[1.2vmin] md:text-[0.6vmin] md:leading-[0.7vmin] pt-[20vh] md:pt-0" :id="uiStore.isMobile ? 'pricing' : ''" data-section-name="pricing">
            <div class="gb-layout h-[90%] w-[90%] md:w-[65%]">
                <div class="gb-home-ocean-glow font-black text-[10em] leading-[1em]">
                    PRICING
                </div>
                <div class="font-thin text-[8em] leading-[1.2em] pt-[3vmin]">
                    Detailed pricing is available after you log in to the platform.
                </div>
            </div>
        </section>

        <section class="fullpage text-[1vmin] leading-[1.2vmin] md:text-[0.6vmin] md:leading-[0.7vmin] pt-[20vh] md:pt-0">
            <div class="gb-layout-ml h-[90%] w-[90%] md:w-[65%]">
                <div class="font-thin text-[8em] leading-[1.2em] md:pl-[1em] md:pr-[1em]">
                    We have years of experience in mobile gaming, data & SaaS.
                    <div class="pl-[0.5em]">
                        <div class="gb-separator"></div>
                    </div>
                </div>
                <div class="w-full md:w-full gb-layout-row relative md:top-[-7em]">
                    <div class="w-full h-full">
                        <carousel :itemsToShow="responsiveItemsToShow(5)" :autoplay="5000" :wrap-around="true" :pauseAutoplayOnHover="true">
                            <slide v-for="person in persons" :key="person.id">
                                <a :href="person.linkedin" target="_blank">
                                    <div class="rounded-[50%] border border-black relative m-[10vmin] md:ml-[1vmin] md:mr-[1vmin] md:mt-[5vmin] md:mb-[5vmin] gb-home-team-glow" :data-advisor="person.role !== undefined">
                                        <gb-img-local class="rounded-[50%] max-w-full aspect-square grayscale" :src="`gembase/home/${person.img}`"></gb-img-local>
                                        <div class="absolute w-full h-full top-0 left-0">
                                            <div class="text-[3em] leading-[1em] rounded-full w-full h-full gb-layout gap-[1vmin] gb-home-about-us-card-content">
                                                <div>{{person.firstName}} {{person.lastName}}</div>
                                                <div>{{person.tags}}</div>
                                                <div v-if="person.role !== undefined">{{person.role}}</div>
                                                <a :href="person.linkedin" target="_blank">
                                                    <gb-svg src="/static/media/gembase/home/linkedin.svg" class="w-[30px] h-[30px] text-white gb-ui-svg-current"></gb-svg>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </slide>
                            <template #addons>
                                <pagination />
                            </template>
                        </carousel>
                    </div>

                </div>
            </div>
        </section>

        <section class="fullpage text-[1vmin] leading-[1.2vmin] md:text-[0.6vmin] md:leading-[0.7vmin] pt-[20vh] md:pt-0" :id="uiStore.isMobile ? 'company' : ''" data-section-name="company">
            <div class="gb-layout h-[90%] w-[90%] md:w-[65%]">
                <div class="gb-home-window !rounded-[5em] w-full h-fit gb-home-violet-blue-glow !p-[5em] !pb-[9em] text-[1.2em] leading-[1em]">
                    <gb-svg class="w-auto h-[11em] pt-[5em] md:pt-[2vmin] md:pl-[3vmin]" src="/static/media/gembase/logos/white_full.svg"></gb-svg>
                    <div class="w-full gb-layout-ml md:gb-layout-tc-row flex-wrap gap-7 pl-[0.8em] pt-[1.5em] text-[5em] leading-[1em] md:text-[4em] md:leading-[1em]">
                        <div v-for="index in 3" :key="index" class="w-full md:w-[30%]">
                            <div class="font-bold pb-[2vmin]">
                                <div v-if="index === 1">Address</div>
                                <div v-if="index === 2">Contact</div>
                                <div v-if="index === 3">Legal</div>
                            </div>
                            <div class="text-[0.8em] md:text-[2.7vmin] font-thin">
                                <div v-if="index === 1" class="gb-selectable-text">
                                    Gembase.io, s.r.o.<br>Nove Zahrady I/9<br>82105 Bratislava<br>Slovakia
                                </div>
                                <div v-if="index === 2" class="gb-selectable-text">
                                    contact@gembase.io<br>EU +421 903 44 07 22
                                </div>
                                <div v-if="index === 3">
                                    <router-link :to="useRouterStore().getRoutePath(RoutesEnum.HOME_TOS_POLICY)">
                                        <div class="hover:text-yellow">General Terms of Service</div>
                                    </router-link>
                                    <router-link :to="useRouterStore().getRoutePath(RoutesEnum.HOME_PRIVACY_POLICY)">
                                        <div class="hover:text-yellow">User’s Privacy Policy</div>
                                    </router-link>
                                    <router-link :to="useRouterStore().getRoutePath(RoutesEnum.HOME_COOKIES_POLICY)">
                                        <div class="hover:text-yellow">Cookie Policy</div>
                                    </router-link>
                                    <div class="cursor-pointer hover:text-yellow" data-gt-cookie-widget-show>
                                        Cookie Preferences
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section :id="uiStore.isMobile ? 'meet-us' : ''" data-section-name="meet-us" class="fullpage text-[1vmin] leading-[1.2vmin] md:text-[0.6vmin] md:leading-[0.7vmin] pt-[20vh] md:pt-0">
            <div class="w-full h-full relative">
                <div class="absolute w-full cl:h-[150vh] top-[-12vmin] cl:top-0 bottom-[-10vmin] cl:bottom-0 cl:gb-layout gb-layout-row">
                    <div class="text-[1em] pl-[5em] cl:pl-0 cl:text-[1em] gb-layout cl:pb-[5em] w-[25%] cl:w-[95%]">
                        <div class="gb-home-ocean-glow font-black text-[10em] leading-[1em] whitespace-nowrap">
                            LET'S TALK!
                        </div>
                        <div class="font-thin text-[8em] leading-[1.2em] pt-[3vmin]">
                            And discover your next hit. Book a meeting below!
                        </div>
                    </div>

                    <div class="w-full h-full cl:md:max-h-[90vh] pt-[10em] md:pt-0 gb-layout-tl">
                        <calendly-widget class="h-full w-full"></calendly-widget>
                    </div>
                </div>
            </div>
        </section>

        <div class="fixed w-full pointer-events-none h-[8vmin] md:h-[5vmin] max-h-[100px] bottom-[4vmin] md:bottom-[2vmin]">
            <div class="h-full w-fit pl-[2vmin] pr-[4vmin]">
                <router-link :to="useRouterStore().getRoutePath(RoutesEnum.SIGN_UP)">
                    <div class="cursor-pointer pointer-events-auto h-full w-fit gb-home-orange-bg gb-glow-orange gb-glow-opacity-50 gb-glow-size-[5vmin] hover:brightness-125 gb-layout-row gap-[1vmin] pl-[3vmin] pr-[4vmin] rounded-full">
                        <gb-svg class="h-[75%] w-auto" icon="free_access"></gb-svg>
                        <div class="font-bold whitespace-nowrap text-[3vmin] md:text-[2vmin]">GET FREE ACCESS!</div>
                    </div>
                </router-link>
            </div>
        </div>
        <div class="text-dark-violet text-[2vmin] bottom-[1vmin] fixed w-full gb-layout pointer-events-none">
            {{ GembaseUtils.copyright() }}
        </div>
    </div>
</template>

<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref} from "vue";
import GembaseUtils from "@/utils/GembaseUtils";
import {Carousel, Pagination, Slide} from "vue3-carousel";
import {RoutesEnum} from "@/router/RoutesEnum";
import CalendlyWidget from "@/views/widgets/CalendlyWidget.vue";
import {homePageScrollModel} from "@/models/home/HomePageScrollModel";
import {EBillingModuleId, PortalConstants} from "@/models/portal/PortalConstants";
import GbSvg from "@/views/ui/icons/GbSvg.vue";
import PortalUiRouterLink from "@/views/ui/router/PortalUiRouterLink.vue";
import {useRouterStore} from "@/core/router/RouterStore";
import GbSvgV2 from "@/views/ui/icons/GbSvgV2.vue";
import GbImgLocal from "@/views/ui/img/GbImgLocal.vue";
import {useUiStore} from "@/models/ui/UiStore";

const uiStore = useUiStore();

const selectedModuleButtons = ref<string[]>([]);
const featuresStripe1 = ref<HTMLElement>();
const featuresStripe2 = ref<HTMLElement>();

const featuresTexts = [`FULL Access from $ ${PortalConstants.FULL_ACCESS_PRICE} / year!`, 'FREE Player research!'];

let featuresStripeText = "";
for (let i = 0; i < 10; ++i) {
    for (const t of featuresTexts) {
        featuresStripeText += t + "                 ";
    }
}
let featuresStripeAnimTimer = 0;
let stripePos = 0;

function toggleModuleButton(item: string) {
    GembaseUtils.toggleArr(selectedModuleButtons.value, item);
}

const challengeCards = [
    {img: "/static/media/gembase/home/v2/challenge-supercell-min.png", text: "Canceled 85% games over the years"},
    {img: "/static/media/gembase/home/v2/challenge-wooga-min.png", text: "Shelved 70% games in production"},
    {img: "/static/media/gembase/home/v2/challenge-gembase-min.png", text: "mitigates these risks, unlocking your game’s full potential"},
]

const solutionCards = [
    {img: "/static/media/gembase/home/v2/solution-games-min.png", text: "We AI-analyze 80 000<br>mobile & PC games …"},
    {img: "/static/media/gembase/home/v2/solution-people-min.png", text: "Assess preferences of<br>myriads of players …"},
    {img: "/static/media/gembase/home/v2/solution-attributes-min.png", text: "To boost potential of<br>any game or concept!"},
]

const uspCards = [
    {img: "/static/media/gembase/home/v2/gembase-entirety-min.png", title: "ENTIRETY", text: "Identifies competitors<br>through deep player<br>preferences."},
    {img: "/static/media/gembase/home/v2/gembase-speed-min.png", title: "DIRECTION", text: "Predicts demand and<br>threats instantly on any<br>attribute change."},
    {img: "/static/media/gembase/home/v2/gembase-clarity-min.png", title: "CLARITY", text: "Describes motivations<br>using a new taxonomy<br>of behaviors and needs."},
]

onMounted(async () => {
    window.scrollTo(0,0);

    GembaseUtils.loadScript("https://www.googletagmanager.com/gtag/js?id=G-N13ZBDM367", () => {
        // @ts-ignore
        window.dataLayer = window.dataLayer || [];
        // @ts-ignore
        function gtag(){
            // @ts-ignore
            dataLayer.push(arguments);
        }
        // @ts-ignore
        gtag('js', new Date());
        // @ts-ignore
        gtag('config', 'G-N13ZBDM367');
    });

    if (!uiStore.isMobile) {
        //document.getElementsByTagName("body")[0].style.overflow = "hidden";
        await GembaseUtils.sleep(500);
        homePageScrollModel.mounted();
        const segment = new URL(window.location.href).hash.replace('#','')
        homePageScrollModel.scrollToSectionByName(segment);
    }

    window.clearInterval(featuresStripeAnimTimer);
    const stripeElements = [featuresStripe1, featuresStripe2];
    featuresStripeAnimTimer = window.setInterval(() => {
        if (stripeElements[0].value !== undefined && stripeElements[1].value !== undefined) {
            let speed = window.innerHeight / 400;
            stripePos -= speed;
            const w = stripeElements[0].value.offsetWidth;
            if (stripePos < 0 - w - 200) {
                stripePos = stripePos + w;
                const el = stripeElements[1];
                stripeElements[1] = stripeElements[0];
                stripeElements[0] = el;
            }
            if (stripeElements[0].value !== undefined) {
                stripeElements[0].value.style.left = `${stripePos}px`;
            }
            if (stripeElements[0].value !== undefined && stripeElements[1].value !== undefined) {
                stripeElements[1].value.style.left = `${stripePos + stripeElements[0].value.offsetWidth}px`;
            }
        }
    }, 50);
})

onUnmounted(() => {
    window.clearInterval(featuresStripeAnimTimer);
    document.getElementsByTagName("body")[0].style.overflow = "";
    homePageScrollModel.destroyed();
});

function responsiveItemsToShow(cnt: number): number {
    if (uiStore.isMobile) {
        return 1;
    }
    return cnt;
}

interface IUseCase {
    title: string;
    imagePrefix: string;
    cards: {
        title: string;
        desc: string;
        moduleId: EBillingModuleId;
    }[];
}

interface IExample {
    id: string;
    image: string;
    title: string;
    subtitle: string;
    desc: string;
}

const examples: IExample[] = [
    {
        id: "1",
        image: "popsicle_c.jpg",
        title: "UNDISCLOSED PROJECT",
        subtitle: "#mobile #free2play #simulation",
        desc: "Undisclosed simulation concepted using the first version of the Discovery technologies."
    },
    {
        id: "2",
        image: "cases_warrior.jpg",
        title: "UNDISCLOSED PROJECT",
        subtitle: "UNDISCLOSED STUDIO",
        desc: "We helped discover an action RPG concept of a special female warrior and positioned it for the highest market potential."
    }
]

const useCases: IUseCase[] = [
    {
        title: "Understand players to design relatable games",
        imagePrefix: "cases-players",
        cards: [
            {
                moduleId: EBillingModuleId.INSIGHTS,
                title: "1. SURVEY YOUR PLAYERS",
                desc: "Add our modern surveys into your existing games. We will analyze player responses.",
            },
            {
                moduleId: EBillingModuleId.INSIGHTS,
                title: "2. SEE THEIR PREFERENCES",
                desc: "Discover what your players like and what they dislike using the Insights tool.<br>",
            },
            {
                moduleId: EBillingModuleId.INSIGHTS,
                title: "3. CREATE DESIGN PILLARS",
                desc: "Use the insights to create design pillars for game mechanics and content.",
            }
        ]
    },
    {
        title: "Discover competitors linked to a specific audience",
        imagePrefix: "cases-competitors",
        cards: [
            {
                moduleId: EBillingModuleId.AUDIT,
                title: "1. AUDIT THE GAME",
                desc: "Open any live game or concept with Auditor tool. We have audited 27 000 games already."
            },
            {
                moduleId: EBillingModuleId.AUDIT,
                title: "2. CHOOSE AUDIENCE",
                desc: "Use Auditor for any game to find best audiences and competitors who serve them."
            },
            {
                moduleId: EBillingModuleId.AUDIT,
                title: "3. FILTER COMPETITORS",
                desc: "You can adjust the search for competitors by using the advanced filter."
            }
        ]
    },
    {
        title: "Find game concept with the highest market potential",
        imagePrefix: "cases-concepts",
        cards: [
            {
                moduleId: EBillingModuleId.AUDIT,
                title: "1. ADD GAME CONCEPTS",
                desc: "Use the Auditor tool to add your game concepts. AI will analyze them for you.",
            },
            {
                moduleId: EBillingModuleId.INSIGHTS,
                title: "2. FIND THE BEST CONCEPT",
                desc: "Compare any concept to other concepts or live games using the Insights tool.",
            },
            {
                moduleId: EBillingModuleId.AUDIT,
                title: "3. EXAMINE IT FURTHER",
                desc: "Use the Auditor tool again to discover top audiences and competitors of your concept.",
            }
        ]
    },
    {
        title: "Discover untapped game concepts",
        imagePrefix: "cases-gaps",
        cards: [
            {
                moduleId: EBillingModuleId.IDEAS,
                title: "1. CHOOSE A DIRECTION",
                desc: "Choose attributes matching your concept direction using the Ideas tool."
            },
            {
                moduleId: EBillingModuleId.IDEAS,
                title: "2. SEARCH MARKET GAPS",
                desc: "Ideas tool will find people who love these attributes, and what other attributes they like."
            },
            {
                moduleId: EBillingModuleId.IDEAS,
                title: "3. REFINE THE IDEA",
                desc: "Select a gap with high TAM and low competition, then refine it by adding attributes."
            }
        ]
    },
    {
        title: "Test out hundreds of ideas at once with real players",
        imagePrefix: "cases-studies",
        cards: [
            {
                moduleId: EBillingModuleId.IDEAS,
                title: "1. CREATE FEATURE POOLS",
                desc: "Use Ideas tool to fill in game features. These are used to construct the micro-concepts."
            },
            {
                moduleId: EBillingModuleId.IDEAS,
                title: "2. TEST WITH PLAYERS",
                desc: "You can test these concepts via our external panels or within your own games."
            },
            {
                moduleId: EBillingModuleId.IDEAS,
                title: "3. EVALUATE RESULTS",
                desc: "We will analyze the responses to reveal market reach, best features and portfolio overlaps."
            }
        ]
    }
];

const persons: {
    id: string;
    firstName: string;
    lastName: string;
    tags: string;
    role?: string;
    linkedin: string;
    img: string;
    position?: string;
    bio1?: string;
    bio2?: string;
    color?: string;
}[] = [
    {
        id: "dolezal",
        firstName: "Pavel",
        lastName: "Dolezal",
        tags: "#product",
        linkedin: "https://www.linkedin.com/in/pavel-dolezal-8b293992/",
        img: "pavel_dolezal-1.png",
        position: "CEO",
        bio1: "Interested in innovation, finances and psychology",
        bio2: "3y as innovation director<br>7y as mobile games product manager<br>Led teams of 10 – 30 people."
    },
    {
        id: "richter",
        firstName: "Erik",
        lastName: "Richter",
        tags: "#saas",
        linkedin: "https://www.linkedin.com/in/erik-richter-38692211a/",
        img: "erik_richter-1.png",
        position: "Head of Engineering",
        bio1: "Interested in data tools and games development.",
        bio2: "10y as mobile games software engineer<br>5y as finance software developer<br>Led teams of up to 5 people."
    },
    {
        id: "singh",
        firstName: "Shum",
        lastName: "Singh",
        tags: "#strategy",
        role: "advisor",
        linkedin: "https://www.linkedin.com/in/shum-singh-985231/",
        img: "shum_singh.png",
        position: "Chairman of Supervisory Board",
        bio2: "25y at Agnitio Capital, M&A Banker & Investor in a large number of Gaming companies of various stages",
        color: "y",
    },
    {
        id: "coulon",
        firstName: "Michel",
        lastName: "Coulon",
        tags: "#research",
        role: "advisor",
        linkedin: "https://www.linkedin.com/in/michel-coulon-07640717/",
        img: "michel_coulon.png",
        bio2: "19y at EA, Glu & Wargaming, ex Research Director for consumer insights and strategic planning",
        color: "b",
    },
    {
        id: "vij",
        firstName: "Rudi",
        lastName: "Vij",
        tags: "#partnerships",
        role: "advisor",
        linkedin: "https://www.linkedin.com/in/rudi-vij-mobile-app-promotion-9217b957/",
        img: "rudi_vij-1.png",
        bio2: "8y at Google, BD Manager for EMEA Mobile Apps Promotion",
        color: "g",
    },
    {
        id: "lee",
        firstName: "Steve",
        lastName: "Lee",
        tags: "#partnerships",
        role: "advisor",
        linkedin: "https://www.linkedin.com/in/8teve/",
        img: "stephen_lee.png",
        bio2: "Head of Business Development at DECA Games with 23y of experience",
        color: "g",
    },
    {
        id: "hegely",
        firstName: "Erik",
        lastName: "Hegely",
        tags: "#growth",
        role: "advisor",
        linkedin: "https://www.linkedin.com/in/erikhegely/",
        img: "erik_hegely-1.png",
        bio2: "5y as mobile games growth director<br>5y as ecommerce marketer",
        color: "y",
    },
    {
        id: "pechac",
        firstName: "Matej",
        lastName: "Pechac",
        tags: "#ai",
        role: "advisor",
        linkedin: "https://www.linkedin.com/in/matej-pech%C3%A1%C4%8D-573546127/",
        img: "matej_pechac.png",
        bio2: "3y as AI software engineer<br>5y as mobile games developer<br>3y as finance software developer",
        color: "b",
    },
]

</script>

<style scoped>
.gb-cards-glow {
  @apply !gb-glow-size-[10vmin] !gb-glow-opacity-50;
}

.gb-cards-glow[data-index="0"] {
  @apply gb-glow-violet-blue;
}

.gb-cards-glow[data-index="1"] {
  @apply gb-glow-ocean;
}

.gb-cards-glow[data-index="2"] {
  @apply gb-glow-yellow;
}

.gb-home-ocean-glow {
  @apply gb-glow-ocean gb-glow-opacity-75 gb-glow-size-[5vmin];
}

.gb-home-orange-bg {
  @apply bg-orange text-black hover:brightness-125;
}

.gb-home-window {
  @apply gb-layout-tl rounded-[2.5vmin] border-black border p-[2%] bg-gradient-to-r from-night-violet to-night-violet-light;
}

.gb-home-window-content {
  @apply rounded-[2vmin] bg-white bg-opacity-5;
}

.gb-gembase-card {
  /* nothing */
}

.gb-gembase-card[data-card-index="2"] {
  @apply text-black max-w-[90%] font-normal;
}

.gb-home-team-glow {
  @apply gb-glow-ocean gb-glow-opacity-75 gb-glow-size-[1.8vmin];
}

.gb-home-team-glow[data-advisor="true"] {
  @apply gb-glow-violet-blue gb-glow-opacity-50 gb-glow-size-[1.8vmin];
}

@media screen and (max-width: 800px) {
  .gb-home-team-glow {
    @apply gb-glow-ocean gb-glow-opacity-75 gb-glow-size-[7vmin];
  }

  .gb-home-team-glow[data-advisor="true"] {
    @apply gb-glow-violet-blue gb-glow-opacity-75 gb-glow-size-[7vmin];
  }
}

.gb-separator {
  @apply mt-[4.5vh] mb-[4.5vh] w-[10vw] min-w-[100px] h-[0.7vmin] bg-gradient-to-r from-transparent to-white rounded-full;
}

.fullpage {
  @apply gb-layout w-full h-[100vh];
}

.fullpage::before {
  @apply h-[var(--gb-ui-portal-header-h)] min-h-[var(--gb-ui-portal-header-h)] max-h-[var(--gb-ui-portal-header-h)] w-full;

  content: "";
}

.fullpage::after {
  @apply h-[30px] min-h-[30px] max-h-[30px] w-full;

  content: "";
}

@media screen and (max-width: 800px) {
  .fullpage {
    @apply h-auto;
  }

  .fullpage::before {
    @apply h-0 min-h-0 max-h-0 w-full;

    content: "";
  }

  .fullpage::after {
    @apply h-0 min-h-0 max-h-0 w-full;

    content: "";
  }
}

.sections-menu {
  @apply fixed right-[1rem] top-[50%] translate-y-[-50%];
}

.sections-menu .menu-point {
  @apply w-[1.2vmin] h-[1.2vmin] bg-white mt-[1.5vmin] mb-[1.5vmin] cursor-pointer rounded-circle opacity-30;

  transition: 0.4s ease-in-out all;
}

.sections-menu .menu-point.active {
  @apply opacity-100 scale-150 bg-orange;
}

.sections-menu .menu-point:hover {
  @apply opacity-100 scale-125 bg-orange;
}

.gb-home-about-us-card-content {
  @apply opacity-0 bg-transparent hover:opacity-100 hover:duration-500 hover:bg-black/70;
}

.gb-home-violet-blue-glow {
  @apply gb-glow-violet-blue gb-glow-opacity-50 gb-glow-size-[5vmin] hover:brightness-125;
}

.gb-home-yellow-glow {
  @apply gb-glow-yellow gb-glow-opacity-50 gb-glow-size-[5vmin] hover:brightness-125;
}

</style>

<style>
@import "vue3-carousel/dist/carousel.css";

:root {
  --vc-pgn-width: 0.8vw;
  --vc-pgn-height: 0.8vw;
  --vc-pgn-margin: 0;
  --vc-pgn-border-radius: 50%;
  --vc-pgn-background-color: rgba(255 255 255 / 30%);
  --vc-pgn-active-color: #ffb204;
}

.carousel__pagination {
  margin: 0;
  padding: 0;
  margin-top: 1vmin;
}

.carousel__pagination-button::after {
  margin-left: 0.5vmin;
  margin-right: 0.5vmin;
  width: 1.5vmin;
  height: 1.5vmin;
}

@media screen and (max-width: 800px) {
  .carousel__pagination-button::after {
    margin-left: 2vmin;
    margin-right: 2vmin;
    width: 3vmin;
    height: 3vmin;
  }
}
</style>
