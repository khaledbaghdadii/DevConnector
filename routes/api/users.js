const express = require("express");
const router = express.Router();
//@route    GET api/users/test
//@desc     tests users route
//@access   public access
router.get("/test",(req,res)=>{
    res.json({msg:"Users workss"});
});

module.exports=router;