import InstitutionProfile from "../models/InstitutionProfile.js";
import Application from "../models/Application.js";

export const getInstitutionData = async (req, res) => {
  try {
    const institution = await InstitutionProfile.findOne({
      user: req.user.id,
    }).populate("user", "name email");
    //or we can use .select("iinstitutuionName institutionType") rakhda ni hunxa muni ko nagari kana
    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }
    //esle chai whole data nai pathauxa
    //hamle esma insituton ko individual data like
    // res.json({ institutionName: institution.institutuionName, institutionType: institution.institutionType})
    // vanera aafnai chailyeko data matra lida hunxa
    res.json({ institution });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getApplicationData = async (req, res) => {
  try {
    //suru ma student le apply garnu vanda aagadi institution ko data liyo
    const insititution = await InstitutionProfile.findOne({
      user: req.user.id,
    });
    //ani tesma hamle application ma jasle jasle thicha tesko institution id khojera lyako
    const application = await Application.findOne({
      insititution: insititution._id,
      //student ko remaining data aaba lyaera halney
    }).populate("student");
    //ani frontend ko ma pathaune

    res.json(application);
  } catch (error) {
    return res.status(400).json({
      message: console.message,
    });
  }
};
