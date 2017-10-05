<style lang="scss">
$gray: #999;
$dgray: #676a6c;
$lgray:#e7eaec;
$primary:#8f8ef3;
$anti-primary:#e9001a;
.selectr-th {
  &__placeholder {
    color: $gray;
    float: left;
  }
  &__button.form-control {
    height: auto;
    cursor: text;
    .selectr-th.opened &:focus {
      outline: none;
      box-shadow: none;
      -webkit-box-shadow: none;
      border: 1px solid $lgray;
    }
  } // &__input.form-control {
  //     &:focus {
  //         outline: none;
  //         box-shadow: none;
  //         -webkit-box-shadow: none;
  //         border: 1px solid $lgray;
  //     }
  // }
  &__match {
    float: left;
    text-align: left;
    color: $dgray;
  }
  &__options {
    position: absolute;
    z-index: 1;
    background: #fff;
    border: 1px solid $lgray;
    border-radius: 4px;
    outline: 0;
    margin-top: 3px;
    width: 100%;
    top: calc(100% - 1px);
    left: 0;
    text-align: left;
    overflow: auto;
    max-height: 140px;
  }
  &__option {
    padding: 5px 10px;
    cursor: pointer;
    &:hover,
    &.highlight {
      background-color: $primary;
      color: #fff;
    }
    &.disabled {
      background-color: $lgray;
      color: $gray;
      &:hover {
        background-color: $anti-primary;
        color: #fff;
      }
    }
  }
  &__container {
    position: relative;
  }
  &.opened &__button {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
  &.opened &__arrow {
    display: none;
  }
}
</style>
<template>
  <div class="selectr-th__container selectr-th"
    :class="searching?'opened':''">
    <button :class="className + ' selectr-th__button'"
      v-show="!searching"
      @focus="open()"
      @mousedown.prevent="open()">
      <span v-if="selectedItem"
        class="selectr-th__match">{{getOptionLabel(selectedItem)}}</span>
      <span v-else-if="query"
        class="selectr-th__match">{{query}}</span>
      <span v-else
        class="selectr-th__placeholder">{{placeholder}}</span>
    </button>
    <input type="text"
      ref="selectr_input"
      v-show="searching"
      :placeholder="placeholder"
      @keydown.up.prevent="typeAheadUp"
      @keydown.down.prevent="typeAheadDown"
      @keyup.enter.prevent="typeAheadSelect"
      @input="useAction()"
      @blur="blur()"
      v-model="query"
      :class="className + ' selectr-th__input'">
    <div class="selectr-th__options"
      ref="selectr_options"
      v-show="options && options.length && searching">
      <div class="selectr-th__option"
        :class="{highlight: index === typeAheadPointer}"
        @mousedown="select(option)"
        :key="option.id"
        v-for="(option,index) in options">
        <div v-if="!htmlOption">{{getOptionLabel(option)}}</div>
        <slot v-else
          :data="option"></slot>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import pointerScroll from './mixins/pointerScroll'
import typeAheadPointer from './mixins/typeAheadPointer'

export default Vue.extend( {
  data() {
    return {
      selectedItem: null,
      options: [],
      query: '',
      searching: false,
      debouncing: false,
    }
  },
  mixins: [ pointerScroll, typeAheadPointer ],
  props: {
    className: {
      type: String,
      default: 'form-control'
    },
    debounce: {
      type: Number,
      default: 500,
      validator( val ) {
        return val >= 0;
      }
    },
    placeholder: {
      type: String,
      default: ''
    },
    htmlOption: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: ''
    },
    action: {
      type: Function,
      default () { console.warn( 'Selectr-typeahead: no action provided' ) }
    },
    noResultsText: {
      type: String,
      default: 'Ничего не найдено!'
    },
    preOptions: {
      default: null
    },
    value: {
      default: ''
    },
    clearMatchOnSelect: {
      type: Boolean,
      default: false
    },
    clearQueryOnSelect: {
      type: Boolean,
      default: false
    },
    selectQueryWhenEmpty: {
      type: Boolean,
      default: true
    },
    useAsOptions: {
      type: String,
      default: ''
    },
    getOptionLabel: {
      type: Function,
      default ( option, mutatedLabel ) {
        let currentLabel = mutatedLabel || this.label;
        if ( typeof option === 'object' ) {
          if ( currentLabel && typeof currentLabel === 'string' && option[ currentLabel ] ) {
            return option[ currentLabel ]
          } else if ( currentLabel.includes( '.' ) ) {
            mutatedLabel = currentLabel.split( '.' )
            let mutatedOption = option[ mutatedLabel[ 0 ] ];
            mutatedLabel.shift();
            mutatedLabel = mutatedLabel.join( '.' );
            return this.getOptionLabel( mutatedOption, mutatedLabel )
          }
        }
        return option;
      }
    },
  },
  created() {

  },
  updated() {
    if ( this.preOptions && !this.query.length ) {
      this.options = this.useAsOptions ? this.preOptions[ this.useAsOptions ] : this.preOptions;
    }
  },
  watch: {
    selectedItem( val ) {
      this.$emit( 'input', val );
    },
    options( val ) {
      if ( !val || !val.length ) this.selectedItem = this.query
    },
    value( val ) {
      if ( val ) {
        this.selectedItem = val;
        this.query = this.getOptionLabel( val );
      }
    }
  },
  methods: {
    blur() {
      if ( this.searching ) this.close()
    },
    open() {
      this.searching = true;
      let self = this;
      setTimeout( () => self.$refs.selectr_input.focus(), 0 );
      if ( this.query.length ) this.useAction()
    },
    close( ev ) {
      if ( ( ev && !ev.target.classList.contains( 'selectr__match' ) ) || !ev ) this.searching = false;
    },
    useAction() {
      if ( this.query.length && !this.debouncing ) {
        this.debouncing = true;
        this.execAction()
        let cachedQuery = this.query;
        setTimeout( () => {
          this.debouncing = false
          if ( this.query !== cachedQuery && this.query.length ) this.execAction().bind( this )
        }, this.debounce )
      }
    },
    execAction() {
      return this.action( this.query )
        .then( ( res ) => {
          this.options = this.useAsOptions ? res[ this.useAsOptions ] : res;
          if ( this.query.length && !this.options.length ) {
            this.typeAheadPointer = -1;
            this.options = [ {
                            [ this.label ]: this.noResultsText,
              unselectable: true
                        } ]
            if ( this.selectQueryWhenEmpty ) this.selectedItem = this.query;
          }
          return new Vue.Promise( ( resolve ) => { resolve( res ) } )
        } )
        .catch( ( err ) => console.error( 'Selectr-typeahead: Error in action Promise', err ) )
    },
    deselect( option ) {
      this.selectedItem = null;
    },
    select( option ) {
      if ( !option.unselectable ) {
        this.query = this.getOptionLabel( option );
        Vue.set( this, 'selectedItem', option );
        this.$emit( 'select', option )
        setTimeout( () => {
          if ( this.searching ) this.searching = false;
          if ( this.clearQueryOnSelect ) this.query = '';
          if ( this.clearMatchOnSelect ) this.selectedItem = null;
        }, 10 )
      }
    },
  },
  template
} );
</script>
