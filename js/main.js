let eventBus = new Vue()

Vue.component('product', {
    template: `
   <div class="product">
       <div class="product-image">
            <img :alt="altText" :src="image"/>
        </div>

        <div class="product-info">
            <h1>{{ title }}</h1>
            <p>{{ description }}</p>
            <a :href="link">More products like this</a>

            <p v-if="inStock">In stock</p>
            <p v-else style="text-decoration: line-through">Out of stock</p>

            <span v-show="onSale">{{ sale }}</span>

            <div
                    class="color-box"
                    v-for="(variant, index) in variants"
                    :key="variant.variantId"
                    :style="{ backgroundColor: variant.variantColor }"
                    @mouseover="updateProduct(index)"
            >
            </div>

            <ul>
                <li v-for="size in sizes">{{ size }}</li>
            </ul>
        
            <div class="btns">
                <button
                        v-on:click="addToCart"
                        :disabled="!inStock"
                        :class="{ disabledButton: !inStock }"
                >
                    Add to cart</button>
                <button @click="removeFromCart" :class="{disabledButton: !inStock}">
                    Remove from cart
                </button>
            </div>
        </div>
    
   </div>
   `,
    props: {
        premium: {
            type: Boolean,
            required: true
        },
        reviews: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            product: "Socks",
            brand: 'Vue Mastery',
            description: "A pair of warm, fuzzy socks",
            selectedVariant: 0,
            altText: "A pair of socks",
            link: "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks  ",
            onSale: true,
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10,
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 0,
                }
            ],
            sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        }
    },
    methods: {
        updateProduct(index) {
            this.selectedVariant = index;
            console.log(index);
        },
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
        },
        removeFromCart() {
            this.$emit('remove-from-cart');
        },
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock(){
            return this.variants[this.selectedVariant].variantQuantity > 0;
        },
        sale(){
            return `${this.brand} ${this.product} is ${this.onSale ? '' : 'not'} on sale`
        },
        shipping() {
            if (this.premium) {
                return "Free";
            } else {
                return 2.99
            }
        }
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
            localStorage.setItem('reviews', JSON.stringify(this.reviews));
        })
    }

})

Vue.component('product-details', {
    template: `
    <ul>
       <li v-for="detail in details">{{ detail }}</li>
    </ul>
`,
    data() {
        return {
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
        }
    }
});

Vue.component('product-review', {
    template: `
   <form class="review-form" @submit.prevent="onSubmit">
     <p v-if="errors.length">
     <b>Please correct the following error(s):</b>
     <ul>
       <li v-for="error in errors">{{ error }}</li>
     </ul>
     </p>

     <p>
       <label for="name">Name:</label>
       <input id="name" v-model="name" placeholder="name">
     </p>
    
     <p>
       <label for="review">Review:</label>
       <textarea id="review" v-model="review"></textarea>
     </p>
    
     <p>
       <label for="rating">Rating:</label>
       <select id="rating" v-model.number="rating">
         <option>5</option>
         <option>4</option>
         <option>3</option>
         <option>2</option>
         <option>1</option>
       </select>
     </p>

     <p>
       <label>Would you recommend this product?</label>
       <div>
           <label>
               <input class="radio" type="radio" name="recommendation" value="yes" v-model="isRecommended"> Yes
           </label>
           <label>
               <input class="radio" type="radio" name="recommendation" value="no" v-model="isRecommended"> No
           </label>
       </div>
     </p>
    
     <p>
       <input type="submit" value="Submit"> 
     </p>
    </form>
 `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            isRecommended: null,
            errors: [],
        }
    },
    methods: {
        onSubmit() {
            this.errors = [];

            if(!this.name) this.errors.push("Name required.")
            if(!this.review) this.errors.push("Review required.")
            if(this.rating === null) this.errors.push("Rating required.")

            if(this.errors.length === 0) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommended: this.isRecommended === 'yes'
                }

                eventBus.$emit('review-submitted', productReview)

                this.name = null
                this.review = null
                this.rating = null
                this.isRecommended = null
            }
        }
    },
})

Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: false
        },
        shipping: {
            type: [String, Number],
            required: false
        }
    },
    template: `
     <div>   
       <ul>
         <span class="tab"
               :class="{ activeTab: selectedTab === tab }"
               v-for="(tab, index) in tabs"
               @click="selectedTab = tab"
         >{{ tab }}</span>
       </ul>
       <div v-show="selectedTab === 'Reviews'">
         <p v-if="!reviews.length">There are no reviews yet.</p>
         <ul>
           <li v-for="review in reviews">
           <h2>{{ review.name }}</h2>
           <p>Rating: {{ review.rating }}</p>
           <p>{{ review.review }}</p>
           <p>{{ (review.recommended ? '' : 'no ') + 'recommend' }}</p>
           </li>
         </ul>
       </div>
       <div v-show="selectedTab === 'Make a Review'">
         <product-review @review-submitted="addReview"></product-review>
       </div>
       <div v-show="selectedTab === 'Shipping'">
            <p>Shipping: {{ shipping ? '2.99' : 'Free'}}</p>
       </div>
       <div v-show="selectedTab === 'Details'">
            <product-details></product-details>
       </div>
     </div>

`,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review', 'Shipping', 'Details'],
            selectedTab: 'Reviews'
        }
    },
    methods: {
        addReview(productReview) {
            this.$emit('review-submitted', productReview)
        }
    }
})

let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: [],
        reviews: JSON.parse(localStorage.getItem('reviews')) || [],
    },
    computed: {
        shipping() {
            if (this.premium) {
                return "Free";
            } else {
                return 2.99
            }
        }
    },
    methods: {
        updateCart(id) {
            this.cart.push(id);
        },
        removeFromCart() {
            if (this.cart.length) this.cart.pop()
        },
        addReview(productReview) {
            this.reviews.push(productReview)
        },
    }
})