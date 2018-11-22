// Components

Vue.component('share-data', {
  props: ['url', 'text'],
  template: `<a class="share" :href="url" target="_new">
    <img src="~/open-iconic/svg/link.svg" alt="Link to data" title="Link to data">
  </a>`
})

Vue.component('linked-value', {
  props: ['item'],
  template: `<span>
  <span v-if="item.valid">{{ item.value }}</span>
  <span v-if="!item.valid" :title="item.value" class="missing-item" data-toggle="tooltip">---</span>
  </span>`
})

Vue.component('linked-image', {
  props: ['item', 'height', 'width'],
  template: `<span>
  <img v-if="item.valid" :height="height" :width="width" :src="item.value">
  <span v-if="!item.valid" :title="item.value" class="missing-item" data-toggle="tooltip">---</span>
  </span>`
})


// Validators

const dateValidator = (value) => new moment(value, 'YYYY-MM-DD').isValid();
const timespanValidator = (value) => /^(\d+:)?(\d{1,2}:)?(\d{1,2})?$/.test(value);
