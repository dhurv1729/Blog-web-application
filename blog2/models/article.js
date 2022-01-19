const mongoose = require('mongoose')
const {marked} = require('marked')
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    markdown: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    sanitizedHtml: {
        type: String,
        required: true
    }
})

articleSchema.pre('validate', function(next){
    if (this.markdown) {
        this.sanitizedHtml = DOMPurify.sanitize(marked.parse(this.markdown));
        // console.log(sanitizedHtml);
      }
    next();
})

module.exports = mongoose.model('Article', articleSchema);



