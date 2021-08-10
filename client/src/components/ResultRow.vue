<template>
  <tr>
    <td class="table-element left-context">
      {{ leftContext }}
    </td>
    <td class="table-element match">{{ match }}</td>
    <td class="table-element right-context">
      {{ rightContext }}
    </td>
  </tr>
</template>

<script>
export default {
  props: {
    result: Object,
    matchIndex: Number,
  },

  computed: {
    // sentence's left context
    leftContext() {
      return this.result.tokens
        .slice(0, this.matchIndex)
        .map((e) => e.form)
        .join(" ");
    },

    // matched word (to be highlighted)
    match() {
      return this.result.tokens[this.matchIndex].form;
    },

    // sentence's right context
    rightContext() {
      return this.result.tokens
        .slice(this.matchIndex + 1, this.result.tokens.length)
        .map((e) => e.form)
        .join(" ");
    },
  },
};
</script>

<style scoped>
.table-element {
  padding: 10px 10px;
}

.left-context {
  table-layout: fixed;
  text-align: right;
  width: auto;
}

.match {
  background-color: #6666ff;
}

.right-context {
  table-layout: fixed;
  text-align: left;
  width: auto;
}
</style>
