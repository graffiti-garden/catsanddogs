export default function({myID, useCollection}) { return {

  setup: ()=> {

    const selectedTags = Vue.ref([])

    return {
      selectedTags,
      posts: useCollection(()=> ({
        'post.imageURL': { $type: 'string' },
        timestamp: { $type: 'number' },
        tags: { '$elemMatch': { '$in': selectedTags.value } }
      }))
    }
  },

  data: ()=> ({
    imageURL: '',
    postTo: ''
  }),

  watch: {
    selectedTags() {
      this.postTo = ''
    }
  },

  methods: {
    post() {
      if (!this.postTo || !this.imageURL) return

      try {
        const url = new URL(this.imageURL)
      } catch {
        alert("that's not an image URL!")
        return
      }

      const post = {
        post: { imageURL: this.imageURL },
        timestamp: Date.now(),
      }

      if (["cats", "dogs"].includes(this.postTo)) {
        post.tags = [this.postTo]
        post._inContextIf = [{
          _queryFailsWithout: ["tags.0"]
        }]
      } else {
        post.tags = ["cats", "dogs"]
        post._inContextIf = [{
          _queryFailsWithout: [["tags.0", "tags.1"]]
        }]
        if (this.postTo == "both") {
          post._inContextIf[0]._queryPassesWithout = ["tags.0", "tags.1"]
        }
      }

      this.posts.update(post)
      this.postTo = ''
      this.imageURL = ''
    },

    remove(post) {
      if (confirm("Are you sure you want to delete this post?")) {
        post._remove()
      }
    }
  },

  template: `
    <h1>
      Furry Feed
    </h1>

    <menu>
      <li>
        <input id="cats" type="checkbox" value="cats" v-model="selectedTags">
        <label for="cats">
          🐱
        </label>
      </li>
      <li>
        <input id="dogs" type="checkbox" value="dogs" v-model="selectedTags">
        <label for="dogs">
          🐶
        </label>
      </li>
    </menu>

    <template v-if="selectedTags.length">
      <form v-if="selectedTags.length" @submit.prevent="post">
        <p>
          Image URL: <input v-model="imageURL">
        </p>
        <p>
          Post to people who love
          <select v-model="postTo">
            <option disabled value="">select one</option>
            <option v-if="selectedTags.includes('cats')">cats</option>
            <option v-if="selectedTags.includes('dogs')">dogs</option>
            <option value="either">either cats or dogs</option>
            <option v-if="selectedTags.length==2" value="both">both cats and dogs</option>
          </select>
        </p>
        <p>
          <input :disabled="!postTo||!imageURL" type="submit" value="Post!">
        </p>
      </form>
      <ul>
        <li v-for="post in posts.sortBy('-timestamp')">
          <img :src="post.post.imageURL" @dblclick="remove(post)">
        </li>
      </ul>
    </template>`
}}
