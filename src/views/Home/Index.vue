<template>
  <v-layout>
    <v-card contextual-style="dark">
      <span slot="header">
        {{ $t('general.welcome') }}
      </span>
      <div slot="body">
        <p>
          Get started with the Vue JS boilerplate
        </p>
        <p>
          For questions, contact me:
        </p>
        <p>
          <a
            class="btn btn-outline-primary"
            href="http://github.com/santoshshinde2012"
            target="_blank"
          >
            <i
              class="fa fa-github fa-fw"
              aria-hidden="true"
            />
            <span class="pl-2">
              GitHub
            </span>
          </a>
          <a
            class="btn btn-outline-primary"
            href="http://twitter.com/shindesan2012"
            target="_blank"
          >
            <i
              class="fa fa-twitter fa-fw"
              aria-hidden="true"
            />
            <span class="pl-2">
              Twitter
            </span>
          </a>
        </p>
        <p>
          For bugs, see:
        </p>
        <a
          class="btn btn-outline-primary"
          href="https://github.com/santoshshinde2012/vue-boilerplate/issues"
          target="_blank"
        >
          <i
            class="fa fa-github fa-fw"
            aria-hidden="true"
          />
          <span class="pl-2">
            GitHub
          </span>
        </a>
      </div>
      <div slot="footer">
        Boilerplate
      </div>
    </v-card>
  </v-layout>
</template>

<script>
/* ============
 * Home Index Page
 * ============
 *
 * The home index page.
 */

import VLayout from '@/layouts/Default.vue';
import VCard from '@/components/Card.vue';

export default {
  /**
   * The name of the page.
   */
  name: 'HomeIndex',

  /**
   * The components that the page can use.
   */
  components: {
    VLayout,
    VCard,
  },
};
</script>
