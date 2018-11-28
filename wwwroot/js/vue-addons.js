// Components

Vue.component('button-processing', {
  props: ['cc', 'click', 'id', 'content', 'processing'],
  template: `<button type="button" :class="cc" v-on:click="$emit('click')" id="id">
  <slot v-if="!processing"></slot>
  <span v-if="processing">Saving ...</span>
  </button>`
});

Vue.component('share-data', {
  props: ['url'],
  template: `<a class="share" :href="url" target="_new">
    <img src="` + mapIconToUrl('link-intact.svg') + `" alt="Link to data" title="Link to data">
  </a>`
});

Vue.component('linked-value', {
  props: ['item'],
  template: `<span>
  <span v-if="item.valid">{{ item.value }}</span>
  <span v-if="!item.valid" :title="item.value" class="missing-item" data-toggle="tooltip">---</span>
  </span>`
});

Vue.component('linked-image', {
  props: ['item', 'height', 'width'],
  template: `<span>
  <img v-if="item.valid" :height="height" :width="width" :src="item.value">
  <span v-if="!item.valid" :title="item.value" class="missing-item" data-toggle="tooltip">---</span>
  </span>`
});


Vue.component('data-load', {
  props: ['loading'],
  template: `
  <div>
    <div v-if="loading" class="progress" id="progressbar">
      <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div>
    </div>
    <slot v-if="!loading"></slot>
  </div>
`
});


// Validators

const dateValidator = (value) => new moment(value, 'YYYY-MM-DD').isValid();
const timespanValidator = (value) => /^(\d+:)?(\d{1,2}:)?(\d{1,2})?$/.test(value);
