import { BikeSize, CanyonTypes } from "../enum";

export const config = (size: BikeSize) => ({
  al: {
    size,
    name: CanyonTypes.canyonEnduranceAl,
    url: process.env.ENDURANCE_AL_URL,
  },
  cf: {
    size,
    name: CanyonTypes.canyonEnduranceCf,
    url: process.env.ENDURANCE_CF_URL,
  },
});
