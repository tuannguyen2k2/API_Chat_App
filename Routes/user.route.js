const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
const users = require('../Controller/user.controller')
var multer  =   require('multer');
router.use(bodyParser.urlencoded(
    {
        extended: true
    }
))

router.post('/user', users.findAll)

router.post(['/user/friends', '/user/contacts'], users.getListContact)

router.post('/user/addfriend',users.addFriend)

const upload = multer({
    storage: multer.memoryStorage()
})
router.post('/user/profile/upload_image',upload.single('image'),users.uploadAvatar)

module.exports = router

