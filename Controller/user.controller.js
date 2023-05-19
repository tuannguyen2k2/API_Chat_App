const userModel = require('../Models/User.model');
const fs = require('fs')
const blob = require('based-blob');
const storage = require('../Storage/storage')
module.exports.findAll = async (req, res, next)=>{
    let UID = req.body.UID;
    let friends = [];

    try {
        await userModel.findOne({ _id: UID }).then(user=>{
            friends = user.friendlist
        })
        console.log(friends)
        const users = await userModel.find({});
        let userList = []
        users.forEach(user => {
            if(user.id != UID){
                let fr = true
                if(!friends.includes(user.id)){
                    fr = false
                }
                userList.push({
                    _id: user.id,
                    username: user.username,
                    avatar: user.avatar,
                    friendship: fr 
                })
              
            }
        })
        res.send({
            status: "success",
            message:"successfull",
            friendlist: userList
        })
    } catch (error) {
        res.status(500).send(error);
    }
}



module.exports.getListContact = async (req, res, next)=>{
    let userID = req.body.userID;
    userModel.findOne({_id: userID}).then(async users => {
        if(users){
            return res.status(200).json({
                status: 'success',
                message:'Successful',
                friendlist: await userModel.find({_id: {$in: users['friendlist']}}, {username: 1, avatar: 1})
            })
        }        
        return res.json({
            status: 'error'
        })
    })
}
module.exports.addFriend = async (req,res,next) => {
    let userID = req.body.userId;
    userModel.findOne({_id: userID}).then(async users => {
        if(users.friendlist.includes(req.body.friendId)) {
            users.friendlist.pull(req.body.friendId);
            await users.save();
            return res.status(200).json({
                status: 'success',
                message:'Friend removed'
            });
        }
        try{
            users.friendlist.push(req.body.friendId);
            await users.save();
            res.status(200).json({
                status: 'success',
                message: 'Success addfriend'
            })
        }catch(error){
            res.status(500).send(error)
        }
    })
}
module.exports.uploadAvatar = async (req,res,next) => {
    if(!req.file) {
        return res.status(400).send("Error: No files found")
    } 

    const blob = storage.bucket.file(req.file.originalname)
    
    const blobWriter = blob.createWriteStream({
        metadata: {
            contentType: req.file.mimetype
        }
    })
    
    blobWriter.on('error', (err) => {
        console.log(err)
    })
    let urlAvatar;
    await blob.getSignedUrl({
        action: 'read',
        expires: '03-09-2491'
      }).then(signedUrls => {
        urlAvatar = signedUrls.toString();
      })
    userModel.findOneAndUpdate({_id: req.body.userID},{$set:{avatar: urlAvatar}}, {new: true}).then((err,doc) =>{
            if (err) {
                console.log("Something wrong when updating data!");
                console.log(err)
            }
        console.log(doc);
        
    })
    blobWriter.on('finish', () => {
        res.status(200).send("File uploaded.")
    })
    blobWriter.end(req.file.buffer)
}






// router.get('/user/:userId',async (req, res, next)=>{
//     userModel.findOne({_id: req.params.userId}).then(user => {
//         if(user){
//             return res.status(200).json({
//                 status: 'success',
//                 message:'Successful',
//                 user
//             })
//         }        
//         return res.json({
//             status: 'error'
//         })
//     })
// })

// router.post('user/profiles/upload_image', async (req, res, next)=>{
//     let formidable = require('formidable')
// })