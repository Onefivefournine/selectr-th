module.exports = {
    data() {
        return {
            typeAheadPointer: -1
        }
    },

    watch: {
        filteredOptions() {
            this.typeAheadPointer = 0
        }
    },

    methods: {
        /**
         * Move the typeAheadPointer visually up the list by
         * subtracting the current index by one.
         * @return {void}
         */
        typeAheadUp() {
            if ( this.typeAheadPointer > 0 ) {
                this.typeAheadPointer--
                    if ( this.maybeAdjustScroll ) {
                        this.maybeAdjustScroll()
                    }
            }
        },

        /**
         * Move the typeAheadPointer visually down the list by
         * adding the current index by one.
         * @return {void}
         */
        typeAheadDown() {
            if ( this.typeAheadPointer < this.options.length - 1 ) {
                this.typeAheadPointer++
                    if ( this.maybeAdjustScroll ) {
                        this.maybeAdjustScroll()
                    }
            }
        },

        /**
         * Select the option at the current typeAheadPointer position.
         * @return {void}
         */
        typeAheadSelect() {
            if ( this.options[ this.typeAheadPointer ] ) {
                this.select( this.options[ this.typeAheadPointer ] );
            } else if ( this.query.length ) {
                this.select( this.query )
            }
        },
    }
}

