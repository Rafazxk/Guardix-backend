import multer from "multer";

const storage = multer.diskStorage({
  
   destination: function(req,file,cb){
     cb(null,"uploads/");
   },
   fileName: function(req,file,cb){
     cb(null, Date.now() + "-" + file.originalname); 
   }
});

export default multer({ storage });