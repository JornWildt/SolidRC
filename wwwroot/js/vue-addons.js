// Components

Vue.component('linked-value', {
  props: ['item'],
  template: `<span>
  <span v-if="item.valid">{{ item.value }}</span>
  <span v-if="!item.valid" :title="item.value">---</span>
  </span>`
})

Vue.component('linked-image', {
  props: ['item', 'height', 'width'],
  template: `<span>
  <img v-if="item.valid" :height="height" :width="width" :src="item.value">
  <span v-if="!item.valid" :title="item.value">---</span>
  </span>`
})


// Validators

const dateValidator = (value) => new moment(value, 'YYYY-MM-DD').isValid();
const timespanValidator = (value) => /^(\d+:)?(\d{1,2}:)?(\d{1,2})?$/.test(value);
