module.exports = {
    watch: {
        typeAheadPointer() {
            this.maybeAdjustScroll()
        }
    },

    methods: {
        /**
         * Adjust the scroll position of the dropdown list
         * if the current pointer is outside of the
         * overflow bounds.
         * @returns {*}
         */
        maybeAdjustScroll() {
            let pixelsToPointerTop = this.pixelsToPointerTop()
            let pixelsToPointerBottom = this.pixelsToPointerBottom()
            if ( pixelsToPointerTop <= this.viewport().top ) {
                return this.scrollTo( pixelsToPointerTop )
            } else if ( pixelsToPointerBottom >= this.viewport().bottom ) {
                return this.scrollTo( this.viewport().top + this.pointerHeight() )
            }
        },

        /**
         * The distance in pixels from the top of the dropdown
         * list to the top of the current pointer element.
         * @returns {number}
         */
        pixelsToPointerTop() {
            let pixelsToPointerTop = 0
            if ( this.$refs[ 'selectr_options' ] ) {
                for ( let i = 0; i < this.typeAheadPointer; i++ ) {
                    pixelsToPointerTop += this.$refs[ 'selectr_options' ].children[ i ].offsetHeight
                }
            }
            return pixelsToPointerTop
        },

        /**
         * The distance in pixels from the top of the dropdown
         * list to the bottom of the current pointer element.
         * @returns {*}
         */
        pixelsToPointerBottom() {
            return this.pixelsToPointerTop() + this.pointerHeight()
        },

        /**
         * The offsetHeight of the current pointer element.
         * @returns {number}
         */
        pointerHeight() {
            let element = this.$refs[ 'selectr_options' ] ? this.$refs[ 'selectr_options' ].children[ this.typeAheadPointer ] : false
            return element ? element.offsetHeight : 0
        },

        /**
         * The currently viewable portion of the dropdownMenu.
         * @returns {{top: (string|*|number), bottom: *}}
         */
        viewport() {
            return {
                top: this.$refs[ 'selectr_options' ] ? this.$refs[ 'selectr_options' ].scrollTop : 0,
                bottom: this.$refs[ 'selectr_options' ] ? this.$refs[ 'selectr_options' ].offsetHeight + this.$refs[ 'selectr_options' ].scrollTop : 0
            }
        },

        /**
         * Scroll the dropdownMenu to a given position.
         * @param position
         * @returns {*}
         */
        scrollTo( position ) {
            return this.$refs[ 'selectr_options' ] ? this.$refs[ 'selectr_options' ].scrollTop = position : null
        },
    }
}

