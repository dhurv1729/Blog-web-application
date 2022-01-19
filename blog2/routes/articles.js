const express = require('express');
const Article = require("./../models/article")
const multer = require('multer');
const path = require('path');
const uploadModel = require('./../models/upload');
const { resolveSoa } = require('dns');

const {marked} = require('marked')
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const router = express.Router();

router.use(express.static('public'));

var Storage = multer.diskStorage({
    destination: './public/uploads',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
})

var upload = multer({
    storage: Storage
}).single('file');

router.post('/upload', upload, async (req, res) => {
    var imageFile = req.file.filename

    var imageDetail = new uploadModel({
        imageName: imageFile
    })

    try {
        await imageDetail.save();
        res.redirect('/articles/new');
    } catch (error) {
        console.log('error.message');
    }

})

router.post('/upload/:id', upload, async (req, res) => {
    var imageFile = req.file.filename

    var imageDetail = new uploadModel({
        imageName: imageFile
    })

    try {
        await imageDetail.save();
        res.redirect(`/articles/edit/${req.params.id}`);
    } catch (error) {
        console.log('error.message');
    }

})

router.post('/preview', (req, res) => {
    let article = new Article({
        title: req.body.title,
        description: req.body.description,
        markdown: req.body.markdown,
    })
    article.sanitizedHtml = DOMPurify.sanitize(marked.parse(req.body.markdown))

    res.render('articles/preview', {article : article})
})

router.get('/new', async (req, res) => {
    const urls = await uploadModel.find();
    await uploadModel.deleteMany({});
    res.render('articles/new', {article : new Article(), urls:urls});
})

router.get('/:id', async (req, res) => {

    const article = await Article.findById(req.params.id);
    if(article == null) res.redirect('/');
    res.render('articles/show', {article: article});

})

router.get('/edit/:id', async (req, res) => {
    const urls = await uploadModel.find();
    await uploadModel.deleteMany({});
    const article = await Article.findById(req.params.id);
    res.render('articles/edit', {article : article, urls:urls});
})

router.post('/', async (req, res) => {
    let article = new Article({
        title: req.body.title,
        description: req.body.description,
        markdown: req.body.markdown
    })

    try {
        article = await article.save();
        res.redirect(`/articles/${article.id}`);
    } catch (error) {
        console.log(error);
        res.render('articles/new', {article: article});
    }

})

router.put('/:id', async (req, res) => {

    let article = await Article.findById(req.params.id);
    article.title = req.body.title,
    article.description = req.body.description,
    article.markdown = req.body.markdown
    

    try {
        article = await article.save();
        res.redirect(`/articles/${article.id}`);
    } catch (error) {
        console.log(error);
        res.render('articles/edit', {article: article});
    }
})

router.delete('/:id', async (req, res) => {
    await Article.findByIdAndDelete(req.params.id);
    res.redirect('/');
})

module.exports = router;