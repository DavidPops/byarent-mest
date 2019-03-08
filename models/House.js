const mongoose = require('mongoose');  //Node.js ORM
mongoose.Promise = global.Promise; // use the promise object available on the global object as shown in the console.
const slug = require('slugs');

const houseSchema = new mongoose.Schema({
	item_name: {
		type: String,
		trim: true,
		required: 'Enter a name for the house!!!'
	},
	description: {
		type: String,
		trim: true
	},
	price: {
		type: Number,
		required: 'Enter a price for the house!!!'
	},
	photo: String,
	slug: String,
	author: {
    	type: mongoose.Schema.ObjectId,
    	ref: 'User',
    	required: 'You must supply an author'
  	}
});

houseSchema.pre('save', async function (next) {
	if (!this.isModified('item_name')) {
		return next();
	}
	this.slug = slug(this.item_name);

	const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
	const housesWithSlug = await this.constructor.find({ slug: slugRegEx });
	
	if (housesWithSlug.length) {
		this.slug = `${this.slug}-${housesWithSlug.length + 1}`;
	}
	next();
})

module.exports = mongoose.model('House', houseSchema);