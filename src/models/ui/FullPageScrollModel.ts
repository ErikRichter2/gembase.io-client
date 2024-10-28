import {Ref} from "vue";

export interface SectionData {
    id: number;
    name?: string;
    el: HTMLElement;
}

export interface FullPageScrollData {
    activeSection?: SectionData;
    sections: SectionData[];
}

export class FullPageScrollModel {

    inMove = false;
    inMoveDelay = 600;
    touchStartY = 0;
    scrollTimeout = 0;
    wheelTimeout = 0;
    isScroll = false;
    isWheel = false;

    readonly data: Ref<FullPageScrollData>;

    constructor(data: Ref<FullPageScrollData>) {
        this.data = data;
    }

    /**
     * Calcaulates the absolute offsets of each section on the page and pushs it into the offsets array
     */
    calculateSectionOffsets() {
        const sections = document.getElementsByClassName('fullpage');
        this.data.value.sections.length = 0;
        for (let i = 0; i < sections.length; ++i) {
            const section = sections[i] as HTMLElement;
            const sectionData: SectionData = {
                id: i,
                el: section
            }
            if (section.dataset.sectionName !== undefined) {
                sectionData.name = section.dataset.sectionName;
            }
            this.data.value.sections.push(sectionData);
        }
        if (this.data.value.activeSection === undefined) {
            if (this.data.value.sections.length > 0) {
                this.data.value.activeSection = this.data.value.sections[0];
            }
        }
    }

    /**
     * Handle the 'mousewheel' event for other browsers
     */
    handleMouseWheel = (e: WheelEvent) => {
        e.preventDefault();
        e.stopImmediatePropagation();

        if(!this.isScroll && !this.inMove && !this.isWheel) {
            if (e.deltaY > 10) {
                this.moveUp();
            } else if (e.deltaY < -10) {
                this.moveDown();
            }
        }

        this.isWheel = true;
        window.clearTimeout(this.wheelTimeout);
        this.wheelTimeout = window.setTimeout(() => {
            this.isWheel = false;
        }, 30);

        return false;
    }

    /**
     * Move to the previous section or the last section if you're on the first section
     */
    moveDown() {
        for (let i = 0; i < this.data.value.sections.length; ++i) {
            if (this.data.value.sections[i].id === this.data.value.activeSection?.id) {
                if (i > 0) {
                    this.inMove = true;
                    this.data.value.activeSection = this.data.value.sections[i - 1];
                    this.scrollToSection(this.data.value.activeSection.id, true);
                    return;
                }
            }
        }
    }

    /**
     * Move to the next section or the first section if you're on the last section
     */
    moveUp() {
        for (let i = 0; i < this.data.value.sections.length; ++i) {
            if (this.data.value.sections[i].id === this.data.value.activeSection?.id) {
                if (i < this.data.value.sections.length - 1) {
                    this.inMove = true;
                    this.data.value.activeSection = this.data.value.sections[i + 1];
                    this.scrollToSection(this.data.value.activeSection.id, true);
                    return;
                }
            }
        }
    }

    scrollToSectionByName(name: string) {
        for (let i = 0; i < this.data.value.sections.length; ++i) {
            if (this.data.value.sections[i].name === name) {
                return this.scrollToSection(i, true);
            }
        }
    }

    /**
     * Scrolls to the passed section id if the section exists and the delay is over
     */
    scrollToSection(id: number, force = false) {
        if(this.inMove && !force) return false;
        if (this.data.value.sections.length === 0) {
            return false;
        }

        this.inMove = true;

        for (let i = 0; i < this.data.value.sections.length; ++i) {
            if (this.data.value.sections[i].id === id) {
                this.data.value.activeSection = this.data.value.sections[i];
                this.data.value.sections[i].el.scrollIntoView({behavior: 'smooth'});
                setTimeout(() => {
                    this.inMove = false;
                }, this.inMoveDelay);
            }
        }
    }

    /**
     * Handles the 'touchstart' event on mobile devices
     */
    touchStart = (e) => {
        e.preventDefault();
        this.touchStartY = e.touches[0].clientY;
    }

    /**
     * Handles the 'touchmove' event on mobile devices
     */
    touchMove = (e) => {
        if(this.inMove) return false;
        if(this.isScroll) return false;

        e.preventDefault();

        const currentY = e.touches[0].clientY;

        if(this.touchStartY < currentY) {
            this.moveDown();
        } else {
            this.moveUp();
        }

        this.touchStartY = 0;
        return false;
    }

    onScroll = () => {
        console.log("onscroll");
        this.isScroll = true;
        window.clearTimeout(this.scrollTimeout);
        this.scrollTimeout = window.setTimeout(() => {
            this.isScroll = false;
        }, 100);
    }

    /**
     * mounted() hook executes after page load and call the section offset calculation and registers all events
     */
    mounted() {
        this.calculateSectionOffsets();

        this.destroyed();
        //window.addEventListener('scroll', this.onScroll);
        //window.addEventListener('wheel', this.handleMouseWheel, { passive: false }); // Other browsers
        //window.addEventListener('touchstart', this.touchStart, { passive: false }); // mobile devices
        //window.addEventListener('touchmove', this.touchMove, { passive: false }); // mobile devices
    }

    /**
     * destroyed() hook executes on page destroy and removes all registered event listeners
     */
    destroyed() {
        //window.removeEventListener('scroll', this.onScroll);
        window.removeEventListener('wheel', this.handleMouseWheel);  // Other browsers
        window.removeEventListener('touchstart', this.touchStart); // mobile devices
        window.removeEventListener('touchmove', this.touchMove); // mobile devices
    }
}
