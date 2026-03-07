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

            <product-details></product-details>
            <p>Shipping: {{ shipping }}</p>
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
                <button @click="removeFromCart">Remove from cart</button>
            </div>
        </div>
        
        <div>
          <h2>Reviews</h2>
         
    <div v-if="typeof reviews !== 'undefined' && reviews.length > 0">
          <h2>Reviews</h2>
          <ul>
            <li v-for="(review, index) in reviews" :key="index">
                <p>Name: {{ review.name }}</p>
                <p>Rating: {{ review.rating }}</p>
                <p>Review: {{ review.review }}</p>
                <p v-if="review.recommended !== undefined">
                    Recommended: {{ review.recommended ? 'Yes' : 'No' }}
                </p>
            </li>
          </ul>
    </div>
    <div v-else-if="typeof reviews !== 'undefined'">
        <p>There are no reviews yet.</p>
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
            link: "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks",
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

                this.$emit('review-submitted', productReview)

                this.name = null
                this.review = null
                this.rating = null
                this.isRecommended = null
            }
        }
    },
})

let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: [],
        reviews: []
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