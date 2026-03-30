import InstitutionProfile from "../models/InstitutionProfile.js";


export const getAllInstitutions = async (req, res) => {
  try {
    const institutions = await InstitutionProfile
      .find()
      .populate("user", "name email");

    res.json({ institutions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// export const getInstitutionData = async (req, res) => {

//     try{
//   const institution = await InstitutionProfile.findOne({ user: req.user.id }).populate("user","name email");
//   //or we can use .select("iinstitutuionName institutionType") rakhda ni hunxa muni ko nagari kana
//   if(!institution){
//     return res.status(404).json({message:"Institution not found"})
//   }
// //esle chai whole data nai pathauxa
// //hamle esma insituton ko individual data like
// // res.json({ institutionName: institution.institutuionName, institutionType: institution.institutionType})
// // vanera aafnai chailyeko data matra lida hunxa
//   res.json({institution})
// }
// catch(error){
//     console.error(error)
//     return res.status(500).json({message:"Internal server error"})
        
// }
// };
