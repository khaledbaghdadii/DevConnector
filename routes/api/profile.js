const express = require("express");
const router = express.Router();
//@route    GET api/profile/test
//@desc     tests profile route
//@access   public access
router.get("/test",(req,res)=>{
    res.json({msg:"Profile workss"});
});

module.exports=router;